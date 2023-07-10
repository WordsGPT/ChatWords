import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import "reflect-metadata";
import { AppDataSource } from './data-source'

const port: number = 3000

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  await app.listen(port);
  console.log(`Server listening on ${port}`)
  AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })
}
bootstrap();
