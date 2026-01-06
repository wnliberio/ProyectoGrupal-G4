import axios from 'axios';
import Constants from 'expo-constants';

// Obtener ambiente de app.json
const ENV = Constants.expoConfig?.extra?.ENV || 'dev';


const BACKEND_URLS: Record<string, string> = {
  dev: 'http://54.161.26.130:8000',
  prod: 'http://54.221.47.189:8000',
};
const BACKEND_URL = BACKEND_URLS[ENV];


const apiClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 15000,
});

export const documentsAPI = {
  upload: async (userId: string, fileUri: string, fileName: string) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        type: 'application/pdf',
        name: fileName,
      } as any);
      const response = await apiClient.post(
        `/documents/upload?user_id=${userId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al subir documento'
      );
    }
  },
  list: async (userId: string) => {
    try {
      const response = await apiClient.get(`/documents?user_id=${userId}`);
      return response.data.documents || [];
    } catch (error: any) {
      return [];
    }
  },
  delete: async (userId: string, documentId: string) => {
    try {
      const response = await apiClient.delete(
        `/documents/${documentId}?user_id=${userId}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al eliminar documento'
      );
    }
  },
};


export const chatAPI = {
  send: async (userId: string, documentId: string, message: string) => {
    try {
      const response = await apiClient.post('/chat', {
        user_id: userId,
        document_id: documentId,
        message: message,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error en el chat'
      );
    }
  },
  getHistory: async (userId: string, documentId: string) => {
    try {
      const response = await apiClient.get('/chat/history', {
        params: {
          user_id: userId,
          document_id: documentId,
        },
      });
      return response.data || [];
    } catch (error: any) {
      return [];
    }
  },
};

export default apiClient;