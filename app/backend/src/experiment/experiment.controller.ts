import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ExperimentService } from './experiment.service';
import { CreateExperimentDto } from './dto/create-experiment.dto';
import { UpdateExperimentDto } from './dto/update-experiment.dto';
import { createReadStream } from 'fs';
import { Response } from 'express';

@Controller('experiment')
export class ExperimentController {
  constructor(private readonly experimentService: ExperimentService) {}

  @Post()
  create(@Body() createExperimentDto: CreateExperimentDto) {
    return this.experimentService.create(createExperimentDto);
  }

  @Get()
  findAll() {
    return this.experimentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.experimentService.findOne(+id);
  }

  @Get('models/:query')
  queryToProxy(@Param('query') query){
    return this.experimentService.queryToProxy("/models/" + query);
  }

  @Post('run/:id')
  async run(@Param('id') id: string) {
    const experiment = await this.experimentService.findOne(+id);
    return await this.experimentService.run(id, experiment);
  }

  @Post('stop/:id')
  async stop(@Param('id') id: string) {
    const experiment = await this.experimentService.findOne(+id);
    return await this.experimentService.stop(id, experiment);
  }
  
  @Post('error/:id')
  async error(@Param('id') id: string) {
    const experiment = await this.experimentService.findOne(+id);
    return await this.experimentService.error(id, experiment);
  }

  @Get('generateExcel/:id')
  async generateExcel(@Param('id') id: string) {
    try {
      const [filepath, filename] = await this.experimentService.generateExcel(+id);
      return({filename})
    } catch (error) {
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExperimentDto: UpdateExperimentDto,
  ) {
    return this.experimentService.update(+id, updateExperimentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.experimentService.remove(+id);
  }
}
