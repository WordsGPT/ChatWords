import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateExperimentDto } from './dto/create-experiment.dto';
import { UpdateExperimentDto } from './dto/update-experiment.dto';
import { ExperimentEntity } from './entities/experiment.entity';
import { Repository } from 'typeorm';
import { spawn } from 'child_process';
import { join } from 'path';


@Injectable()
export class ExperimentService {
  constructor(
    @InjectRepository(ExperimentEntity)
    private readonly experimentRepository: Repository<ExperimentEntity>,
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

  run (id:string, experiment:ExperimentEntity) {
    const pythonExecutable = 'python';
    const scriptPath = join(__dirname,`../../../programs/${experiment.program}`);
    const args = [scriptPath, id];
    const process = spawn(pythonExecutable, args, {
      detached: true,
      stdio: ['ignore'],
    });
    process.unref();
    }
  }

