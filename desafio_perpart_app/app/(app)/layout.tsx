'use client';

import { LayoutProvider } from '@uigovpe/components';
import { RoleProvider } from '@/context/RoleContext';

/**
 * Layout das rotas protegidas (/(app)).
 *
 * - LayoutProvider: aplica o template backoffice (sidebar + header) do UI-GovPE.
 * - RoleProvider: disponibiliza `useRole()` para todos os componentes filhos,
 *   permitindo controle fino de permissões (ADMIN vs USER).
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider breakpoint={900} template="backoffice">
      <RoleProvider>{children}</RoleProvider>
    </LayoutProvider>
  );
}
