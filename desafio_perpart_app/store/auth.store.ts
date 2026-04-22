import { create } from 'zustand';
import Cookies from 'js-cookie';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  /** Chamado após login/register bem-sucedido */
  setAuth: (token: string, user: User) => void;

  /** Limpa a sessão do usuário */
  logout: () => void;

  /** Inicializa o estado a partir do cookie (chamado no layout raiz) */
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (token, user) => {
    // Salva o token em cookie (expira em 1 dia, igual ao JWT da API)
    Cookies.set('access_token', token, { expires: 1, sameSite: 'strict' });
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    Cookies.remove('access_token');
    set({ token: null, user: null, isAuthenticated: false });
  },

  initialize: () => {
    const token = Cookies.get('access_token');
    if (token) {
      // Token existe: marca como autenticado (o user será carregado sob demanda)
      set({ token, isAuthenticated: true });
    }
  },
}));
