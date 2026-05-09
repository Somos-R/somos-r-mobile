import { useRouter } from 'expo-router';
import { LogOut, Mail, Phone, User } from 'lucide-react-native';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/stores/authStore';

const GREEN = '#059669';

export default function PerfilScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

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
      <View style={s.inner}>
        <View style={s.avatar}>
          <User size={36} color="#fff" />
        </View>
        <Text style={s.name}>{user?.full_name ?? '—'}</Text>
        <Text style={s.type}>Ciudadano</Text>

        <View style={s.infoCard}>
          {user?.email && (
            <InfoRow icon={<Mail size={18} color="#6b7280" />} label="Email" value={user.email} />
          )}
          {user?.phone && (
            <InfoRow icon={<Phone size={18} color="#6b7280" />} label="Teléfono" value={user.phone} />
          )}
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
          <LogOut size={18} color="#ef4444" />
          <Text style={s.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={r.row}>
      {icon}
      <View>
        <Text style={r.label}>{label}</Text>
        <Text style={r.value}>{value}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  inner: { flex: 1, alignItems: 'center', paddingTop: 40, paddingHorizontal: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  type: { fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 28 },
  infoCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 32,
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  logoutText: { color: '#ef4444', fontWeight: '600', fontSize: 15 },
});

const r = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  label: { fontSize: 12, color: '#9ca3af' },
  value: { fontSize: 14, color: '#111827', fontWeight: '500' },
});
