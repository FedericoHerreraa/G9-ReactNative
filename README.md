# Unitree Robot Controller

Aplicación móvil en **React Native + Expo** para controlar robots Unitree (**Go2** o **G1**) mediante una API REST.

## Requisitos

- Node.js 20+
- npm
- Expo Go (celular) o navegador web

## Configuración

Copiá `.env.example` a `.env` y configurá la IP del servidor:

```bash
cp .env.example .env
# Editá EXPO_PUBLIC_API_BASE_URL con la IP del laboratorio
# Ejemplo: EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:8000
```

## Cómo correr

```bash
npm install
npm start          # abre el QR para Expo Go
npm run web        # abre en el navegador
npm run android    # abre en emulador Android
```

## Pantallas

| Pantalla | Descripción |
|----------|-------------|
| Login | Email o usuario + contraseña. Sesión persistente. |
| Registro | Nombre de usuario, email, contraseña con confirmación. |
| Conexión | Selector Go2/G1, interfaz de red, conectar/desconectar, estado JSON. |
| Movimiento | D-pad direccional, stop/levantarse/sentarse, joystick (placeholder). |
| Acciones | Lista de acciones del robot, ejecución con feedback visual. |
| Historial | Comandos enviados con resultado y timestamp, se refresca al entrar. |

## Estructura

```
src/
  api/          # Cliente Axios + endpoints (auth, robot, actions)
  components/   # UI reutilizable (joystick, selector, badge, historial)
  constants/    # Endpoints, colores y tema (Go2 naranja / G1 azul)
  context/      # AuthContext (sesión) y RobotContext (estado del robot)
  hooks/        # useCommandLog — logging unificado de comandos
  navigation/   # AppNavigator, AuthStack, MainTabs
  screens/      # Una pantalla por flujo
  utils/        # AsyncStorage helpers
```

## Logging de comandos

Cada comando (movimiento, acción, stop, etc.) se guarda en **historial local** (AsyncStorage) vía `useCommandLog`. La API no expone `/history`.

```js
const { logCommand } = useCommandLog();
await logCommand({ action: 'Adelante', success: true });
```

## Backend

La app consume la API REST de [Horix89/unitree_robot_api](https://github.com/Horix89/unitree_robot_api). Rutas definidas en `src/constants/api.js`:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/register` | Registro `{ username, email, password }` |
| POST | `/auth/token` | Login `{ identifier, password }` → `access_token` |
| POST | `/connect` | Conectar `{ robot_type, network_interface? }` |
| POST | `/disconnect` | Desconectar |
| GET | `/status` | Estado de conexión |
| POST | `/move` | Mover `{ vx, vy, vyaw }` |
| POST | `/stop` | Detener |
| POST | `/standup` | Levantarse |
| POST | `/sitdown` | Sentarse |
| POST | `/damp` | Modo amortiguado |
| POST | `/handstand` | Parado de manos `{ enable }` |
| POST | `/freebound` | Free bound `{ enable }` |
| POST | `/freeavoid` | Free avoid `{ enable }` |
| POST | `/walkupright` | Caminar erguido `{ enable }` |
| POST | `/crossstep` | Paso cruzado `{ enable }` |
| POST | `/freejump` | Salto libre `{ enable }` |
| GET | `/actions` | Lista `{ robot_type, actions[] }` |
| POST | `/action/{action_name}` | Ejecutar acción |

Todos los endpoints de robot requieren header `Authorization: Bearer <token>`.

## Stack

| Herramienta | Uso |
|-------------|-----|
| Expo SDK 54 | Runtime y tooling |
| React Navigation 7 | Stack (auth) + Bottom Tabs (main) |
| Axios | Cliente HTTP con interceptores (token, 401, errores de red) |
| AsyncStorage | Persistencia de sesión |
| Reanimated | Preparado para joystick |
| Expo Vector Icons | Iconografía |
