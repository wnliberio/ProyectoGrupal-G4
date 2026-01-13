// _layout.tsx
//AuthProvider wrapper + Stack Navigation correcta

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