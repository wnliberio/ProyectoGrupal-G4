/*Muestra avatar con inicial, nombre y email.
   Ofrece acciones de cerrar sesión y eliminar cuenta (ambas usan logout).
    Usa useSafeAreaInsets y estilos para layout.
     Incluye mensajes de confirmación y navegación de regreso a login.
*/

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, LogOut, Trash2 } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/src/contexts/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  // ═══════════════════════════════════════════════════════════════════════
  // FUNCIÓN: Cerrar Sesión
  // ═══════════════════════════════════════════════════════════════════════
  const handleLogout = async (): Promise<void> => {
    console.log('handleLogout iniciado');
    
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          onPress: () => {
            console.log('Logout cancelado');
          },
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          onPress: async () => {
            try {
              console.log('Ejecutando logout...');
              
              // Ejecutar logout
              await logout();
              
              console.log('Logout exitoso');
              
              // Redirigir a login
              router.replace('/(auth)/login');
              
            } catch (error) {
              console.error('Error en logout:', error);
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // FUNCIÓN: Eliminar Cuenta
  // ═══════════════════════════════════════════════════════════════════════
  const handleDeleteAccount = async (): Promise<void> => {
    console.log('🗑️ handleDeleteAccount iniciado');
    
    Alert.alert(
      'Eliminar Cuenta',
      '¿Estás seguro? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          onPress: () => {
            console.log('Eliminación cancelada');
          },
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              console.log('Eliminando cuenta...');
              
              // Ejecutar logout
              await logout();
              
              console.log('Cuenta eliminada');
              
              // Redirigir a login
              router.replace('/(auth)/login');
              
            } catch (error) {
              console.error('Error al eliminar:', error);
              Alert.alert('Error', 'No se pudo eliminar la cuenta');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const userEmail = user?.email || 'email@example.com';
  const userName = user?.name || 'Usuario';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { borderBottomColor: colors.border, paddingTop: insets.top },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Perfil</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
      >
        {/* Profile Avatar */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: '#a855f7' }]}>
            <Text style={styles.avatarText}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>
            {userName}
          </Text>
          <Text style={[styles.userEmail, { color: colors.muted }]}>
            {userEmail}
          </Text>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Configuración de Cuenta
          </Text>

          <TouchableOpacity
            style={[
              styles.settingItem,
              { backgroundColor: colors.inputBackground },
            ]}
          >
            <View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Email
              </Text>
              <Text style={[styles.settingValue, { color: colors.muted }]}>
                {userEmail}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.settingItem,
              { backgroundColor: colors.inputBackground },
            ]}
          >
            <View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Nombre
              </Text>
              <Text style={[styles.settingValue, { color: colors.muted }]}>
                {userName}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Acciones
          </Text>

          {/* Logout Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: '#3b82f6' },
            ]}
            onPress={handleLogout}
          >
            <LogOut size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>

          {/* Delete Account Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: '#ef4444' },
            ]}
            onPress={handleDeleteAccount}
          >
            <Trash2 size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Eliminar Cuenta</Text>
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <View style={styles.versionInfo}>
          <Text style={[styles.versionText, { color: colors.muted }]}>
            DocChat AI v1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 12,
  },
  actionButton: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  versionInfo: {
    alignItems: 'center',
    marginTop: 32,
    paddingVertical: 16,
  },
  versionText: {
    fontSize: 12,
  },
});