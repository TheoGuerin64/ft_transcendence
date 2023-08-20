import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
    credentials: true,
  });
  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();
