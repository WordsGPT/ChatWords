import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExperimentModule } from './experiment/experiment.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: "sqlite",
    database: "db.sqlite",
    synchronize: true,
    logging: true,
    entities: [__dirname + "/**/*.entity{.ts,.js}"],
    migrations: [],
    }),
  ExperimentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
