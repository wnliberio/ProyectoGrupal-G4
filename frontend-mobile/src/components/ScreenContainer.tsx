import React from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  useWindowDimensions,
  Platform,
  StatusBar,
} from 'react-native';

type Props = {
  children: React.ReactNode;
  center?: boolean;
};

export default function ScreenContainer({ children, center = false }: Props) {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width * 0.96, 420);
  const paddingTop = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 12) : 12;

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop }]}> 
      <View
        style={[
          styles.container,
          { width: contentWidth, paddingHorizontal: Math.max(12, width * 0.03) },
          center && styles.center,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
  },
  center: {
    justifyContent: 'center',
  },
});
