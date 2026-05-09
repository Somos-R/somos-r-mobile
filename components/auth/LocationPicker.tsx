import * as Location from 'expo-location';
import { MapPin, Target } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  onLocation: (lat: number, lng: number, address: string) => void;
}

export default function LocationPicker({ onLocation }: Props) {
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState(false);

  async function handlePress() {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a tu ubicación para validar la cobertura del servicio.');
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const [place] = await Location.reverseGeocodeAsync({ latitude: coords.latitude, longitude: coords.longitude });
      const address = [place.street, place.streetNumber, place.district, place.city]
        .filter(Boolean)
        .join(', ');
      onLocation(coords.latitude, coords.longitude, address || 'Dirección detectada por GPS');
      setPicked(true);
    } catch {
      Alert.alert('Error', 'No se pudo obtener tu ubicación. Intenta de nuevo o ingresa la dirección manualmente.');
    } finally {
      setLoading(false);
    }
  }

  const GREEN = '#059669';
  const borderColor = picked ? '#10b981' : GREEN;
  const bgColor = picked ? '#f0fdf4' : '#fff';
  const textColor = picked ? '#047857' : GREEN;
  const label = loading ? 'Obteniendo ubicación...' : picked ? 'Ubicación capturada' : 'Usar mi ubicación actual';

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={loading}
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, borderWidth: 2, borderColor, backgroundColor: bgColor, paddingHorizontal: 16, paddingVertical: 12 }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={GREEN} />
      ) : picked ? (
        <MapPin size={18} color={textColor} />
      ) : (
        <Target size={18} color={textColor} />
      )}
      <Text style={{ fontWeight: '600', fontSize: 14, color: textColor }}>{label}</Text>
    </TouchableOpacity>
  );
}
