import api from './axios';
import { Product, PaginatedResponse } from '@/types';

export const productsApi = {
  // Listar produtos
  findAll: async (params?: { page?: number; limit?: number; status?: string; categoryId?: string; search?: string }): Promise<PaginatedResponse<Product>> => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Listar produtos favoritos do usuário
  getFavorites: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Product>> => {
    const response = await api.get('/products/favorites', { params });
    return response.data;
  },

  // Buscar produto por ID
  findOne: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Criar produto
  create: async (data: Partial<Product> & { categoryIds?: string[] }): Promise<Product> => {
    const response = await api.post('/products', data);
    return response.data;
  },

  // Atualizar produto
  update: async (id: string, data: Partial<Product> & { categoryIds?: string[] }): Promise<Product> => {
    const response = await api.patch(`/products/${id}`, data);
    return response.data;
  },

  // Remover produto
  remove: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  // Favoritar produto
  favorite: async (id: string): Promise<void> => {
    await api.post(`/products/${id}/favorite`);
  },

  // Desfavoritar produto
  unfavorite: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}/favorite`);
  },
};
