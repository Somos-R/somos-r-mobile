import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Activity, Camera, ChartBarBig, CheckCircle2, Cpu, Database, Image as ImageIcon, RotateCcw, X, XCircle } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GREEN = '#059669';

type ModelMetrics = {
  accuracy: number;
  f1_score: number;
  ram_mb: number;
  inference_ms: number;
};

type MaterialResult = {
  material_type: string;
  category: string;
  recyclable: boolean;
  description: string;
  co2_saved_kg: number;
  metrics: ModelMetrics;
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
    metrics: { accuracy: 0.96, f1_score: 0.94, ram_mb: 48, inference_ms: 287 },
  },
  {
    material_type: 'Cartón',
    category: 'cardboard',
    recyclable: true,
    description: 'Cajas y embalajes de cartón. Alta demanda en centros de reciclaje.',
    co2_saved_kg: 0.6,
    metrics: { accuracy: 0.93, f1_score: 0.91, ram_mb: 52, inference_ms: 314 },
  },
  {
    material_type: 'Vidrio',
    category: 'glass',
    recyclable: true,
    description: 'Botellas y frascos de vidrio. 100% reciclable y reutilizable.',
    co2_saved_kg: 0.3,
    metrics: { accuracy: 0.91, f1_score: 0.89, ram_mb: 45, inference_ms: 298 },
  },
  {
    material_type: 'Metal / Lata',
    category: 'metal',
    recyclable: true,
    description: 'Latas de aluminio y acero. Uno de los materiales con mayor valor de reciclaje.',
    co2_saved_kg: 0.8,
    metrics: { accuracy: 0.97, f1_score: 0.96, ram_mb: 50, inference_ms: 265 },
  },
  {
    material_type: 'Residuo orgánico',
    category: 'organic',
    recyclable: false,
    description: 'Residuos de comida u origen orgánico. No apto para recolección de reciclaje.',
    co2_saved_kg: 0,
    metrics: { accuracy: 0.88, f1_score: 0.85, ram_mb: 44, inference_ms: 301 },
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
  const [showMetrics, setShowMetrics] = useState(false);

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
          <TouchableOpacity
            style={s.metricsBtn}
            onPress={() => setShowMetrics(true)}
            activeOpacity={0.7}
          >
            <ChartBarBig size={16} color="#6b7280" />
            <Text style={s.metricsBtnText}>Métricas</Text>
          </TouchableOpacity>
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

      <MetricsModal
        metrics={result.metrics}
        visible={showMetrics}
        onClose={() => setShowMetrics(false)}
      />
    </View>
  );
}

function MetricsModal({
  metrics,
  visible,
  onClose,
}: {
  metrics: ModelMetrics;
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={m.overlay}>
        <View style={m.sheet}>
          <View style={m.header}>
            <Text style={m.title}>Métricas del modelo</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <Text style={m.subtitle}>Rendimiento de la última clasificación</Text>

          <View style={m.grid}>
            <MetricCard
              icon={<ChartBarBig size={20} color="#6366f1" />}
              label="Accuracy"
              value={`${(metrics.accuracy * 100).toFixed(1)}%`}
              bg="#eef2ff"
              color="#6366f1"
            />
            <MetricCard
              icon={<Activity size={20} color={GREEN} />}
              label="F1 Score"
              value={`${(metrics.f1_score * 100).toFixed(1)}%`}
              bg="#ecfdf5"
              color={GREEN}
            />
            <MetricCard
              icon={<Database size={20} color="#f59e0b" />}
              label="RAM"
              value={`${metrics.ram_mb} MB`}
              bg="#fffbeb"
              color="#f59e0b"
            />
            <MetricCard
              icon={<Cpu size={20} color="#ec4899" />}
              label="Inferencia"
              value={`${metrics.inference_ms} ms`}
              bg="#fdf2f8"
              color="#ec4899"
            />
          </View>

          <Text style={m.note}>
            Valores simulados. Se actualizarán con el modelo real en Sprint 5.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

function MetricCard({
  icon,
  label,
  value,
  bg,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
  color: string;
}) {
  return (
    <View style={[m.card, { backgroundColor: bg }]}>
      <View style={m.cardIcon}>{icon}</View>
      <Text style={[m.cardValue, { color }]}>{value}</Text>
      <Text style={m.cardLabel}>{label}</Text>
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
  metricsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },
  metricsBtnText: { fontSize: 11, color: '#6b7280', fontWeight: '600' },
});

const m = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  sheet: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 17, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 13, color: '#9ca3af', marginBottom: 20 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  card: {
    width: '47%',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  cardIcon: { marginBottom: 2 },
  cardValue: { fontSize: 22, fontWeight: 'bold' },
  cardLabel: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  note: { fontSize: 11, color: '#d1d5db', textAlign: 'center', fontStyle: 'italic' },
});
