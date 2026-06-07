import { Ionicons } from '@expo/vector-icons';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import * as robotApi from '../api/robot';
import VirtualJoystick from '../components/VirtualJoystick';
import { colors, fonts, getRobotTheme, spacing } from '../constants/theme';
import { useRobot } from '../context/RobotContext';
import { useCommandLog } from '../hooks/useCommandLog';

const DIRECTIONS = [
  { key: 'up', icon: 'arrow-up', label: 'Adelante' },
  { key: 'down', icon: 'arrow-down', label: 'Atrás' },
  { key: 'left', icon: 'arrow-back', label: 'Izquierda' },
  { key: 'right', icon: 'arrow-forward', label: 'Derecha' },
];

const DPAD_LINEAR = 0.3; // avance/retroceso
const DPAD_TURN = 0.5; // giro

const MOVE_THROTTLE_MS = 120;

export default function MovementScreen() {
  const { isConnected, robotType, isDevSimulated, isSeated, markRobotStanding } = useRobot();
  const theme = getRobotTheme(robotType);
  const { logCommand } = useCommandLog();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const showSuccess = useCallback((message) => {
    setFeedback({ type: 'success', message });
  }, []);
  const showError = useCallback((message) => {
    setFeedback({ type: 'error', message });
  }, []);

  const ensureReadyToMove = useCallback(async () => {
    if (!isSeated) return;
    await robotApi.recoverBalanceRobot();
    markRobotStanding();
  }, [isSeated, markRobotStanding]);

  const moveRobotReady = useCallback(
    async (params) => {
      await ensureReadyToMove();
      await robotApi.moveRobot(params);
    },
    [ensureReadyToMove]
  );

  const runCommand = async (fn, label) => {
    if (!isConnected) {
      setFeedback({
        type: 'warning',
        message: 'Conectá el robot desde la pestaña Conexión para usar los controles.',
      });
      return;
    }

    if (isDevSimulated) {
      showSuccess(`${label}: OK (simulado)`);
      logCommand({ action: label, success: true });
      return;
    }

    setLoading(true);
    setFeedback(null);
    let success = false;
    try {
      await fn();
      success = true;
      showSuccess(`${label}: OK`);
    } catch {
      showError(`${label}: falló`);
    } finally {
      setLoading(false);
      logCommand({ action: label, success });
    }
  };

  const lastMoveAt = useRef(0);
  const sending = useRef(false);
  const joystickActive = useRef(false);

  const handleJoystickMove = useCallback(
    (vx, vy, vyaw) => {
      if (!isConnected) return;
      joystickActive.current = true;

      if (isDevSimulated) {
        showSuccess(`Joystick: vx ${vx} · vyaw ${vyaw} (simulado)`);
        return;
      }

      const now = Date.now();
      if (now - lastMoveAt.current < MOVE_THROTTLE_MS) return; // throttle
      if (sending.current) return; // evita solapar requests en vuelo
      lastMoveAt.current = now;
      sending.current = true;

      moveRobotReady({ vx, vy, vyaw })
        .then(() => {
          showSuccess(`Joystick: vx ${vx} · vyaw ${vyaw}`);
        })
        .catch(() => {
          showError('Joystick: falló el envío');
        })
        .finally(() => {
          sending.current = false;
        });
    },
    [isConnected, isDevSimulated, showSuccess, showError, moveRobotReady]
  );

  const handleJoystickRelease = useCallback(() => {
    if (!isConnected) return;
    if (!joystickActive.current) return;
    joystickActive.current = false;

    if (isDevSimulated) {
      showSuccess('Joystick: detenido (simulado)');
      logCommand({ action: 'Joystick move', success: true });
      return;
    }

    let success = false;
    robotApi
      .stopRobot()
      .then(() => robotApi.standUpRobot())
      .then(() => {
        success = true;
        showSuccess('Joystick: detenido');
      })
      .catch(() => {
        showError('Stop: falló');
      })
      .finally(() => {
        logCommand({ action: 'Joystick move', success });
      });
  }, [isConnected, isDevSimulated, showSuccess, showError, logCommand]);

  const borderColor =
    feedback?.type === 'success'
      ? colors.success
      : feedback?.type === 'error'
        ? colors.error
        : feedback?.type === 'warning'
          ? colors.warning
          : colors.border;

  const controlsInactive = !isConnected;
  const controlsDisabled = loading;

  return (
    <View style={[styles.container, { borderColor }]}>
      <View style={styles.topSection}>
        {!isConnected ? (
          <View style={styles.disconnectedBanner}>
            <Ionicons name="information-circle-outline" size={18} color={colors.warning} />
            <Text style={styles.disconnectedBannerText}>
              Vista previa — conectá el robot en Conexión para enviar comandos.
            </Text>
          </View>
        ) : null}

        {feedback ? (
          <Text
            style={[
              styles.feedback,
              feedback.type === 'success' && styles.feedbackSuccess,
              feedback.type === 'error' && styles.feedbackError,
              feedback.type === 'warning' && styles.feedbackWarning,
            ]}>
            {feedback.message}
          </Text>
        ) : null}
      </View>

      <View style={styles.dpad}>
        <View style={styles.dpadRow}>
          <DirectionButton
            direction={DIRECTIONS[0]}
            theme={theme}
            onPress={() => runCommand(() => moveRobotReady({ vx: DPAD_LINEAR, vy: 0, vyaw: 0 }), 'Adelante')}
            disabled={controlsDisabled}
            inactive={controlsInactive}
          />
        </View>
        <View style={styles.dpadRow}>
          <DirectionButton
            direction={DIRECTIONS[2]}
            theme={theme}
            onPress={() => runCommand(() => moveRobotReady({ vx: 0, vy: 0, vyaw: DPAD_TURN }), 'Izquierda')}
            disabled={controlsDisabled}
            inactive={controlsInactive}
          />
          <View style={styles.dpadCenter} />
          <DirectionButton
            direction={DIRECTIONS[3]}
            theme={theme}
            onPress={() => runCommand(() => moveRobotReady({ vx: 0, vy: 0, vyaw: -DPAD_TURN }), 'Derecha')}
            disabled={controlsDisabled}
            inactive={controlsInactive}
          />
        </View>
        <View style={styles.dpadRow}>
          <DirectionButton
            direction={DIRECTIONS[1]}
            theme={theme}
            onPress={() => runCommand(() => moveRobotReady({ vx: -DPAD_LINEAR, vy: 0, vyaw: 0 }), 'Atrás')}
            disabled={controlsDisabled}
            inactive={controlsInactive}
          />
        </View>
      </View>

      <View style={styles.joystickSection}>
        <VirtualJoystick
          disabled={controlsInactive || controlsDisabled}
          onMove={handleJoystickMove}
          onRelease={handleJoystickRelease}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={theme.primary} />
      ) : null}
    </View>
  );
}

function DirectionButton({ direction, theme, onPress, disabled, inactive = false }) {
  return (
    <Pressable
      style={[styles.dirButton, { borderColor: theme.primary }, inactive && styles.controlDisabled]}
      onPress={onPress}
      disabled={disabled}>
      <Ionicons name={direction.icon} size={28} color={theme.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderRadius: 4,
  },
  topSection: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  disabledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  disconnectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  disconnectedBannerText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: fonts.sizes.sm,
  },
  controlDisabled: {
    opacity: 0.45,
  },
  disabledTitle: {
    color: colors.text,
    fontSize: fonts.sizes.xl,
    fontWeight: '700',
  },
  disabledText: {
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: fonts.sizes.md,
  },
  feedback: {
    textAlign: 'center',
    fontWeight: '600',
  },
  feedbackSuccess: {
    color: colors.success,
  },
  feedbackError: {
    color: colors.error,
  },
  feedbackWarning: {
    color: colors.warning,
  },
  dpad: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  dpadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dpadCenter: {
    width: 64,
    height: 64,
  },
  dirButton: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  joystickSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 220,
  },
  loader: {
    marginTop: spacing.sm,
  },
});
