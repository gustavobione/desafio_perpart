import api from './axios';
import type { AuthResponse } from '@/types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

/**
 * Faz login com email e senha.
 * Retorna o token JWT e os dados do usuário.
 */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', payload);
  return data;
}

/**
 * Registra um novo usuário público (role USER).
 * Retorna o token JWT e os dados do usuário criado.
 */
export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', payload);
  return data;
}

/**
 * Retorna o perfil do usuário autenticado.
 */
export async function getMe(): Promise<AuthResponse['user']> {
  const { data } = await api.get<AuthResponse['user']>('/auth/me');
  return data;
}
