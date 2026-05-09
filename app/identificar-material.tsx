import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Camera, CheckCircle2, Image as ImageIcon, RotateCcw, XCircle } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GREEN = '#059669';

type MaterialResult = {
  material_type: string;
  category: string;
  recyclable: boolean;
  description: string;
  co2_saved_kg: number;
};

type ScreenState = 'idle' | 'analyzing' | 'result';

// Mock results — replace with POST /materials/identify when Oscar delivers B-ED.1
const MOCK_RESULTS: MaterialResult[] = [
  {
    material_type: 'Plástico PET',
    category: 'plastic',
    recyclable: true,
    description: 'Botellas y envases de plástico transparente. Muy valorado en centros de acopio.',
    co2_saved_kg: 0.4,
  },
  {
    material_type: 'Cartón',
    category: 'cardboard',
    recyclable: true,
    description: 'Cajas y embalajes de cartón. Alta demanda en centros de reciclaje.',
    co2_saved_kg: 0.6,
  },
  {
    material_type: 'Vidrio',
    category: 'glass',
    recyclable: true,
    description: 'Botellas y frascos de vidrio. 100% reciclable y reutilizable.',
    co2_saved_kg: 0.3,
  },
  {
    material_type: 'Metal / Lata',
    category: 'metal',
    recyclable: true,
    description: 'Latas de aluminio y acero. Uno de los materiales con mayor valor de reciclaje.',
    co2_saved_kg: 0.8,
  },
  {
    material_type: 'Residuo orgánico',
    category: 'organic',
    recyclable: false,
    description: 'Residuos de comida u origen orgánico. No apto para recolección de reciclaje.',
    co2_saved_kg: 0,
  },
];

async function classifyMaterial(_base64: string): Promise<MaterialResult> {
  // TODO: swap for real endpoint when Oscar delivers B-ED.1
  // const resp = await apiClient.post('/materials/identify', { image: _base64 });
  // return resp.data;
  await new Promise((r) => setTimeout(r, 1800));
  return MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)];
}

