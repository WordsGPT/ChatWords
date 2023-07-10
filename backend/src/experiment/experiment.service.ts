import { Injectable } from '@nestjs/common';
import { CreateExperimentDto } from './dto/create-experiment.dto';
import { UpdateExperimentDto } from './dto/update-experiment.dto';

@Injectable()
export class ExperimentService {
  create(createExperimentDto: CreateExperimentDto) {
    return 'This action adds a new experiment';
  }

  findAll() {
    return `This action returns all experiment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} experiment`;
  }

  update(id: number, updateExperimentDto: UpdateExperimentDto) {
    return `This action updates a #${id} experiment`;
  }

  remove(id: number) {
    return `This action removes a #${id} experiment`;
  }
}
