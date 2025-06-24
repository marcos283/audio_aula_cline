import axios from 'axios';

// Configuración base de axios
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token de autenticación a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Tipos
export interface RecordingResponse {
  id: string;
  date: string;
  duration: string;
  audioUrl: string;
  transcription?: string;
  status: 'processing' | 'completed' | 'error';
}

export interface ProcessingResult {
  transcription: string;
  analysis: {
    students: {
      name: string;
      content: string;
      category: string;
      actions?: string;
    }[];
  };
}

// Servicios de API
export const recordingsApi = {
  // Obtener todas las grabaciones
  getAll: async (): Promise<RecordingResponse[]> => {
    const response = await api.get('/recordings');
    return response.data;
  },

  // Obtener una grabación específica
  getById: async (id: string): Promise<RecordingResponse> => {
    const response = await api.get(`/recordings/${id}`);
    return response.data;
  },

  // Subir una nueva grabación
  upload: async (audioBlob: Blob): Promise<RecordingResponse> => {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    
    const response = await api.post('/recordings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Procesar una grabación (transcripción y análisis)
  process: async (id: string): Promise<ProcessingResult> => {
    const response = await api.post(`/recordings/process`, { id });
    return response.data;
  },
};

export const authApi = {
  // Iniciar sesión con Google
  loginWithGoogle: async (): Promise<{ token: string; user: any }> => {
    // Esta función se implementará con Firebase Auth
    throw new Error('No implementado aún');
  },

  // Cerrar sesión
  logout: async (): Promise<void> => {
    // Esta función se implementará con Firebase Auth
    localStorage.removeItem('authToken');
  },
};

export default api;
