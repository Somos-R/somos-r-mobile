import { CheckCircle, ClipboardList, Clock, Plus, Recycle, ScanLine, XCircle } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/stores/authStore';
import type { BackendUser } from '@/types/auth.types';
import { useRouter } from 'expo-router';

const GREEN = '#059669';

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const firstName = user?.full_name?.split(' ')[0] ?? '';

  if (user?.user_type_code === 'recycler') {
    return (
      <RecyclerVerificationScreen
        user={user}
        checkingStatus={checkingStatus}
        onRefreshStatus={handleRefreshStatus}
        onLogout={handleLogout}
      />
    );
  }

  async function handleRefreshStatus() {
    if (!user) return;
    setCheckingStatus(true);
    try {
      const resp = await apiClient.get(`/users/${user.id}`);
      updateUser({ verification_status: resp.data.verification_status });
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el estado. Intenta de nuevo.');
    } finally {
      setCheckingStatus(false);
    }
  }

  function handleLogout() {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: logout },
    ]);
  }

  function onRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }

  return (
    <SafeAreaView style={s.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GREEN} colors={[GREEN]} />
        }
      >
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Hola, {firstName}</Text>
            <Text style={s.subtitle}>¿Qué vas a reciclar hoy?</Text>
          </View>
          <View style={s.logoSmall}>
            <Recycle size={22} color="#fff" />
          </View>
        </View>

        <TouchableOpacity style={s.cta} activeOpacity={0.85}>
          <Plus size={22} color="#fff" />
          <Text style={s.ctaText}>Solicitar recolección</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.eduCard}
          activeOpacity={0.8}
          onPress={() => router.push('/identificar-material')}
        >
          <View style={s.eduIconWrap}>
            <ScanLine size={22} color={GREEN} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.eduTitle}>Identificar material</Text>
            <Text style={s.eduSubtitle}>Toma una foto para saber si es reciclable</Text>
          </View>
        </TouchableOpacity>

        <Text style={s.sectionTitle}>Solicitudes recientes</Text>

        <View style={s.empty}>
          <ClipboardList size={52} color="#d1d5db" />
          <Text style={s.emptyTitle}>Aún no tienes solicitudes</Text>
          <Text style={s.emptyText}>
            Cuando hagas tu primera solicitud, aparecerá aquí.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Recycler verification status screen
// ---------------------------------------------------------------------------

interface RecyclerProps {
  user: BackendUser;
  checkingStatus: boolean;
  onRefreshStatus: () => void;
  onLogout: () => void;
}

function RecyclerVerificationScreen({ user, checkingStatus, onRefreshStatus, onLogout }: RecyclerProps) {
  const status = user.verification_status;
  const registeredAt = new Date(user.created_at).toLocaleDateString('es-CO', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  if (status === 'verified') {
    return (
      <SafeAreaView style={s.container} edges={['bottom']}>
        <ScrollView contentContainerStyle={[s.scroll, s.centered]}>
          <View style={[s.iconBadge, { backgroundColor: '#d1fae5' }]}>
            <CheckCircle size={48} color={GREEN} />
          </View>
          <Text style={s.statusTitle}>¡Cuenta verificada!</Text>
          <Text style={s.statusMsg}>
            Bienvenido/a {user.full_name.split(' ')[0]}. Tu identidad fue confirmada por ASOBEUM.
          </Text>
          <View style={[s.infoBadge, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
            <Text style={[s.infoText, { color: '#047857' }]}>
              Las rutas de recolección estarán disponibles próximamente.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (status === 'rejected') {
    return (
      <SafeAreaView style={s.container} edges={['bottom']}>
        <ScrollView contentContainerStyle={[s.scroll, s.centered]}>
          <View style={[s.iconBadge, { backgroundColor: '#fee2e2' }]}>
            <XCircle size={48} color="#dc2626" />
          </View>
          <Text style={[s.statusTitle, { color: '#dc2626' }]}>Cuenta no aprobada</Text>
          <Text style={s.statusMsg}>
            Tu registro no fue aprobado por ASOBEUM. Por favor contáctalos para más información.
          </Text>
          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: '#25D366' }]}
            onPress={() => Linking.openURL('https://wa.me/573000000000')}
          >
            <Text style={s.actionBtnText}>Contactar ASOBEUM por WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.logoutLink} onPress={onLogout}>
            <Text style={s.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // pending or null
  return (
    <SafeAreaView style={s.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={[s.scroll, s.centered]}>
        <View style={[s.iconBadge, { backgroundColor: '#fef9c3' }]}>
          <Clock size={48} color="#ca8a04" />
        </View>
        <Text style={s.statusTitle}>Tu cuenta está en revisión</Text>
        <Text style={s.statusMsg}>
          El equipo de ASOBEUM está verificando tu información. Esto puede tomar hasta 24 horas.
        </Text>
        <View style={[s.infoBadge, { backgroundColor: '#fefce8', borderColor: '#fde68a' }]}>
          <Text style={[s.infoText, { color: '#92400e' }]}>Registrado el {registeredAt}</Text>
        </View>
        <TouchableOpacity
          style={[s.actionBtn, checkingStatus && { opacity: 0.6 }]}
          onPress={onRefreshStatus}
          disabled={checkingStatus}
        >
          {checkingStatus ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.actionBtnText}>Actualizar estado</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={s.logoutLink} onPress={onLogout}>
          <Text style={s.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  centered: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  logoSmall: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cta: {
    backgroundColor: GREEN,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 36,
  },
  ctaText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  eduCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 28,
    borderWidth: 1.5,
    borderColor: '#d1fae5',
  },
  eduIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eduTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  eduSubtitle: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 20 },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#6b7280' },
  emptyText: { fontSize: 13, color: '#9ca3af', textAlign: 'center', maxWidth: 260, lineHeight: 20 },
  // recycler verification
  iconBadge: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  statusTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 12 },
  statusMsg: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 22, maxWidth: 300, marginBottom: 24 },
  infoBadge: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, marginBottom: 32 },
  infoText: { fontSize: 13, fontWeight: '500' },
  actionBtn: { backgroundColor: GREEN, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, minWidth: 220, alignItems: 'center', marginBottom: 16 },
  actionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  logoutLink: { paddingVertical: 8 },
  logoutText: { color: '#9ca3af', fontSize: 13 },
});
