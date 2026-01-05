// 📁 DIRECTORIO: config/
// 📄 ARCHIVO: environment.ts

export const ENV = {
  // Backend URLs
  BACKEND_URL: process.env.EXPO_PUBLIC_BACKEND_URL,
  BACKEND_API_AUTH: process.env.EXPO_PUBLIC_BACKEND_API_AUTH,
  
  // Environment
  IS_DEVELOPMENT: process.env.EXPO_PUBLIC_ENV === 'development',
  IS_PRODUCTION: process.env.EXPO_PUBLIC_ENV === 'production',
  
  // API Endpoints
  API_ENDPOINTS: {
    LOGIN: '/login',
    REGISTER: '/register',
    PROFILE: '/profile',
    LOGOUT: '/logout',
  },
};

// Función helper para construir URLs de auth
export const getAuthUrl = (endpoint: string): string => {
  return `${ENV.BACKEND_API_AUTH}${endpoint}`;
};

// Función helper para construir URLs de API general
export const getApiUrl = (endpoint: string): string => {
  return `${ENV.BACKEND_URL}${endpoint}`;
};

// Debug: Mostrar configuración en desarrollo
if (ENV.IS_DEVELOPMENT) {
  console.log('🔧 Configuración cargada:', {
    BACKEND_URL: ENV.BACKEND_URL,
    BACKEND_API_AUTH: ENV.BACKEND_API_AUTH,
    ENV: process.env.EXPO_PUBLIC_ENV,
  });
}