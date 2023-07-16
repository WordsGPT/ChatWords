import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import "reflect-metadata";

const port: number = 3000

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  await app.listen(port);
  console.log(`Server listening on ${port}`)
}
bootstrap();
