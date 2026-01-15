import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';

function RootLayoutNav() {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    // Solo navegar si ya estamos montados y hay cambios de estado
    const timer = setTimeout(() => {
      if (isAuthenticated && inAuthGroup) {
        router.replace('/(chat)');
      } else if (!isAuthenticated && !inAuthGroup) {
        router.replace('/(auth)/login');
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [isAuthenticated, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(chat)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}