import { Module } from '@nestjs/common';
import { ExperimentService } from './experiment.service';
import { ExperimentController } from './experiment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExperimentEntity } from './entities/experiment.entity';
import { WordModule } from 'src/word/word.module';
@Module({
  imports: [TypeOrmModule.forFeature([ExperimentEntity]), WordModule],
  controllers: [ExperimentController],
  providers: [ExperimentService],
})
export class ExperimentModule {}
