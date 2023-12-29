import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Suspense, useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider, Text, Theme } from 'tamagui';

import { AuthProvider } from './authProvider';
import { Router } from './components/Router';
import config from './tamagui.config';

export default function Layout() {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <TamaguiProvider config={config}>
          <Suspense fallback={<Text>Loading...</Text>}>
            <Theme name={colorScheme}>
              <ThemeProvider
                value={colorScheme === 'light' ? DefaultTheme : DarkTheme}>
                <Router />
              </ThemeProvider>
            </Theme>
          </Suspense>
          <StatusBar />
        </TamaguiProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
