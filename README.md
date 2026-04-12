# Somos R - Apps Moviles

Aplicaciones moviles para Ciudadanos y Recicladores.

## Stack Tecnologico

- React Native + Expo SDK 54
- NativeWind (Tailwind para RN)
- TanStack Query v5
- Zustand
- Expo Router

## Instalacion

```bash
# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example .env.local

# Iniciar en desarrollo
npx expo start
```

## Ejecutar en Dispositivo

### Android
1. Instalar Expo Go desde Play Store
2. Escanear QR con Expo Go

### iOS
1. Instalar Expo Go desde App Store
2. Escanear QR con camara nativa

## Variables de Entorno

```
EXPO_PUBLIC_API_URL=http://192.168.1.X:8000
EXPO_PUBLIC_MAPBOX_TOKEN=tu_token_aqui
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```
