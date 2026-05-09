import { useRouter } from 'expo-router';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
      <Text className="text-4xl mb-4">🔐</Text>
      <Text className="text-xl font-bold text-gray-800 text-center">Iniciar Sesión</Text>
      <Text className="text-sm text-gray-500 text-center mt-2">
        La pantalla de login estará disponible próximamente.
      </Text>
      <TouchableOpacity onPress={() => router.back()} className="mt-6 bg-primary-600 px-6 py-3 rounded-xl">
        <Text className="text-white font-semibold">Volver</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
