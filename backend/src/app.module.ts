import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExperimentModule } from './experiment/experiment.module';
import { WordModule } from './word/word.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    TypeOrmModule.forRoot({
    type: "sqlite",
    database: "db.sqlite",
    synchronize: true,
    logging: true,
    entities: [__dirname + "/**/*.entity{.ts,.js}"],
    migrations: [],
    }),
  ExperimentModule,
  WordModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
