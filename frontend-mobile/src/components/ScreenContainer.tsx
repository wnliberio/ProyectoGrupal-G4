import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
} from 'react-native';

type ScreenContainerProps = {
  children: React.ReactNode;
  withKeyboard?: boolean; // 👈 AQUÍ SE DEFINE
};

export default function ScreenContainer({
  children,
  withKeyboard = false,
}: ScreenContainerProps) {
  if (withKeyboard) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={styles.container}>
          {children}
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
