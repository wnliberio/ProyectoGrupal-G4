// 📁 DIRECTORIO: app/(auth)/_layout.tsx
// 📄 ARCHIVO: _layout.tsx
// 🔧 CORRECCIÓN: Stack correcta para rutas de autenticación

import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
    </Stack>
  );
}