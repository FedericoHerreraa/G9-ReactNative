import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import VirtualJoystick from '../components/VirtualJoystick';
import * as robotApi from '../api/robot';
import { useCommandLog } from '../hooks/useCommandLog';
import { useRobot } from '../context/RobotContext';
import { colors, getRobotTheme, spacing, fonts } from '../constants/theme';

const DIRECTIONS = [
  { key: 'up', icon: 'arrow-up', label: 'Adelante' },
  { key: 'down', icon: 'arrow-down', label: 'Atrás' },
  { key: 'left', icon: 'arrow-back', label: 'Izquierda' },
  { key: 'right', icon: 'arrow-forward', label: 'Derecha' },
];

export default function MovementScreen() {
  const { isConnected, robotType } = useRobot();
  const theme = getRobotTheme(robotType);
  const { logCommand } = useCommandLog();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const runCommand = async (fn, label) => {
    if (!isConnected) return;
    setLoading(true);
    setFeedback(null);
    let success = false;
    try {
      await fn();
      success = true;
      setFeedback({ type: 'success', message: `${label}: OK` });
    } catch {
      setFeedback({ type: 'error', message: `${label}: falló` });
    } finally {
      setLoading(false);
      logCommand({ action: label, success });
    }
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
            onPress={() => runCommand(() => robotApi.moveRobot({ vx: 0.3, vy: 0, vyaw: 0 }), 'Adelante')}
            disabled={loading}
          />
        </View>
        <View style={styles.dpadRow}>
          <DirectionButton
            direction={DIRECTIONS[2]}
            theme={theme}
            onPress={() => runCommand(() => robotApi.moveRobot({ vx: 0, vy: 0, vyaw: 0.5 }), 'Izquierda')}
            disabled={loading}
          />
          <View style={styles.dpadCenter} />
          <DirectionButton
            direction={DIRECTIONS[3]}
            theme={theme}
            onPress={() => runCommand(() => robotApi.moveRobot({ vx: 0, vy: 0, vyaw: -0.5 }), 'Derecha')}
            disabled={loading}
          />
        </View>
        <View style={styles.dpadRow}>
          <DirectionButton
            direction={DIRECTIONS[1]}
            theme={theme}
            onPress={() => runCommand(() => robotApi.moveRobot({ vx: -0.3, vy: 0, vyaw: 0 }), 'Atrás')}
            disabled={loading}
          />
        </View>
      </View>

      <View style={styles.specialActions}>
        <ActionButton
          label="Detener"
          color={colors.error}
          onPress={() => runCommand(() => robotApi.stopRobot(), 'Stop')}
          disabled={loading}
        />
        <ActionButton
          label="Levantarse"
          color={theme.primary}
          onPress={() => runCommand(() => robotApi.standUpRobot(), 'Stand Up')}
          disabled={loading}
        />
        <ActionButton
          label="Sentarse"
          color={theme.accent}
          onPress={() => runCommand(() => robotApi.sitDownRobot(), 'Sit Down')}
          disabled={loading}
        />
      </View>

      <VirtualJoystick disabled={!isConnected} />

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
