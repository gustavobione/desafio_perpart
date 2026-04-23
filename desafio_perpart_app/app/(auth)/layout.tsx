'use client';

import { GovBar } from '@uigovpe/components';

/**
 * Layout das páginas de autenticação (login/register).
 * Inclui o GovBar estático (sem backoffice) no topo.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GovBar />
      {children}
    </>
  );
}
