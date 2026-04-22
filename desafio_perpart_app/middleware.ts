import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de proteção de rotas.
 *
 * Rotas públicas: /login, /register
 * Rotas protegidas: tudo dentro de /(app) — qualquer rota não pública
 *
 * Lógica:
 * - Sem token + rota protegida → redireciona para /login
 * - Com token + rota de auth → redireciona para /dashboard
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isPublicAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/public');

  // Ignora assets estáticos
  if (isPublicAsset) return NextResponse.next();

  // Usuário autenticado tentando acessar login/register → vai para dashboard
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Usuário NÃO autenticado tentando acessar rota protegida → vai para login
  if (!token && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Aplica o middleware em todas as rotas, exceto arquivos estáticos do Next.js
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
