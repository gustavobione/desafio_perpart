import api from './axios';
import { AuditLog, PaginatedResponse } from '@/types';

export interface AuditReportData {
  totalUsers: number;
  totalProducts: number;
  totalLoans: number;
  activeLoans: number;
  overdueLoans: number;
  logsByAction: Array<{ action: string; count: number }>;
  logsByDate: Array<{ date: string; count: number }>;
}

export const auditApi = {
  // Listar logs de auditoria
  findAll: async (params?: { 
    page?: number; 
    limit?: number; 
    action?: string; 
    entity?: string; 
    userId?: string; 
    startDate?: string; 
    endDate?: string; 
  }): Promise<PaginatedResponse<AuditLog>> => {
    const response = await api.get('/audit', { params });
    return response.data;
  },

  // Obter relatório
  getReport: async (params?: { startDate?: string; endDate?: string }): Promise<AuditReportData> => {
    const response = await api.get('/audit/report', { params });
    return response.data;
  },
};
