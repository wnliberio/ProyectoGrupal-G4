// 📁 CARPETA: src/hooks/
// 📄 ARCHIVO: useFetchWithAuth.ts

import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';

export const useFetchWithAuth = () => {
  const { logout } = useAuth();

  const fetchWithAuth = useCallback(
    async (url: string, options: RequestInit = {}) => {
      try {
        const token = await AsyncStorage.getItem('authToken');

        if (!token) {
          console.warn('❌ No hay token disponible');
          await logout();
          throw new Error('No hay sesión activa');
        }

        console.log('🔐 Token encontrado, haciendo request a:', url);

        const response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('📡 Respuesta recibida:', response.status);

        // ❌ ERROR 401 = Token expirado o inválido
        if (response.status === 401) {
          console.warn('⚠️  Sesión expirada (Error 401)');
          await logout();
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }

        // ❌ Otros errores
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Error ${response.status}`);
        }

        // ✅ Éxito
        console.log('✅ Request exitoso');
        return response;

      } catch (error) {
        console.error('❌ Error en fetchWithAuth:', error);
        throw error;
      }
    },
    [logout]
  );

  return { fetchWithAuth };
};