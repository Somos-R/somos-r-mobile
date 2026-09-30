# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Flujo de Git — leer primero

`main` está protegida: solo avanza mediante un Pull Request mergeado, nunca con push directo.

- **Nunca commitear directo en `main`.** Antes de empezar cualquier cambio — incluso uno pequeño — crear o cambiar a una rama (`feature/<slug>`, `fix/<slug>`, `chore/<slug>`).
- **Commitear a medida que se avanza.** No dejar una sesión con cambios sin stagear o sin commitear "para después" — un working tree sin commitear no es un punto de guardado. Si el trabajo quedó a medias, commitearlo igual como WIP en la rama.
- **Pushear y abrir un PR** en cuanto haya algo revisable, en vez de dejar trabajo terminado solo en local. Un PR en draft está bien si sigue en progreso.
- Esto aplica igual si la sesión es de una persona o de Claude Code/un agente — sin excepciones por "es un cambio chico".

## Stack técnico

- React Native + Expo SDK 54, Expo Router
- NativeWind (Tailwind para RN)
- TanStack Query v5 (datos de servidor); el estado de UI vive en el propio componente o en Context (sin librería de estado global)
- Axios

## Comandos

```bash
pnpm install                # instalar dependencias
cp .env.example .env.local  # variables de entorno
npx expo start              # iniciar en desarrollo
npx expo start --android    # abrir en Android
npx expo start --ios        # abrir en iOS
npx expo start --web        # abrir en navegador
```

## Calidad (CI)

Cada PR corre `.github/workflows/ci.yml`: `quality` (`pnpm typecheck`, `pnpm lint`, `pnpm test`), `audit` (`pnpm audit --prod --audit-level high`) y `secrets` (gitleaks sobre todo el historial). Corre lo mismo en local antes de abrir el PR. Un solo gestor de paquetes: **pnpm** (`pnpm-lock.yaml`; no crear `package-lock.json`). Las pruebas usan `jest-expo` + `@testing-library/react-native` y viven en `__tests__/` en la raíz: **nunca dentro de `app/`**, porque Expo Router lo tomaría como una ruta.

## Estado actual

Este repo ya no tiene el template de Expo: solo hay una pantalla provisional (`app/index.tsx`) y la de "no existe". Todavía no hay pantallas propias de Somos R. Antes de construir features nuevas, revisar las Historias de Usuario del Módulo 1 (App Ciudadana) y Módulo 2 (App Reciclador) en el Notion del proyecto.
