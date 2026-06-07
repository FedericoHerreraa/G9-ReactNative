import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import * as actionsApi from '../api/actions';
import * as robotApi from '../api/robot';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import ScreenContainer from '../components/ScreenContainer';
import { colors, fonts, getRobotTheme, spacing } from '../constants/theme';
import { useRobot } from '../context/RobotContext';
import { useCommandLog } from '../hooks/useCommandLog';

const MOTION_COMMANDS = [
  {
    key: 'stop',
    label: 'Detener',
    run: async () => {
      await robotApi.stopRobot();
      await robotApi.standUpRobot();
    },
  },
  {
    key: 'standup',
    label: 'Levantarse',
    run: async ({ markRobotStanding }) => {
      await robotApi.recoverBalanceRobot();
      markRobotStanding();
    },
  },
  {
    key: 'sitdown',
    label: 'Sentarse',
    run: async ({ markRobotSeated }) => {
      await robotApi.sitDownRobot();
      markRobotSeated();
    },
  },
  {
    key: 'damp',
    label: 'Acostarse',
    run: () => robotApi.dampRobot(),
  },
  {
    key: 'handstand',
    label: 'Handstand',
    run: () => robotApi.handstandRobot(true),
  },
  {
    key: 'freebound',
    label: 'Free Bound',
    run: () => robotApi.freeBoundRobot(true),
  },
  {
    key: 'freeavoid',
    label: 'Free Avoid',
    run: () => robotApi.freeAvoidRobot(true),
  },
  {
    key: 'walkupright',
    label: 'Walk Upright',
    run: () => robotApi.walkUprightRobot(true),
  },
  {
    key: 'crossstep',
    label: 'Cross Step',
    run: () => robotApi.crossStepRobot(true),
  },
  {
    key: 'freejump',
    label: 'Free Jump',
    run: () => robotApi.freeJumpRobot(true),
  },
];

export default function ActionsScreen() {
  const { isConnected, robotType, isDevSimulated, markRobotSeated, markRobotStanding } =
    useRobot();
  const theme = getRobotTheme(robotType);
  const { logCommand } = useCommandLog();
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingAction, setLoadingAction] = useState(null);

  const loadActions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await actionsApi.getActions();
      const list = Array.isArray(data) ? data : (data.actions ?? []);
      setActions(list);
    } catch {
      const mockActions = [
        'Saludar', 'Bailar', 'Saltar',
        'Sentarse', 'Pararse',
        'Girar', 'Avanzar', 'Retroceder', 'Handstand',
      ];
      setActions(mockActions);
      setError('');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActions();
  }, [loadActions]);

  const listData = useMemo(() => {
    const motionLabels = new Set(MOTION_COMMANDS.map((command) => command.label.toLowerCase()));
    const apiActions = actions.filter(
      (action) => !motionLabels.has(String(action).toLowerCase())
    );

    return [
      ...MOTION_COMMANDS.map((command) => ({ ...command, source: 'motion' })),
      ...apiActions.map((action) => ({ key: action, label: action, source: 'api' })),
    ];
  }, [actions]);

  const handleMotionCommand = async (command) => {
    if (!isConnected) return;

    setLoadingAction(command.key);
    setError('');
    setSuccess('');

    if (isDevSimulated) {
      setSuccess(`✓ "${command.label}" ejecutado correctamente (simulado).`);
      logCommand({ action: command.label, success: true });
      setLoadingAction(null);
      return;
    }

    let actionSuccess = false;
    try {
      await command.run({ markRobotSeated, markRobotStanding });
      actionSuccess = true;
      setSuccess(`✓ "${command.label}" ejecutado correctamente.`);
    } catch (err) {
      setError(err.response?.data?.message ?? `Error al ejecutar "${command.label}".`);
    } finally {
      setLoadingAction(null);
      logCommand({ action: command.label, success: actionSuccess });
    }
  };

  const handleExecute = async (action) => {
    if (!isConnected) return;
    setLoadingAction(action);
    setError('');
    setSuccess('');
    let actionSuccess = false;
    try {
      await actionsApi.postAction(action);
      actionSuccess = true;
      if (/sent/i.test(action) || /sitdown/i.test(action)) {
        markRobotSeated();
      }
      setSuccess(`✓ "${action}" ejecutado correctamente.`);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al ejecutar la acción.');
    } finally {
      setLoadingAction(null);
      logCommand({ action, success: actionSuccess });
    }
  };

  const handlePress = (item) => {
    if (item.source === 'motion') {
      handleMotionCommand(item);
      return;
    }
    handleExecute(item.label);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScreenContainer scrollable>
      {!isConnected && (
        <Text style={styles.hint}>Conectá el robot para ejecutar acciones.</Text>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      <FlatList
        data={listData}
        keyExtractor={(item) => `${item.source}-${item.key}`}
        contentContainerStyle={styles.grid}
        numColumns={2}
        columnWrapperStyle={styles.row}
        scrollEnabled={false}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay acciones disponibles.</Text>
        }
        renderItem={({ item }) => (
          <AppCard style={styles.actionCard}>
            <Text style={styles.cardTitle}>{item.label}</Text>
            <AppButton
              title="Ejecutar"
              onPress={() => handlePress(item)}
              disabled={!isConnected}
              loading={loadingAction === item.key}
              theme={theme}
            />
          </AppCard>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  hint: {
    color: colors.warning,
    padding: spacing.md,
    fontSize: fonts.sizes.md,
  },
  error: {
    color: colors.error,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  success: {
    color: colors.success,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  grid: {
    padding: spacing.md,
  },
  row: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  actionCard: {
    flex: 1,
    gap: spacing.sm,
  },
  cardTitle: {
    color: colors.text,
    fontSize: fonts.sizes.md,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
