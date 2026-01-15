import { Tabs } from 'expo-router';
import { FileText, TrashIcon, User } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

export default function ChatLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          height: 64,
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: '#a855f7',
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 6,
        },
      }}
    >
      {/* DOCUMENTOS */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Documentos',
          tabBarIcon: ({ color, size }) => (
            <FileText color={color} size={size} />
          ),
        }}
      />

      {/* PERFIL */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size} />
          ),
        }}
      />

      {/* PAPELERA */}
      <Tabs.Screen
        name="trash"
        options={{
          title: 'Papelera',
          tabBarIcon: ({ color, size }) => (
            <TrashIcon color={color} size={size} />
          ),
        }}
      />

      {/* CHAT OCULTO (MUY IMPORTANTE) */}
      <Tabs.Screen
        name="chat"
        options={{
          href: null, // 👈 OCULTA COMPLETAMENTE LA PESTAÑA
        }}
      />
    </Tabs>
  );
}
