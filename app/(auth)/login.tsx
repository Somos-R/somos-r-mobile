import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, LogIn } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/stores/authStore';
import type { BackendUser } from '@/types/auth.types';

const schema = z.object({
  email: z.string().email('Email inválido'),
  contrasena: z.string().min(1, 'Ingresa tu contraseña'),
});

type FormData = z.infer<typeof schema>;

function parseJwtPayload(token: string): { sub?: string; user_type_code?: string } {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
}

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const loginResp = await apiClient.post('/auth/login', {
        email: data.email,
        password: data.contrasena,
      });

      const token: string = loginResp.data.access_token;
      const { sub } = parseJwtPayload(token);

      if (!sub) throw new Error('Token inválido');

      const userResp = await apiClient.get(`/users/${sub}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user: BackendUser = userResp.data;
      setAuth(user, token);
      router.replace('/(tabs)');
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 401) {
        Alert.alert('Credenciales incorrectas', 'Verifica tu email y contraseña.');
      } else {
        const msg = error?.response?.data?.detail ?? 'Ocurrió un error. Intenta de nuevo.';
        Alert.alert('Error', msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-gray-500 text-sm mb-8">
            Ingresa tus credenciales para continuar.
          </Text>

          <Field label="Email" error={errors.email?.message}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={inputClass(!!errors.email)}
                  placeholder="tucorreo@ejemplo.com"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              )}
            />
          </Field>

          <Field label="Contraseña" error={errors.contrasena?.message}>
            <View className="relative">
              <Controller
                control={control}
                name="contrasena"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={inputClass(!!errors.contrasena)}
                    placeholder="Tu contraseña"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry={!showPass}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit(onSubmit)}
                  />
                )}
              />
              <TouchableOpacity
                onPress={() => setShowPass((p) => !p)}
                style={{ position: 'absolute', right: 14, top: 12 }}
              >
                {showPass ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
              </TouchableOpacity>
            </View>
          </Field>

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid || loading}
            className={`rounded-2xl py-4 items-center flex-row justify-center gap-2 mt-2 ${
              isValid && !loading ? 'bg-primary-600' : 'bg-gray-200'
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <LogIn size={18} color={isValid ? '#fff' : '#9ca3af'} />
                <Text className={`font-bold text-base ${isValid ? 'text-white' : 'text-gray-400'}`}>
                  Iniciar sesión
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} className="items-center mt-4 py-2">
            <Text className="text-gray-500 text-sm">¿No tienes cuenta? Regístrate</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-gray-700 mb-1.5">{label}</Text>
      {children}
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
}

function inputClass(hasError: boolean) {
  return `bg-gray-50 border rounded-xl px-4 py-3 text-gray-900 text-sm ${
    hasError ? 'border-red-400' : 'border-gray-200'
  }`;
}
