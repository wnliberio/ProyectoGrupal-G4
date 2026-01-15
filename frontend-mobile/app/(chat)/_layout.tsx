// app/(chat)/_layout.tsx
// _layout.tsx
/*Define el layout de navegación del grupo (chat) usando expo-router. 
   Crea un Stack sin header y registra las pantallas index y chat dentro del flujo de chat.
*/
import { Stack } from 'expo-router';

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="chat" />
    </Stack>
  );
}