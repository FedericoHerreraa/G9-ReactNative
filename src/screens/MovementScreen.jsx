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
  const { isConnected, robotType, isDevSimulated, isSeated, markRobotSeated, markRobotStanding } = useRobot();
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

  const runApiCall = useCallback(
    async (fn, command) => {
      let success = false;
      try {
        await fn();
        success = true;
        return true;
      } catch {
        return false;
      } finally {
        logCommand(command, success);
      }
    },
    [logCommand]
  );

  const runCommand = async (fn, { label, command }) => {
    if (!isConnected) return;

    if (isDevSimulated) {
      showSuccess(`${label}: OK (simulado)`);
      logCommand(command, true);
      return;
    }

    setLoading(true);
    setFeedback(null);
    const success = await runApiCall(fn, command);
    if (success) {
      showSuccess(`${label}: OK`);
    } else {
      showError(`${label}: falló`);
    }
    setLoading(false);
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
      if (now - lastMoveAt.current < MOVE_THROTTLE_MS) return;
      if (sending.current) return;
      lastMoveAt.current = now;
      sending.current = true;

      moveRobotReady({ vx, vy, vyaw })
        .then(() => {
          showSuccess(`Joystick: vx ${vx} · vyaw ${vyaw}`);
          logCommand('move', true);
        })
        .catch(() => {
          showError('Joystick: falló el envío');
          logCommand('move', false);
        })
        .finally(() => {
          sending.current = false;
        });
    },
    [isConnected, isDevSimulated, showSuccess, showError, logCommand, moveRobotReady]
  );

  const handleJoystickRelease = useCallback(async () => {
    if (!isConnected) return;
    if (!joystickActive.current) return;
    joystickActive.current = false;

    if (isDevSimulated) {
      showSuccess('Joystick: detenido (simulado)');
      logCommand('stop', true);
      logCommand('standup', true);
      return;
    }

    setFeedback(null);
    const stopOk = await runApiCall(() => robotApi.stopRobot(), 'stop');
    if (!stopOk) {
      showError('Stop: falló');
      return;
    }

    const standOk = await runApiCall(() => robotApi.standUpRobot(), 'standup');
    if (standOk) {
      showSuccess('Joystick: detenido');
    } else {
      showError('Standup: falló');
    }
  }, [isConnected, isDevSimulated, showSuccess, showError, logCommand, runApiCall]);

  const handleStop = async () => {
    if (!isConnected) return;

    if (isDevSimulated) {
      showSuccess('Stop: OK (simulado)');
      logCommand('stop', true);
      logCommand('standup', true);
      return;
    }

    setLoading(true);
    setFeedback(null);
    const stopOk = await runApiCall(() => robotApi.stopRobot(), 'stop');
    if (!stopOk) {
      showError('Stop: falló');
      setLoading(false);
      return;
    }

    const standOk = await runApiCall(() => robotApi.standUpRobot(), 'standup');
    if (standOk) {
      showSuccess('Stop: OK');
    } else {
      showError('Standup: falló');
    }
    setLoading(false);
  };

  const borderColor =
    feedback?.type === 'success'
      ? colors.success
      : feedback?.type === 'error'
        ? colors.error
        : colors.border;

  if (!isConnected) {
    return (
      <View style={styles.disabledContainer}>
        <Ionicons name="lock-closed-outline" size={48} color={colors.textMuted} />
        <Text style={styles.disabledTitle}>Movimiento deshabilitado</Text>
        <Text style={styles.disabledText}>
          Conectá el robot desde la pestaña Conexión para habilitar los controles.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { borderColor }]}>
      {feedback ? (
        <Text
          style={[
            styles.feedback,
            feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError,
          ]}>
          {feedback.message}
        </Text>
      ) : null}

      <View style={styles.dpad}>
        <View style={styles.dpadRow}>
          <DirectionButton
            direction={DIRECTIONS[0]}
            theme={theme}
            onPress={() =>
              runCommand(() => moveRobotReady({ vx: DPAD_LINEAR, vy: 0, vyaw: 0 }), {
                label: 'Adelante',
                command: 'move',
              })
            }
            disabled={loading}
          />
        </View>
        <View style={styles.dpadRow}>
          <DirectionButton
            direction={DIRECTIONS[2]}
            theme={theme}
            onPress={() =>
              runCommand(() => moveRobotReady({ vx: 0, vy: 0, vyaw: DPAD_TURN }), {
                label: 'Izquierda',
                command: 'move',
              })
            }
            disabled={loading}
          />
          <View style={styles.dpadCenter} />
          <DirectionButton
            direction={DIRECTIONS[3]}
            theme={theme}
            onPress={() =>
              runCommand(() => moveRobotReady({ vx: 0, vy: 0, vyaw: -DPAD_TURN }), {
                label: 'Derecha',
                command: 'move',
              })
            }
            disabled={loading}
          />
        </View>
        <View style={styles.dpadRow}>
          <DirectionButton
            direction={DIRECTIONS[1]}
            theme={theme}
            onPress={() =>
              runCommand(() => moveRobotReady({ vx: -DPAD_LINEAR, vy: 0, vyaw: 0 }), {
                label: 'Atrás',
                command: 'move',
              })
            }
            disabled={loading}
          />
        </View>
      </View>

      <View style={styles.specialActions}>
        <ActionButton label="Detener" color={colors.error} onPress={handleStop} disabled={loading} />
        <ActionButton
          label="Levantarse"
          color={theme.primary}
          onPress={() =>
            runCommand(
              async () => {
                await robotApi.recoverBalanceRobot();
                markRobotStanding();
              },
              { label: 'Stand Up', command: 'standup' }
            )
          }
          disabled={loading}
        />
        <ActionButton
          label="Sentarse"
          color={theme.accent}
          onPress={() =>
            runCommand(
              async () => {
                await robotApi.sitDownRobot();
                markRobotSeated();
              },
              { label: 'Sit Down', command: 'sitdown' }
            )
          }
          disabled={loading}
        />
      </View>

      <VirtualJoystick
        disabled={!isConnected}
        onMove={handleJoystickMove}
        onRelease={handleJoystickRelease}
      />

      {loading ? (
        <ActivityIndicator style={styles.loader} color={theme.primary} />
      ) : null}
    </View>
  );
}

function DirectionButton({ direction, theme, onPress, disabled }) {
  return (
    <Pressable
      style={[styles.dirButton, { borderColor: theme.primary }]}
      onPress={onPress}
      disabled={disabled}>
      <Ionicons name={direction.icon} size={28} color={theme.primary} />
    </Pressable>
  );
}

function ActionButton({ label, color, onPress, disabled }) {
  return (
    <Pressable
      style={[styles.actionButton, { backgroundColor: color }]}
      onPress={onPress}
      disabled={disabled}>
      <Text style={styles.actionButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderRadius: 4,
    gap: spacing.lg,
  },
  disabledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
    gap: spacing.md,
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
  dpad: {
    alignItems: 'center',
    gap: spacing.sm,
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
  specialActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  actionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: '700',
  },
  loader: {
    marginTop: spacing.sm,
  },
});