export default function IdentificarMaterialScreen() {
  const router = useRouter();
  const [state, setState] = useState<ScreenState>('idle');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<MaterialResult | null>(null);

  async function pickImage(source: 'camera' | 'gallery') {
    const perm =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!perm.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso para continuar.');
      return;
    }

    const fn =
      source === 'camera'
        ? ImagePicker.launchCameraAsync
        : ImagePicker.launchImageLibraryAsync;

    const picked = await fn({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true,
    });

    if (picked.canceled || !picked.assets[0]) return;

    const asset = picked.assets[0];
    setImageUri(asset.uri);
    setState('analyzing');

    try {
      const res = await classifyMaterial(asset.base64 ?? '');
      setResult(res);
      setState('result');
    } catch {
      Alert.alert('Error', 'No se pudo analizar la imagen. Intenta de nuevo.');
      setState('idle');
    }
  }

  function reset() {
    setState('idle');
    setImageUri(null);
    setResult(null);
  }

  function handleCreateSolicitud() {
    router.push({
      pathname: '/(tabs)/solicitudes',
      params: {
        material: result?.category ?? '',
        material_label: result?.material_type ?? '',
      },
    });
  }

  return (
    <SafeAreaView style={s.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {state === 'idle' && <IdleView onPick={pickImage} />}
        {state === 'analyzing' && <AnalyzingView imageUri={imageUri} />}
        {state === 'result' && result && (
          <ResultView
            result={result}
            imageUri={imageUri}
            onReset={reset}
            onCreateSolicitud={handleCreateSolicitud}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function IdleView({ onPick }: { onPick: (source: 'camera' | 'gallery') => void }) {
  return (
    <View style={s.center}>
      <View style={s.iconBg}>
        <Camera size={40} color={GREEN} />
      </View>
      <Text style={s.idleTitle}>Identificar material</Text>
      <Text style={s.idleSubtitle}>
        Toma una foto de tu residuo y nuestra IA te dirá si es reciclable y qué tipo de material es.
      </Text>
      <TouchableOpacity style={s.primaryBtn} onPress={() => onPick('camera')} activeOpacity={0.85}>
        <Camera size={20} color="#fff" />
        <Text style={s.primaryBtnText}>Tomar foto</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={s.secondaryBtn}
        onPress={() => onPick('gallery')}
        activeOpacity={0.85}
      >
        <ImageIcon size={20} color={GREEN} />
        <Text style={s.secondaryBtnText}>Elegir de galería</Text>
      </TouchableOpacity>
    </View>
  );
}

function AnalyzingView({ imageUri }: { imageUri: string | null }) {
  return (
    <View style={s.center}>
      {imageUri && <Image source={{ uri: imageUri }} style={s.preview} />}
      <ActivityIndicator size="large" color={GREEN} style={{ marginTop: 32 }} />
      <Text style={s.analyzingText}>Analizando tu residuo…</Text>
    </View>
  );
}

function ResultView({
  result,
  imageUri,
  onReset,
  onCreateSolicitud,
}: {
  result: MaterialResult;
  imageUri: string | null;
  onReset: () => void;
  onCreateSolicitud: () => void;
}) {
  return (
    <View>
      {imageUri && <Image source={{ uri: imageUri }} style={s.resultImage} />}

      <View style={[s.resultCard, result.recyclable ? s.cardGreen : s.cardGray]}>
        <View style={s.resultHeader}>
          {result.recyclable ? (
            <CheckCircle2 size={28} color={GREEN} />
          ) : (
            <XCircle size={28} color="#9ca3af" />
          )}
          <View style={{ flex: 1 }}>
            <Text style={s.materialType}>{result.material_type}</Text>
            <Text style={[s.recyclableBadge, result.recyclable ? s.badgeGreen : s.badgeGray]}>
              {result.recyclable ? '✓ Reciclable' : '✗ No reciclable'}
            </Text>
          </View>
        </View>

        <Text style={s.description}>{result.description}</Text>

        {result.recyclable && result.co2_saved_kg > 0 && (
          <View style={s.co2Row}>
            <Text style={s.co2Text}>
              ♻ Reciclando este material evitas hasta{' '}
              <Text style={{ fontWeight: '700', color: GREEN }}>
                {result.co2_saved_kg} kg
              </Text>{' '}
              de CO₂
            </Text>
          </View>
        )}
      </View>

      {result.recyclable && (
        <TouchableOpacity style={s.primaryBtn} onPress={onCreateSolicitud} activeOpacity={0.85}>
          <Text style={s.primaryBtnText}>Crear solicitud con este material</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={s.secondaryBtn} onPress={onReset} activeOpacity={0.85}>
        <RotateCcw size={18} color={GREEN} />
        <Text style={s.secondaryBtnText}>Analizar otro residuo</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40 },
  center: { alignItems: 'center', paddingTop: 16 },
  iconBg: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  idleTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
    textAlign: 'center',
  },
  idleSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    marginBottom: 12,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: GREEN,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
  },
  secondaryBtnText: { color: GREEN, fontWeight: '600', fontSize: 15 },
  preview: { width: '100%', height: 220, borderRadius: 16, marginBottom: 24, resizeMode: 'cover' },
  analyzingText: { fontSize: 16, color: '#374151', fontWeight: '500', marginTop: 16 },
  resultImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  resultCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardGreen: { backgroundColor: '#f0fdf4', borderWidth: 1.5, borderColor: '#bbf7d0' },
  cardGray: { backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb' },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  materialType: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  recyclableBadge: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  badgeGreen: { color: GREEN },
  badgeGray: { color: '#9ca3af' },
  description: { fontSize: 14, color: '#6b7280', lineHeight: 20, marginBottom: 12 },
  co2Row: {
    backgroundColor: '#dcfce7',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  co2Text: { fontSize: 13, color: '#166534', lineHeight: 18 },
});
