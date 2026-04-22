import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

/**
 * Página raiz: redireciona o usuário baseado no token.
 * - Com token → vai para /dashboard
 * - Sem token → vai para /login
 */
export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token');

  if (token) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
