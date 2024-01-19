import {
    Controller,
    Get,
    Req,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
  } from '@nestjs/common';
import { PromptService } from './prompt.service';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';
import { Request } from 'express'
import { PromptEntity } from './entities/prompt.entity';

@Controller('prompt')
export class PromptController {

  constructor(private readonly promptService: PromptService) {}

  @Post()
  create(@Body() createPromptDto: CreatePromptDto) {
    return this.promptService.create(createPromptDto);
  }

  @Get()
  findAll(): Promise<PromptEntity[]> {
    return this.promptService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promptService.findOne(+id);
  }

  @Delete(":ids")
  remove(@Param('ids') ids: string) {
    const idArray = ids.split(",");
    return this.promptService.removeMany(idArray);
  }

}
