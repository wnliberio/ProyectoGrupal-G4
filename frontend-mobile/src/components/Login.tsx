// 📁 DIRECTORIO: src/components/Login.tsx
// 📄 ARCHIVO: Login.tsx
// 🔧 VERSIÓN CORREGIDA: Errores de casteo Boolean a String eliminados

import React, { useState, useEffect } from "react";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  useColorScheme,
} from "react-native";
import { Mail, Lock, MessageSquare } from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

export function Login({ onLogin }: LoginProps) {
  // Google Auth
  WebBrowser.maybeCompleteAuthSession();
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "294903193009-v92aa5i8jnauvaiqhv1mig4i3dufg14a.apps.googleusercontent.com",
    webClientId:
      "294903193009-hk7ilc3fhklnbjm3jge76slo1h2beabc.apps.googleusercontent.com",
    // iosClientId: 'iOS_CLIENT_ID',
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      // manejar el token de Google: authentication.accessToken
    }
  }, [response]);
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("123456");
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    setIsLoading(true);
    try {
      await onLogin(email, password);
    } catch (error) {
      Alert.alert("Error", "Fallo en el login. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={styles.content}>
        {/* Logo */}
        <View style={[styles.logoContainer, { backgroundColor: "#a855f7" }]}>
          <MessageSquare size={40} color="#fff" />
        </View>

        {/* Título */}
        <Text style={[styles.title, { color: colors.text }]}>DocChat AI</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Chatea con tus documentos
        </Text>

        {/* Formulario */}
        <View style={styles.form}>
          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Correo electrónico
            </Text>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: colors.inputBackground },
              ]}
            >
              <Mail size={20} color={colors.muted} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="tu@email.com"
                placeholderTextColor={colors.muted}
                value={email}
                onChangeText={setEmail}
                editable={!isLoading}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Contraseña
            </Text>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: colors.inputBackground },
              ]}
            >
              <Lock size={20} color={colors.muted} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="••••••••"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Botón Login */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              isLoading && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          {/* Botón Login con Google */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              { backgroundColor: "#4285F4", marginTop: 12 },
            ]}
            disabled={!request}
            onPress={() => promptAsync()}
          >
            <Text style={styles.loginButtonText}>Iniciar con Google</Text>
          </TouchableOpacity>

          {/* Info */}
          <Text style={[styles.info, { color: colors.muted }]}>
            Modo prototipo: usa cualquier credencial para acceder
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: "center",
  },
  form: {
    width: "100%",
    maxWidth: 320,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  loginButton: {
    height: 48,
    borderRadius: 16,
    backgroundColor: "#a855f7",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  info: {
    fontSize: 12,
    marginTop: 20,
    textAlign: "center",
  },
});
