import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import "reflect-metadata";

const port: number = Number(process.env.BACKEND_PORT) || 3000

async function bootstrap() {

  const app = await NestFactory.create(AppModule, 
    { cors: true,
      logger: ['error', 'warn']
    });
  await app.listen(port);
  console.log(`Server listening on ${port}`)
}
bootstrap();
