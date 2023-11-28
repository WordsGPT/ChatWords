import { Module } from '@nestjs/common';
import { ExperimentService } from './experiment.service';
import { ExperimentController } from './experiment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExperimentEntity } from './entities/experiment.entity';
import { WordModule } from 'src/word/word.module';
import { PromptModule } from 'src/prompt/prompt.module';
import { PromptEntity } from 'src/prompt/entities/prompt.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([ExperimentEntity, PromptEntity]), WordModule, PromptModule, HttpModule],
  controllers: [ExperimentController],
  providers: [ExperimentService],
})
export class ExperimentModule {}