// app/(auth)/_layout.tsx
// _layout.tsx
/*Define el layout de navegación del grupo de rutas de autenticación.
     Configura un Stack de expo-router sin header visible 
         y registra la pantalla login. Es el contenedor que organiza las pantallas de auth.
*/

// Stack correcta para rutas de autenticación
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
    </Stack>
  );
}