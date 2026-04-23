import api from './axios';
import { Notification, PaginatedResponse } from '@/types';

export const notificationsApi = {
  // Listar notificações do usuário
  findAll: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Notification>> => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  // Marcar notificação como lida
  markAsRead: async (id: string): Promise<Notification> => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  // Marcar todas como lidas
  markAllAsRead: async (): Promise<{ count: number }> => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },
};
