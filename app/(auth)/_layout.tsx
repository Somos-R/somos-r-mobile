import { Stack } from 'expo-router';

const headerOpts = {
  headerStyle: { backgroundColor: '#fff' },
  headerTintColor: '#111827',
  headerShadowVisible: false,
  headerBackTitle: 'Volver',
};

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" options={{ ...headerOpts, headerShown: true, title: 'Iniciar sesión' }} />
      <Stack.Screen name="register-select" options={{ ...headerOpts, headerShown: true, title: 'Crear cuenta' }} />
      <Stack.Screen name="register-ciudadano" options={{ ...headerOpts, headerShown: true, title: 'Registro Ciudadano' }} />
      <Stack.Screen name="register-reciclador" options={{ ...headerOpts, headerShown: true, title: 'Registro Reciclador' }} />
    </Stack>
  );
}
