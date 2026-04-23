import api from './axios';
import { User, PaginatedResponse } from '@/types';

export const usersApi = {
  // Obter perfil do usuário logado
  getMe: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Listar usuários (Admin)
  findAll: async (params?: { page?: number; limit?: number; role?: string; search?: string }): Promise<PaginatedResponse<User>> => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Buscar usuário por ID (Admin)
  findOne: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Criar usuário (Admin)
  create: async (data: Partial<User>): Promise<User> => {
    const response = await api.post('/users', data);
    return response.data;
  },

  // Atualizar usuário
  update: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },

  // Remover usuário (Admin)
  remove: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
