import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { AuditService } from '../audit.service';
import { JwtPayload } from '../../types';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();
    const method = req.method;

    // Intercepta apenas ações de modificação (POST, PATCH, PUT, DELETE)
    // POST para /auth/login e /auth/register tem tratamento manual nos services
    if (
      ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method) &&
      !req.url.includes('/auth/')
    ) {
      return next.handle().pipe(
        tap((data: unknown) => {
          // data contém a resposta enviada ao cliente (pode ter o id da entidade criada/atualizada)
          const user = req.user;
          if (user) {
            let action = 'UNKNOWN';
            if (method === 'POST') action = 'CREATE';
            if (method === 'PATCH' || method === 'PUT') action = 'UPDATE';
            if (method === 'DELETE') action = 'DELETE';

            // Extrai a entidade a partir da URL (ex: /products -> PRODUCT)
            const entityMatch = req.url.split('/')[1];
            const entity = entityMatch ? entityMatch.toUpperCase() : 'UNKNOWN';

            // Tenta achar o ID na resposta ou nos parâmetros
            const responseData = data as Record<string, unknown> | null;
            const entityId =
              (responseData?.id as string | undefined) ||
              (req.params?.id as string | undefined) ||
              null;

            // Envia para log assincronamente (sem aguardar para não travar a req)
            this.auditService
              .log({
                userId: user.userId,
                action,
                entity,
                entityId,
                details: {
                  endpoint: req.url,
                  method: req.method,
                  body: req.body as Record<string, unknown>,
                },
              })
              .catch((err: unknown) =>
                console.error('Erro ao salvar audit log:', err),
              );
          }
        }),
      );
    }

    return next.handle();
  }
}
