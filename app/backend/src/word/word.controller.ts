import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { WordService } from './word.service';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';

@Controller('word')
export class WordController {
  constructor(private readonly wordService: WordService) {}

  @Post()
  create(@Body() createWordDto: CreateWordDto) {
    return this.wordService.create(createWordDto);
  }

  @Post('multiple')
  createWords(@Body() createWordsDto: CreateWordDto[]) {
    return this.wordService.createWords(createWordsDto);
  }

  @Get()
  findAll(@Query('experimentId') experimentId: number, 
    @Query('page') page?:number, 
    @Query('pageSize') pageSize?:number,
    @Query('withResult') withResult?:string) {
    return this.wordService.findAllFromExperimentAndCount(experimentId, withResult, page, pageSize);
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wordService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWordDto: UpdateWordDto,
  ) {
    return this.wordService.update(+id, updateWordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wordService.remove(+id);
  }

}
