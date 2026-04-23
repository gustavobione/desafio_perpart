import api from './axios';

export const uploadApi = {
  // Fazer upload de uma imagem para um produto específico
  uploadProductImage: async (productId: string, file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/upload/product/${productId}`, formData, {
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
    
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    return `${baseUrl}/${path.replace(/^\//, '')}`;
  }
};
