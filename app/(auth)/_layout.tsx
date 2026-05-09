import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="register-ciudadano" options={{ headerShown: true, title: 'Registro Ciudadano', headerBackTitle: 'Volver' }} />
      <Stack.Screen name="register-reciclador" options={{ headerShown: true, title: 'Registro Reciclador', headerBackTitle: 'Volver' }} />
    </Stack>
  );
}
