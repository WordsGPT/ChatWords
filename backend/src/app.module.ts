import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExperimentModule } from './experiment/experiment.module';

@Module({
  imports: [ExperimentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
