import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateExperimentDto } from './dto/create-experiment.dto';
import { UpdateExperimentDto } from './dto/update-experiment.dto';
import { ExperimentEntity } from './entities/experiment.entity';
import { Repository } from 'typeorm';
import { spawn } from 'child_process';
import { join } from 'path';
import * as ExcelJS from 'exceljs';
import { WordService } from 'src/word/word.service';



@Injectable()
export class ExperimentService {
  constructor(
    @InjectRepository(ExperimentEntity)
    private readonly experimentRepository: Repository<ExperimentEntity>,
    @Inject(WordService)
    private readonly wordService: WordService,
  ) {}


  async create(createExperimentDto: CreateExperimentDto): Promise<ExperimentEntity> {
    let experiment = new ExperimentEntity();
    experiment.name = createExperimentDto.name;
    experiment.model = createExperimentDto.model;
    experiment.version = createExperimentDto.version;
    experiment.program = createExperimentDto.program;
    experiment.configuration = createExperimentDto.configuration;
    const newExperiment = await this.experimentRepository.save(experiment); 
    return newExperiment;
  }

  findAll() {
    return this.experimentRepository.find();
  }

  findOne(id: number) {
    return this.experimentRepository.findOneBy({id});
  }

  update(id: number, updateExperimentDto: UpdateExperimentDto) {
    return `This action updates a #${id} experiment`;
  }

  async remove(id: number) {
    return await this.experimentRepository.delete(id);
  }

  generateHeader(keys: Array<string>): Array<{header: string, key: string}> {
    return keys.map(key => ({header:key, key:key}))
  }

  async generateExcel(id: number) {
      try {
   
        const experiment = await this.experimentRepository.findOneBy({id});
    
        const workbook = new ExcelJS.Workbook();
        const experimentSheet = workbook.addWorksheet('Experiment');
        const wordsSheet = workbook.addWorksheet('Words');

        const experimentKeys = ['name', 'program', ...Object.keys(experiment.configuration || {})]
        const experimentHeader = this.generateHeader(experimentKeys)
        experimentSheet.columns = experimentHeader;

        experimentSheet.addRow({
          'name': experiment.name,
          'program': experiment.program,
          ...experiment.configuration
        })

        const exampleOfWord = (await this.wordService.findAllFromExperimentAndCount(id, 'true', 1, 1))[0][0]
        const wordKeys = ['word', ...Object.keys(exampleOfWord?.result || {})]
        const wordHeader = this.generateHeader(wordKeys)
        wordsSheet.columns = wordHeader;

        const numberOfWords = (await this.wordService.findAllFromExperimentAndCount(id, 'all', 1, 1))[1]
        const pageSize = 500;
        const numberOfPages = Math.ceil(numberOfWords/pageSize)
        for (let page = 1; page <= numberOfPages; page ++) {
          const words = (await this.wordService.findAllFromExperimentAndCount(id, 'all', page, pageSize))[0]
          const wordRows = words.map(word => ({
            'word': word.name,
            ...word.result
          }))

          wordsSheet.addRows(wordRows)
        }
        
        const path = join(__dirname, '../..', 'public')
        const excelName = `${experiment.name}.xlsx`;
        const filepath = join(path, excelName)
        await workbook.xlsx.writeFile(filepath);
    
        console.log('File generated: ', filepath);
        return [filepath, excelName]
    
      } catch (error) {
        console.error('Error in the file generation:', error);
      }    
  }

  async run (id:string, experiment:ExperimentEntity) {
    try {
      const pythonExecutable = 'python';
      const scriptPath = join(__dirname,`../../../programs/${experiment.program}/index.py`);
      const args = [scriptPath, id];
      const process = spawn(pythonExecutable, args, {
        detached: true,
        stdio: ['ignore'],
      });
      // process.unref();
      process.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('\nStdout:', output);
    });
    
    // Reading stderr
    process.stderr.on('data', (data) => {
      const errorOutput = data.toString();
      console.error('\nStderr:', errorOutput);
    });
    
    // Handle process completion
    process.on('close', (code) => {
      if (code === 0) {
        console.log('\nChild process exited successfully.');
      } else {
        console.error(`\nChild process exited with code ${code}.`);
      }
    });
      experiment.status = 1;
      return await this.experimentRepository.save(experiment);
    } catch (error) {
      console.log(error)
      return this.error(id, experiment)

    }
  }

  async stop (id:string, experiment:ExperimentEntity) {
    experiment.status = 0;
    return await this.experimentRepository.save(experiment);
    }

  async error (id:string, experiment:ExperimentEntity) {
    experiment.status = 2;
    return await this.experimentRepository.save(experiment);
    }
  

  }
