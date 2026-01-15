import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
import ScreenContainer from '@/src/components/ScreenContainer'; // 👈 NUEVO

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const handleContinue = async () => {
    const value = email.trim().toLowerCase();
    if (!value) {
      alert('Ingresa tu cuenta Gmail');
      return;
    }

    // validar formato básico y dominio gmail
    const gmailRegex = /^[^\s@]+@gmail\.com$/i;
    if (!gmailRegex.test(value)) {
      alert('Sólo se permite iniciar sesión con una cuenta Gmail (ej: usuario@gmail.com)');
      return;
    }

    setIsLoading(true);
    try {
      await login(value, 'dummy');
      router.replace('/(chat)');
    } catch (error) {
      alert('Error al continuar');
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer withKeyboard>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            Chat PDF
          </Text>

          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Chatea con tus documentos
          </Text>

          <View style={styles.form}>
            <Text style={[styles.label, { color: colors.text }]}>
              Email
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                },
              ]}
              placeholder="tu@email.com"
              placeholderTextColor={colors.muted}
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[
                styles.button,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleContinue}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Cargando...' : 'Continuar'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.note, { color: colors.muted }]}>
            No se requiere autenticacion para testing
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
  },
  form: {
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#a855f7',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    textAlign: 'center',
  },
});
