import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
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

import LocationPicker from '@/components/auth/LocationPicker';
import apiClient from '@/lib/apiClient';
import { isInsideCoverage } from '@/lib/usmeCoverage';
import { useAuthStore } from '@/stores/authStore';
import type { BackendUser } from '@/types/auth.types';

const schema = z
  .object({
    nombre: z.string().min(2, 'Ingresa tu nombre completo'),
    cedula: z
      .string()
      .min(6, 'Mínimo 6 dígitos')
      .max(10, 'Máximo 10 dígitos')
      .regex(/^\d+$/, 'Solo dígitos'),
    email: z.string().email('Email inválido'),
    telefono: z
      .string()
      .length(10, 'El teléfono debe tener 10 dígitos')
      .regex(/^\d+$/, 'Solo dígitos'),
    direccion: z.string().min(5, 'Ingresa tu dirección'),
    contrasena: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmarContrasena: z.string(),
    aceptaTerminos: z.boolean().refine((v) => v, 'Debes aceptar los términos'),
  })
  .refine((d) => d.contrasena === d.confirmarContrasena, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarContrasena'],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterCiudadanoScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { aceptaTerminos: false },
  });

  function handleLocation(lat: number, lng: number, address: string) {
    setCoords({ lat, lng });
    setValue('direccion', address, { shouldValidate: true });

    if (!isInsideCoverage(lat, lng)) {
      Alert.alert(
        'Fuera de cobertura',
        'La app estará disponible pronto en tu zona. Te notificaremos cuando llegue.',
        [{ text: 'Entendido' }],
      );
    }
  }

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const registerPayload = {
        user_type_code: 'citizen',
        full_name: data.nombre,
        email: data.email,
        phone: data.telefono,
        id_type: 'CC',
        id_number: data.cedula,
        address: data.direccion,
        password: data.contrasena,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
      };

      const registerResp = await apiClient.post('/auth/register', registerPayload);

      const loginResp = await apiClient.post('/auth/login', {
        email: data.email,
        password: data.contrasena,
      });

      const user: BackendUser = {
        ...registerResp.data,
        address: data.direccion,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
      };

      setAuth(user, loginResp.data.access_token);
      router.replace('/(tabs)');
    } catch (error: any) {
      const status = error?.response?.status;
      const msg = error?.response?.data?.detail
        ?? error?.message
        ?? 'Ocurrió un error al registrarte. Intenta de nuevo.';
      const title = status === 409 ? 'Email o cédula ya registrados' : `Error ${status ?? '(sin respuesta)'}`;
      Alert.alert(title, msg);
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
          <Text className="text-gray-500 text-sm mb-6">
            Crea tu cuenta para solicitar recolecciones en Usme.
          </Text>

          <Field label="Nombre completo" error={errors.nombre?.message}>
            <Controller
              control={control}
              name="nombre"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={inputClass(!!errors.nombre)}
                  placeholder="Ej: María García López"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              )}
            />
          </Field>

          <Field label="Número de cédula" error={errors.cedula?.message}>
            <Controller
              control={control}
              name="cedula"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={inputClass(!!errors.cedula)}
                  placeholder="Ej: 1023456789"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="number-pad"
                  maxLength={10}
                  returnKeyType="next"
                />
              )}
            />
          </Field>

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

          <Field label="Teléfono" error={errors.telefono?.message}>
            <Controller
              control={control}
              name="telefono"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={inputClass(!!errors.telefono)}
                  placeholder="3001234567"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="phone-pad"
                  maxLength={10}
                  returnKeyType="next"
                />
              )}
            />
          </Field>

          <Field label="Dirección" error={errors.direccion?.message}>
            <LocationPicker onLocation={handleLocation} />
            <Controller
              control={control}
              name="direccion"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`${inputClass(!!errors.direccion)} mt-2`}
                  placeholder="O ingresa tu dirección manualmente"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
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
                    placeholder="Mínimo 8 caracteres"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry={!showPass}
                    returnKeyType="next"
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

          <Field label="Confirmar contraseña" error={errors.confirmarContrasena?.message}>
            <View className="relative">
              <Controller
                control={control}
                name="confirmarContrasena"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={inputClass(!!errors.confirmarContrasena)}
                    placeholder="Repite tu contraseña"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry={!showConfirmPass}
                    returnKeyType="done"
                  />
                )}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPass((p) => !p)}
                style={{ position: 'absolute', right: 14, top: 12 }}
              >
                {showConfirmPass ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
              </TouchableOpacity>
            </View>
          </Field>

          <Controller
            control={control}
            name="aceptaTerminos"
            render={({ field: { onChange, value } }) => (
              <TouchableOpacity
                onPress={() => onChange(!value)}
                className="flex-row items-start gap-3 mb-6"
              >
                <View
                  className={`w-5 h-5 rounded border-2 mt-0.5 items-center justify-center ${
                    value ? 'bg-primary-600 border-primary-600' : 'border-gray-300 bg-white'
                  }`}
                >
                  {value && <Text className="text-white text-xs font-bold">✓</Text>}
                </View>
                <Text className="text-sm text-gray-600 flex-1">
                  Acepto los{' '}
                  <Text className="text-primary-600 font-semibold">términos y condiciones</Text> y
                  la{' '}
                  <Text className="text-primary-600 font-semibold">política de privacidad</Text>
                </Text>
              </TouchableOpacity>
            )}
          />
          {errors.aceptaTerminos && (
            <Text className="text-red-500 text-xs -mt-4 mb-4">{errors.aceptaTerminos.message}</Text>
          )}

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid || loading}
            className={`rounded-2xl py-4 items-center ${isValid && !loading ? 'bg-primary-600' : 'bg-gray-200'}`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className={`font-bold text-base ${isValid ? 'text-white' : 'text-gray-400'}`}>
                Crear cuenta
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/(auth)/login')} className="items-center mt-4 py-2">
            <Text className="text-gray-500 text-sm">¿Ya tienes cuenta? <Text className="text-primary-600 font-semibold">Inicia sesión</Text></Text>
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
