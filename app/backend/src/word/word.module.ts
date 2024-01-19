import { Module } from '@nestjs/common';
import { WordService } from './word.service';
import { WordController } from './word.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WordEntity } from './entities/word.entity';
import { ExperimentEntity } from 'src/experiment/entities/experiment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WordEntity, ExperimentEntity])],
  controllers: [WordController],
  providers: [WordService],
  exports: [WordService]
})
export class WordModule {}
