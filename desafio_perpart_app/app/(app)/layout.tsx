'use client';

import { LayoutProvider } from '@uigovpe/components';

/**
 * Layout das rotas protegidas (/(app)).
 *
 * O LayoutProvider com template='backoffice' aplica o layout de sidebar + header
 * do UI-GovPE apenas para as páginas autenticadas.
 *
 * As páginas de login/register ficam no grupo (auth) e NÃO herdam este layout.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider breakpoint={900} template="backoffice">
      {children}
    </LayoutProvider>
  );
}
