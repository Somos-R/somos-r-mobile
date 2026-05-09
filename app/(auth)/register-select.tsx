import { useRouter } from 'expo-router';
import { House, Recycle } from 'lucide-react-native';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const GREEN = '#059669';

export default function RegisterSelectScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.container} edges={['bottom']}>
      <View style={s.inner}>
        <Text style={s.title}>¿Cómo quieres registrarte?</Text>
        <Text style={s.subtitle}>Selecciona el tipo de cuenta que deseas crear.</Text>

        <View style={s.options}>
          <TouchableOpacity
            style={[s.btn, s.btnPrimary]}
            activeOpacity={0.85}
            onPress={() => router.replace('/(auth)/register-ciudadano')}
          >
            <View style={[s.iconWrap, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <House size={28} color="#fff" />
            </View>
            <View style={s.btnText}>
              <Text style={s.btnTitle}>Soy Ciudadano</Text>
              <Text style={s.btnSub}>Solicita recolección de reciclables en tu hogar</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.btn, s.btnSecondary]}
            activeOpacity={0.85}
            onPress={() => router.replace('/(auth)/register-reciclador')}
          >
            <View style={[s.iconWrap, { backgroundColor: '#f0fdf4' }]}>
              <Recycle size={28} color={GREEN} />
            </View>
            <View style={s.btnText}>
              <Text style={[s.btnTitle, { color: '#111827' }]}>Soy Reciclador</Text>
              <Text style={[s.btnSub, { color: '#6b7280' }]}>Gestiona tus rutas y recolecciones</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.back()} style={s.cancelLink}>
          <Text style={s.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 32, lineHeight: 20 },
  options: { gap: 14 },
  btn: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  btnPrimary: { backgroundColor: GREEN },
  btnSecondary: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#e5e7eb' },
  iconWrap: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  btnText: { flex: 1 },
  btnTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  btnSub: { fontSize: 13, color: '#d1fae5', lineHeight: 18 },
  cancelLink: { alignItems: 'center', marginTop: 32, paddingVertical: 8 },
  cancelText: { color: '#9ca3af', fontSize: 14 },
});
