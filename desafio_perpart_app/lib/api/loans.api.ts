import api from './axios';
import { Loan, PaginatedResponse } from '@/types';

export const loansApi = {
  // Listar empréstimos
  findAll: async (params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResponse<Loan>> => {
    const response = await api.get('/loans', { params });
    return response.data;
  },

  // Buscar empréstimo por ID
  findOne: async (id: string): Promise<Loan> => {
    const response = await api.get(`/loans/${id}`);
    return response.data;
  },

  // Criar solicitação de empréstimo
  create: async (data: { productId: string; expectedReturnDate: string }): Promise<Loan> => {
    const response = await api.post('/loans', data);
    return response.data;
  },

  // Aprovar empréstimo (Dono do produto ou Admin)
  approve: async (id: string): Promise<Loan> => {
    const response = await api.patch(`/loans/${id}/approve`);
    return response.data;
  },

  // Devolver jogo (Locatário)
  returnGame: async (id: string): Promise<Loan> => {
    const response = await api.patch(`/loans/${id}/return`);
    return response.data;
  },
};
