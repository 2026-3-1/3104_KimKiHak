import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(process.cwd(), 'public'));

  // 보안 헤더
  app.use(helmet());

  // CORS: 허용 출처는 환경변수로 관리
  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173').split(',');
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // 전역 ValidationPipe: DTO class-validator 적용, 에러 stack 숨김
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Ingang API')
    .setDescription('Ingang backend API docs')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
