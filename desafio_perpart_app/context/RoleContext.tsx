'use client';

import { createContext, useContext } from 'react';
import { useAuthStore } from '@/store/auth.store';
import type { Role } from '@/types';

interface RoleContextType {
  role: Role | null;
  isAdmin: boolean;
  isUser: boolean;
  /**
   * Verifica se o usuário atual tem permissão para uma ação.
   * ADMIN tem acesso a tudo. USER só acessa suas próprias ações.
   *
   * @param requiredRole - Role mínima necessária para a ação.
   */
  can: (requiredRole: Role) => boolean;
}

const RoleContext = createContext<RoleContextType>({
  role: null,
  isAdmin: false,
  isUser: false,
  can: () => false,
});

/**
 * RoleProvider: lê o papel (role) do usuário logado via Zustand e disponibiliza
 * utilitários de permissão para qualquer componente dentro das rotas protegidas.
 *
 * Deve ser colocado apenas dentro do (app)/layout.tsx.
 */
export function RoleProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const role = user?.role ?? null;

  const value: RoleContextType = {
    role,
    isAdmin: role === 'ADMIN',
    isUser: role === 'USER',
    /**
     * ADMIN pode tudo.
     * USER só pode ações que requerem role USER.
     */
    can: (requiredRole: Role) =>
      role === 'ADMIN' || role === requiredRole,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

/**
 * Hook para consumir as permissões do usuário em qualquer componente.
 *
 * Exemplos de uso:
 *   const { isAdmin } = useRole();
 *   const { can } = useRole();
 *   if (can('ADMIN')) { mostrar botão de excluir }
 */
export const useRole = () => useContext(RoleContext);
