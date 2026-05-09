import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Recycle } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/components/useColorScheme';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (!loaded) return;
    // Oculta splash nativo → muestra BrandedSplash 1.2s → carga la app
    SplashScreen.hideAsync().then(() => {
      setTimeout(() => setReady(true), 2000);
    });
  }, [loaded]);

  if (!loaded || !ready) return <BrandedSplash />;

  return <RootLayoutNav />;
}

function BrandedSplash() {
  return (
    <View style={splash.container}>
      <View style={splash.logoWrap}>
        <Recycle size={48} color="#fff" />
      </View>
      <Text style={splash.title}>SOMOS R</Text>
      <Text style={splash.subtitle}>Reciclaje inteligente para Usme</Text>
    </View>
  );
}

const splash = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 6,
  },
});

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen
          name="identificar-material"
          options={{
            title: 'Identificar Material',
            headerStyle: { backgroundColor: '#fff' },
            headerTintColor: '#111827',
            headerShadowVisible: false,
            headerBackTitle: 'Volver',
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
