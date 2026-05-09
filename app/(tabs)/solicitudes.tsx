import { ClipboardList } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SolicitudesScreen() {
  return (
    <SafeAreaView style={s.container} edges={['bottom']}>
      <View style={s.content}>
        <ClipboardList size={52} color="#d1d5db" />
        <Text style={s.title}>Historial de solicitudes</Text>
        <Text style={s.text}>
          Aquí verás todas tus solicitudes de recolección y su estado.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  title: { fontSize: 17, fontWeight: '600', color: '#374151' },
  text: { fontSize: 14, color: '#9ca3af', textAlign: 'center', lineHeight: 20 },
});
