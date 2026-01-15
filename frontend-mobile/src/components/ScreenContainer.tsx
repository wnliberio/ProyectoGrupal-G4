import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  View,
  useColorScheme,
  StatusBar,
} from 'react-native';
import { Colors } from '@/constants/Colors';

type ScreenContainerProps = {
  children: React.ReactNode;
  withKeyboard?: boolean;
};

export default function ScreenContainer({
  children,
  withKeyboard = false,
}: ScreenContainerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const topPadding = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 24;

  const Content = (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.outer}>
        <View
          style={[
            styles.phoneFrame,
            { backgroundColor: colors.background, paddingTop: topPadding },
          ]}
        >
          {children}
        </View>
      </View>
    </SafeAreaView>
  );

  if (withKeyboard) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {Content}
      </KeyboardAvoidingView>
    );
  }

  return Content;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  // Fondo exterior (desktop/web)
  outer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Marco tipo teléfono
  phoneFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 420,          // 📱 ancho móvil
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0px 10px 30px rgba(0,0,0,0.15)',
      },
    }),
  },
});
