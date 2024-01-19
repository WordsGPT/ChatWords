import { Module } from '@nestjs/common';
import { ExperimentModule } from './experiment/experiment.module';
import { WordModule } from './word/word.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { ConfigModule } from '@nestjs/config';
import { PromptModule } from './prompt/prompt.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: join(__dirname, '../../', '.env'),
      isGlobal: true
    }),
    ServeStaticModule.forRoot({
      serveRoot: '/docs',
      rootPath: join(__dirname, '..', 'public'),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public/frontend'),
    }),
    DatabaseModule,
    ExperimentModule,
    WordModule,
    AuthModule,
    UsersModule,
    PromptModule
  ],
  controllers: [],
  providers: [  {
    provide: APP_GUARD,
    useClass: AuthGuard,
  }],
})
export class AppModule {}
