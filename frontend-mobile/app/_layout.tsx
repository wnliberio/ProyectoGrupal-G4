/*Define el layout raíz de toda la app móvil:
   Envuelve la navegación dentro de AuthProvider para que el estado de autenticación esté disponible globalmente.
     Configura un Stack sin header visible.
       Registra los grupos de rutas (auth) y (chat) y también la ruta de fallback +not-found.
         Es el punto central de navegación y contexto de autenticación.
*/
import { Stack } from 'expo-router';
import { AuthProvider } from '@/src/contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(chat)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </AuthProvider>
  );
}