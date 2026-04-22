import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator para extrair o usuário autenticado da requisição.
 * Uso: @CurrentUser() user nos parâmetros do método do controller.
 * O user vem do payload do JWT após o JwtStrategy.validate().
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Se passar um campo específico, retorna só aquele campo
    // Ex: @CurrentUser('userId') userId: string
    if (data) {
      return user?.[data];
    }

    return user;
  },
);
