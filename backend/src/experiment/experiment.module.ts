import { Module } from '@nestjs/common';
import { ExperimentService } from './experiment.service';
import { ExperimentController } from './experiment.controller';

@Module({
  controllers: [ExperimentController],
  providers: [ExperimentService],
})
export class ExperimentModule {}
