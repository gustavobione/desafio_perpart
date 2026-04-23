import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Arquivos estáticos: serve a pasta /uploads como rota pública /uploads/*
  app.useStaticAssets(path.join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  // Segurança: Headers HTTP seguros
  // crossOriginResourcePolicy: 'cross-origin' permite que o frontend (porta 3001)
  // carregue imagens servidas pela API (porta 3000) sem ser bloqueado pelo browser
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Segurança: Validação global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS: Permite requisições do frontend
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Swagger: Documentação da API
  const config = new DocumentBuilder()
    .setTitle('API — Aluguel de Jogos de Tabuleiro')
    .setDescription(
      'API RESTful para gerenciamento de aluguel de jogos de tabuleiro físicos. ' +
        'Sistema completo com autenticação JWT, CRUD de usuários/produtos/categorias, ' +
        'sistema de empréstimos, favoritos, auditoria e notificações em tempo real.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Insira o token JWT',
        in: 'header',
      },
      'access-token',
    )
    .addTag('Auth', 'Endpoints de autenticação (login e registro)')
    .addTag('Users', 'Gerenciamento de usuários')
    .addTag('Products', 'Gerenciamento de jogos de tabuleiro (produtos)')
    .addTag('Categories', 'Gerenciamento de categorias de jogos')
    .addTag('Loans', 'Sistema de empréstimo/aluguel de jogos')
    .addTag('Notifications', 'Notificações do sistema')
    .addTag('Audit', 'Logs de auditoria do sistema')
    .addTag('Upload', 'Upload de arquivos (imagens)')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🎲 API rodando em http://localhost:${port}`);
  console.log(`📖 Swagger disponível em http://localhost:${port}/api`);
}
bootstrap().catch((err) => console.error(err));
