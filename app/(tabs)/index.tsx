import { ClipboardList, Plus, Recycle } from 'lucide-react-native';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/stores/authStore';

const GREEN = '#059669';

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const [refreshing, setRefreshing] = useState(false);

  const firstName = user?.full_name?.split(' ')[0] ?? 'Ciudadano';

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

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
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
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 20 },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#6b7280' },
  emptyText: { fontSize: 13, color: '#9ca3af', textAlign: 'center', maxWidth: 260, lineHeight: 20 },
});
