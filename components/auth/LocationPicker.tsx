import * as Location from 'expo-location';
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

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={loading}
      className={`flex-row items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 ${picked ? 'border-primary-500 bg-primary-50' : 'border-primary-600 bg-white'}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#059669" />
      ) : (
        <Text className="text-lg">{picked ? '📍' : '🎯'}</Text>
      )}
      <Text className={`font-semibold text-sm ${picked ? 'text-primary-700' : 'text-primary-600'}`}>
        {loading ? 'Obteniendo ubicación...' : picked ? 'Ubicación capturada' : 'Usar mi ubicación actual'}
      </Text>
    </TouchableOpacity>
  );
}
