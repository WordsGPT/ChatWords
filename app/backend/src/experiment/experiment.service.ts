import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateExperimentDto } from './dto/create-experiment.dto';
import { UpdateExperimentDto } from './dto/update-experiment.dto';
import { ExperimentEntity } from './entities/experiment.entity';
import { In, Repository } from 'typeorm';
import { spawn } from 'child_process';
import { join } from 'path';
import * as ExcelJS from 'exceljs';
import { WordService } from 'src/word/word.service';
import { PromptEntity } from 'src/prompt/entities/prompt.entity';

import OpenAI from 'openai';
import { UpdateWordDto } from 'src/word/dto/update-word.dto';

import { map } from 'rxjs/operators';

@Injectable()
export class ExperimentService {

  private proxyUrl = process.env.PROXY_URI
  private openai = new OpenAI({
    apiKey: process.env.PROXY_MASTER_KEY,
    baseURL: this.proxyUrl
  });

  constructor(
    @InjectRepository(ExperimentEntity)
    private readonly experimentRepository: Repository<ExperimentEntity>,
    @Inject(WordService)
    private readonly wordService: WordService,
    @InjectRepository(PromptEntity)
    private readonly promptRepository: Repository<PromptEntity>,
    private readonly httpService: HttpService
  ) {}


  async create(createExperimentDto: CreateExperimentDto): Promise<ExperimentEntity> {
    let experiment = new ExperimentEntity();
    experiment.name = createExperimentDto.name;
    experiment.model = createExperimentDto.model;
    experiment.program = createExperimentDto.program;
    experiment.configuration = createExperimentDto.configuration;
    const promptsIds = createExperimentDto.promptsIds;
    experiment.prompts = await this.promptRepository.findBy({ id: In(promptsIds) })
    const newExperiment = await this.experimentRepository.save(experiment);
    return newExperiment;
  }

  findAll() {
    return this.experimentRepository.find({order: {id: "DESC"}});
  }

  findOne(id: number) {
    return this.experimentRepository.findOne({where: {id: id}, relations: ["prompts"]});
  }

  /** GET available models from the proxy */
  queryToProxy(query: string) {
    return this.httpService.get(this.proxyUrl + query).pipe(
      map(response => response.data))
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
    if (experiment.program == 'proxy') {
      this.runProxy(id, experiment)
      experiment.status = 1;
      return await this.experimentRepository.save(experiment);
    }
    else {
      return await this.runPython(id, experiment)
    }
  }
  /*
  async runProxy (id:string, experiment:ExperimentEntity) {
    try {
      const prompts = [];
      experiment.prompts.forEach((element) => {
        prompts.push(element.content)
      })
      const words = await this.wordService.findAllFromExperiment(experiment.id)
      experiment.status = 1;
      await this.experimentRepository.save(experiment);
      for (const word of words) {
        if (word.result == null) {
          const result = await this.queryProxy(word.name, prompts, experiment.model);
          await this.wordService.update(word.id, { result } as UpdateWordDto);
        }
      }
      experiment.status = 3;
      await this.experimentRepository.save(experiment);
    } catch (error) {
      console.log(error);
      return this.error(id, experiment);
    }
  }
  */
  async runProxy (id:string, experiment:ExperimentEntity) {
    try {
      const prompts = [];
      experiment.prompts.forEach((element) => {
        prompts.push(element.content)
      })
      const words = await this.wordService.findAllFromExperiment(experiment.id)
      experiment.status = 1;
      await this.experimentRepository.save(experiment);
      for (const word of words) {
        if((await this.findOne(+experiment.id)).status == 1) {
          if (word.result == null) {
            const result = await this.queryProxy(word.name, prompts, experiment.model);
            await this.wordService.update(word.id, { result } as UpdateWordDto);
          }
        }
        else {
          break
        }
      }
      if ((await this.findOne(+experiment.id)).status == 1) {
        experiment.status = 3;
        await this.experimentRepository.save(experiment);
      }
    } catch (error) {
      console.log(error);
      return this.error(id, experiment);
    }
  }

  createQueryforProxy(word: string, prompt: string): string {
    const result = prompt.replace(/<word>/g, '"'+word+'"');
    return result;
  }

  async queryProxy(word: string, prompts: string[], model: string) {
    const results = {};
    for (const element of prompts) {
      const question = this.createQueryforProxy(word, element)
      const chatCompletion = await this.openai.chat.completions.create({
        messages: [{ role: 'user', content: question }],
        model: model,
      });
      results[element] = chatCompletion.choices[0].message.content;
    }
    return results
  }
    
  async runPython (id:string, experiment:ExperimentEntity) {
    try {
      const pythonExecutable = '/usr/bin/python3.11';
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
