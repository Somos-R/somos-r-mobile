import { useRouter } from 'expo-router';
import { House, Recycle } from 'lucide-react-native';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const GREEN = '#059669';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.container}>
      <View style={s.inner}>

        <View style={s.header}>
          <View style={s.logoContainer}>
            <Recycle size={48} color="#fff" />
          </View>
          <Text style={s.title}>SOMOS R</Text>
          <Text style={s.subtitle}>Reciclaje inteligente para Usme</Text>
        </View>

        <View style={s.options}>
          <Text style={s.question}>¿Cómo quieres usar la app?</Text>

          <TouchableOpacity style={[s.btn, s.btnPrimary]} onPress={() => router.push('/(auth)/register-ciudadano')}>
            <House size={28} color="#fff" style={s.btnIcon} />
            <Text style={s.btnPrimaryTitle}>Soy Ciudadano</Text>
            <Text style={s.btnPrimarySub}>Solicita recolección de reciclables</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[s.btn, s.btnSecondary]} onPress={() => router.push('/(auth)/register-reciclador')}>
            <Recycle size={28} color={GREEN} style={s.btnIcon} />
            <Text style={s.btnSecondaryTitle}>Soy Reciclador</Text>
            <Text style={s.btnSecondarySub}>Gestiona tus rutas y recolecciones</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={s.loginLink}>
          <Text style={s.loginText}>
            ¿Ya tienes cuenta?{' '}
            <Text style={s.loginHighlight}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1, paddingHorizontal: 24, paddingVertical: 32, justifyContent: 'space-between' },
  header: { alignItems: 'center', marginTop: 32 },
  logoContainer: { width: 88, height: 88, borderRadius: 24, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  options: { gap: 12 },
  question: { textAlign: 'center', color: '#374151', fontWeight: '600', fontSize: 15, marginBottom: 8 },
  btn: { borderRadius: 16, paddingHorizontal: 24, paddingVertical: 20, alignItems: 'center' },
  btnPrimary: { backgroundColor: GREEN },
  btnSecondary: { backgroundColor: '#fff', borderWidth: 2, borderColor: GREEN },
  btnIcon: { marginBottom: 4 },
  btnPrimaryTitle: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  btnPrimarySub: { color: '#d1fae5', fontSize: 13, marginTop: 2 },
  btnSecondaryTitle: { color: GREEN, fontWeight: 'bold', fontSize: 17 },
  btnSecondarySub: { color: '#6b7280', fontSize: 13, marginTop: 2 },
  loginLink: { alignItems: 'center', paddingVertical: 12 },
  loginText: { color: '#6b7280', fontSize: 14 },
  loginHighlight: { color: GREEN, fontWeight: '600' },
});
