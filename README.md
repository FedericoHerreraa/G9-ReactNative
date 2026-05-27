# Unitree Robot Controller (Expo + React Native)

Aplicación móvil en **JavaScript** para controlar robots Unitree (**Go2** o **G1**) mediante una API REST. Incluye autenticación, conexión al robot, movimiento, acciones predefinidas e historial de comandos.

## Requisitos

- Node.js 20+ (recomendado para Expo SDK 54)
- npm
- Expo Go o emulador iOS/Android

## Variables de entorno

Copiá `.env.example` a `.env` y configurá la URL base del backend:

```bash
EXPO_PUBLIC_API_BASE_URL=http://TU_IP:8000
```

Expo expone variables con prefijo `EXPO_PUBLIC_` al bundle de la app. Reiniciá `expo start` después de cambiar `.env`.

## Cómo ejecutar

```bash
npm install
npx expo start
```

Luego abrí el proyecto en Expo Go, emulador o dispositivo físico.

## Estructura del proyecto

```
src/
  api/              # Cliente Axios y endpoints (auth, robot, actions, history)
  components/       # UI reutilizable (joystick, selector, badge, etc.)
  context/          # AuthContext y RobotContext (estado global)
  navigation/       # AppNavigator, AuthStack, MainTabs
  screens/          # Pantallas por flujo (login, conexión, movimiento…)
  constants/        # BASE_URL, endpoints y theme (colores Go2/G1)
  utils/            # Helpers de AsyncStorage
App.js              # Providers y navegación raíz
index.js            # Entry point (registerRootComponent)
```

### Flujo de navegación

1. **Carga inicial**: `AuthContext` restaura token desde AsyncStorage → pantalla de loading.
2. **Sin sesión**: `AuthStack` (Login → Register).
3. **Con sesión**: `MainTabs` con cuatro pestañas:
   - **Conexión**: selector Go2/G1, interfaz de red, conectar/desconectar, JSON de estado.
   - **Movimiento**: D-pad, stop/stand/sit, joystick (placeholder); deshabilitado si no hay conexión.
   - **Acciones**: listado y ejecución de acciones del backend.
   - **Historial**: comandos enviados.

### API HTTP

Todas las peticiones pasan por `src/api/client.js`:

- `baseURL` desde `EXPO_PUBLIC_API_BASE_URL` / `constants/api.js`
- Interceptor de request: header `Authorization: Bearer <token>`
- Interceptor de response `401`: limpia sesión y redirige a Login

## Stack técnico

| Herramienta | Uso |
|-------------|-----|
| Expo SDK 54 | Runtime y tooling |
| React Navigation 7 | Native Stack (auth) + Bottom Tabs (main) |
| Axios | Cliente HTTP |
| AsyncStorage | Persistencia de token/usuario |
| Reanimated | Preparado para joystick (placeholder) |
| Expo Vector Icons | Iconografía |

## Próximos pasos (TODOs en código)

- Conectar pantallas al contrato real del backend REST
- Implementar `VirtualJoystick` con Reanimated + Gesture Handler
- Ajustar formas de respuesta (`token`, `user`, listados paginados)
- Polling de estado del robot en `ConnectionScreen`

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia Metro (`expo start`) |
| `npm run android` | Abre en Android |
| `npm run ios` | Abre en iOS |
| `npm run lint` | ESLint |
