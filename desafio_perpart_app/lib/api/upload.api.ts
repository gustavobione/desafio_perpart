import api from './axios';

export const uploadApi = {
  // Fazer upload de um arquivo
  uploadFile: async (file: File): Promise<{ filename: string; originalname: string; path: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Retorna a URL completa para uma imagem na API
  getImageUrl: (path: string | null): string => {
    if (!path) return '';
    if (path.startsWith('http')) return path; // Já é uma URL completa
    
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
    return `${baseUrl}/${path.replace(/^\//, '')}`;
  }
};
