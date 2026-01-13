//login.tsx
/* Implementa la pantalla de inicio de sesión simple. 
     Muestra un formulario para ingresar email o nombre, valida que no esté vacío, 
      ejecuta login del contexto de autenticación y luego redirige al chat. 
        También adapta colores al tema claro/oscuro y define estilos de UI.*/

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router'; //Permite navegar entre pantallas con el router.
import { useAuth } from '@/src/contexts/AuthContext'; //Hook de autenticación para ejecutar login
import { Colors } from '@/constants/Colors'; //Colores para tema claro/oscuro.

export default function LoginScreen() {   //Declara el componente de la pantalla de login
  const router = useRouter();             //Declara el componente de la pantalla de login
  const { login } = useAuth();             //Obtiene la función login del contexto de auth.
  const [email, setEmail] = useState('');   //Estado para guardar lo que escribe el usuario (email o nombre).
  const [isLoading, setIsLoading] = useState(false);   //Estado para indicar si está cargando el login
  const colorScheme = useColorScheme();   //Obtiene el tema del dispositivo (dark/light).
  const isDark = colorScheme === 'dark';  //Determina si el tema actual es oscuro
  const colors = isDark ? Colors.dark : Colors.light;  //Selecciona paleta de colores según tema.

  const handleContinue = async () => {     //Define la función al presionar “Continuar”.
    if (!email.trim()) {
      alert('Ingresa un email o nombre');  //Si el campo está vacío, muestra alert y sale de la función.
      return;
    }

    setIsLoading(true);  //Activa el estado de carga
    try {
      await login(email, 'dummy');  //Ejecuta login(email,'dummy');usa contraseña dummy porque es solo testing
      router.replace('/(chat)/index');  //Navega al chat principal después del login.
    } catch (error) {
      alert('Error al continuar');  //Si falla el login, muestra un alert de error
    } finally {
      setIsLoading(false);  //En cualquier caso, desactiva el estado de carga.
    }
  };

  return (     //Inicia el render del JSX
    <View style={[styles.container, { backgroundColor: colors.background }]}>  {/* Contenedor principal con color de fondo según tema*/}
      <View style={styles.content}>                                            {/*Contenedor interno para el contenido centrado*/}
        <Text style={[styles.title, { color: colors.text }]}>Chat PDF</Text>   {/*Título y subtítulo del login (nombre y descripción)*/}
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Chatea con tus documentos
        </Text>

        <View style={styles.form}>                    {/*Contenedor del formulario.*/}
          <Text style={[styles.label, { color: colors.text }]}>Email o nombre</Text>   {/*Etiqueta del campo*/}
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.inputBackground, color: colors.text },
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