import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import * as actionsApi from '../api/actions';
import { freeJumpRobot } from '../api/robot';
import { useCommandLog } from '../hooks/useCommandLog';
import { useRobot } from '../context/RobotContext';
import { colors, getRobotTheme, spacing, fonts } from '../constants/theme';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import ScreenContainer from '../components/ScreenContainer';

export default function ActionsScreen() {
  const { isConnected, robotType, markRobotSeated } = useRobot();
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
      console.log('[ActionsScreen] GET /actions response:', JSON.stringify(data));
      const list = Array.isArray(data) ? data : (data.actions ?? []);
      setActions(list);
    } catch (_err) {
      // Mock data para desarrollo sin API
      const mockActions = [
        'hello', 'stretch', 'dance1', 'dance2', 'heart',
        'left_flip', 'back_flip', 'front_flip',
        'balance_stand', 'recovery_stand', 'free_walk',
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

  const handleJump = async () => {
    if (!isConnected) return;
    setLoadingAction('freejump');
    setError('');
    setSuccess('');
    let actionSuccess = false;
    try {
      await freeJumpRobot(true);
      actionSuccess = true;
      setSuccess('✓ "Saltar" ejecutado correctamente.');
    } catch (err) {
      setError(err.response?.data?.detail ?? err.response?.data?.message ?? 'Error al ejecutar el salto.');
    } finally {
      setLoadingAction(null);
      logCommand('freejump', actionSuccess);
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
      logCommand(`action/${action}`, actionSuccess);
    }
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

      <AppCard style={styles.jumpCard}>
        <Text style={styles.cardTitle}>Saltar</Text>
        <AppButton
          title="Ejecutar"
          onPress={handleJump}
          disabled={!isConnected}
          loading={loadingAction === 'freejump'}
          theme={theme}
        />
      </AppCard>

      <FlatList
        data={actions}
        keyExtractor={(item, index) => String(item ?? index)}
        contentContainerStyle={styles.grid}
        numColumns={2}
        columnWrapperStyle={styles.row}
        scrollEnabled={false}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay acciones disponibles.</Text>
        }
        renderItem={({ item }) => (
          <AppCard style={styles.actionCard}>
            <Text style={styles.cardTitle}>{item}</Text>
            <AppButton
              title="Ejecutar"
              onPress={() => handleExecute(item)}
              disabled={!isConnected}
              loading={loadingAction === item}
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
  jumpCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
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
