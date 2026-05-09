import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { CreditCard, LogOut, Mail, MapPin, Pencil, Phone, User, X } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/stores/authStore';

const GREEN = '#059669';

const editSchema = z.object({
  full_name: z.string().min(2, 'Mínimo 2 caracteres'),
  phone: z
    .string()
    .length(10, 'El teléfono debe tener 10 dígitos')
    .regex(/^\d+$/, 'Solo dígitos'),
});

type EditForm = z.infer<typeof editSchema>;

export default function PerfilScreen() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      full_name: user?.full_name ?? '',
      phone: user?.phone ?? '',
    },
  });

  function handleStartEdit() {
    reset({ full_name: user?.full_name ?? '', phone: user?.phone ?? '' });
    setEditing(true);
  }

  function handleCancel() {
    reset({ full_name: user?.full_name ?? '', phone: user?.phone ?? '' });
    setEditing(false);
  }

  async function onSave(data: EditForm) {
    if (!user) return;
    setSaving(true);
    try {
      const resp = await apiClient.patch(`/users/${user.id}`, {
        full_name: data.full_name,
        phone: data.phone,
      });
      updateUser({ full_name: resp.data.full_name, phone: resp.data.phone });
      setEditing(false);
      Alert.alert('Listo', 'Perfil actualizado correctamente.');
    } catch (error: any) {
      const msg = error?.response?.data?.detail ?? 'No se pudo actualizar el perfil.';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    Alert.alert('Cerrar sesión', '¿Estás seguro de que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={s.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={s.avatarWrap}>
          <View style={s.avatar}>
            <User size={36} color="#fff" />
          </View>
          {!editing && (
            <TouchableOpacity style={s.editBtn} onPress={handleStartEdit} activeOpacity={0.7}>
              <Pencil size={16} color={GREEN} />
              <Text style={s.editBtnText}>Editar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Nombre y tipo */}
        {!editing && (
          <>
            <Text style={s.name}>{user?.full_name ?? '—'}</Text>
            <Text style={s.type}>Ciudadano</Text>
          </>
        )}

        {/* Formulario edición */}
        {editing && (
          <View style={s.formCard}>
            <Text style={s.formTitle}>Editar perfil</Text>

            <View style={s.fieldWrap}>
              <Text style={s.label}>Nombre completo</Text>
              <Controller
                control={control}
                name="full_name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[s.input, errors.full_name && s.inputError]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                )}
              />
              {errors.full_name && <Text style={s.errorText}>{errors.full_name.message}</Text>}
            </View>

            <View style={s.fieldWrap}>
              <Text style={s.label}>Teléfono</Text>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[s.input, errors.phone && s.inputError]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="phone-pad"
                    maxLength={10}
                    returnKeyType="done"
                  />
                )}
              />
              {errors.phone && <Text style={s.errorText}>{errors.phone.message}</Text>}
            </View>

            <View style={s.formActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={handleCancel} activeOpacity={0.7}>
                <X size={16} color="#6b7280" />
                <Text style={s.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.saveBtn, (!isDirty || saving) && s.saveBtnDisabled]}
                onPress={handleSubmit(onSave)}
                disabled={!isDirty || saving}
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={s.saveText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Info card */}
        {!editing && (
          <View style={s.infoCard}>
            <InfoRow icon={<Mail size={18} color="#6b7280" />} label="Email" value={user?.email ?? '—'} />
            {user?.phone && (
              <InfoRow icon={<Phone size={18} color="#6b7280" />} label="Teléfono" value={user.phone} />
            )}
            {user?.id_number && (
              <InfoRow icon={<CreditCard size={18} color="#6b7280" />} label="Cédula" value={user.id_number} />
            )}
            {user?.address && (
              <InfoRow icon={<MapPin size={18} color="#6b7280" />} label="Dirección" value={user.address} />
            )}
            {/* TODO US-0.16: agregar botón "Actualizar dirección" aquí */}
          </View>
        )}

        {/* Sección seguridad */}
        {!editing && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Seguridad</Text>
            {/* TODO US-0.15: implementar cambio de contraseña — requiere endpoint dedicado (coordinar con Oscar,
                UpdateUserRequest actual no incluye campo password) */}
            <TouchableOpacity style={s.securityRow} disabled activeOpacity={1}>
              <Text style={s.securityLabel}>Cambiar contraseña</Text>
              <Text style={s.securityBadge}>Próximamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Logout */}
        {!editing && (
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
            <LogOut size={18} color="#ef4444" />
            <Text style={s.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={r.row}>
      {icon}
      <View style={r.texts}>
        <Text style={r.label}>{label}</Text>
        <Text style={r.value}>{value}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40 },
  avatarWrap: { alignItems: 'center', marginBottom: 12 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: GREEN,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  editBtnText: { color: GREEN, fontWeight: '600', fontSize: 13 },
  name: { fontSize: 20, fontWeight: 'bold', color: '#111827', textAlign: 'center' },
  type: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: 4, marginBottom: 24 },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 },
  fieldWrap: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginBottom: 6 },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  inputError: { borderColor: '#f87171' },
  errorText: { fontSize: 11, color: '#ef4444', marginTop: 4 },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 11,
  },
  cancelText: { color: '#6b7280', fontWeight: '600', fontSize: 14 },
  saveBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GREEN,
    borderRadius: 10,
    paddingVertical: 11,
  },
  saveBtnDisabled: { backgroundColor: '#d1d5db' },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#9ca3af', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  securityRow: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  securityLabel: { fontSize: 14, color: '#374151', fontWeight: '500' },
  securityBadge: { fontSize: 12, color: '#9ca3af', backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  logoutText: { color: '#ef4444', fontWeight: '600', fontSize: 15 },
});

const r = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  texts: { flex: 1 },
  label: { fontSize: 12, color: '#9ca3af' },
  value: { fontSize: 14, color: '#111827', fontWeight: '500', marginTop: 1 },
});
