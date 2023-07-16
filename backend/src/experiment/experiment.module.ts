import { Module } from '@nestjs/common';
import { ExperimentService } from './experiment.service';
import { ExperimentController } from './experiment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExperimentEntity } from './entities/experiment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExperimentEntity])],
  controllers: [ExperimentController],
  providers: [ExperimentService],
})
export class ExperimentModule {}
