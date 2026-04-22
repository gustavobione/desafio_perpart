
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API Desafio PERPART')
    .setDescription('API do desafio PERPART. Esta API é uma solução completa para gerenciar usuarios, categorias e produtos, com endpoints RESTful para criar, ler, atualizar e deletar recursos. O projeto é composto por uma API RESTful com NestJS e um Frontend com Next.js, ambos utilizando Prisma para interagir com o banco de dados.')
    .setVersion('1.0')
    .addTag('Users')
    .addTag('Products')
    .addTag('Categories')
    .addTag('Auth')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
