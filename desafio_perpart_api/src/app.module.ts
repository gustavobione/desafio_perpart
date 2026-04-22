import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { join } from 'path';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { UploadModule } from './upload/upload.module';
import { AuditModule } from './audit/audit.module';
import { LoansModule } from './loans/loans.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditInterceptor } from './audit/interceptors/audit.interceptor';

@Module({
  imports: [
    // Configuração global de variáveis de ambiente
    ConfigModule.forRoot({ isGlobal: true }),

    // Rate Limiting: Proteção contra ataques de força bruta e DDoS
    // Limite: 100 requisições por IP a cada 60 segundos
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Agendador de tarefas (Cronjobs)
    ScheduleModule.forRoot(),

    // Servir arquivos estáticos (uploads de imagens)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // Módulos da aplicação
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    UploadModule,
    AuditModule,
    LoansModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Aplica o ThrottlerGuard globalmente em todas as rotas
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Aplica o AuditInterceptor globalmente
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
