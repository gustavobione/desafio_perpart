import api from './axios';
import { Category, PaginatedResponse } from '@/types';

export const categoriesApi = {
  // Listar categorias
  findAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Category>> => {
    const response = await api.get('/categories', { params });
    return response.data;
  },

  // Buscar categoria por ID
  findOne: async (id: string): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Criar categoria
  create: async (data: { name: string }): Promise<Category> => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  // Atualizar categoria
  update: async (id: string, data: { name: string }): Promise<Category> => {
    const response = await api.patch(`/categories/${id}`, data);
    return response.data;
  },

  // Remover categoria
  remove: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
