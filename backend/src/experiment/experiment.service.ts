import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateExperimentDto } from './dto/create-experiment.dto';
import { UpdateExperimentDto } from './dto/update-experiment.dto';
import { ExperimentEntity } from './entities/experiment.entity';
import { Repository } from 'typeorm';

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
    experiment.configuration = createExperimentDto.configuration;
    const newExperiment = await this.experimentRepository.save(experiment); 
    console.log(newExperiment)
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
}
