import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import * as actionsApi from '../api/actions';
import { useCommandLog } from '../hooks/useCommandLog';
import { useRobot } from '../context/RobotContext';
import { colors, getRobotTheme, spacing, fonts } from '../constants/theme';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import ScreenContainer from '../components/ScreenContainer';

export default function ActionsScreen() {
  const { isConnected, robotType } = useRobot();
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
    } catch (err) {
      // Mock data para desarrollo sin API
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

  const handleExecute = async (action) => {
    if (!isConnected) return;
    setLoadingAction(action);
    setError('');
    setSuccess('');
    let actionSuccess = false;
    try {
      await actionsApi.postAction(action);
      actionSuccess = true;
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
