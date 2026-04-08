import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');

  app.enableCors();
  // Ativa a validação automática em todos os endpoints com base nos DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // remove parâmetros extras não documentados no DTO
    transform: true, 
  }));

  const config = new DocumentBuilder()
    .setTitle('Data Bridge Integrator API')
    .setDescription('API for managing database integrations and ETL processes between heterogeneous systems.')
    .setVersion('1.0')
    .addTag('integrations')
    .addTag('connections')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
