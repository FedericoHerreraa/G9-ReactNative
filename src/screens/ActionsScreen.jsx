import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import * as actionsApi from '../api/actions';
import { useRobot } from '../context/RobotContext';
import { colors, getRobotTheme, spacing, fonts } from '../constants/theme';

export default function ActionsScreen() {
  const { isConnected, robotType } = useRobot();
  const theme = getRobotTheme(robotType);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadActions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // TODO: connect to API — mapear respuesta del listado de acciones
      const data = await actionsApi.getActions();
      const list = Array.isArray(data) ? data : (data.items ?? []);
      setActions(list);
    } catch (err) {
      setError(err.response?.data?.message ?? 'No se pudieron cargar las acciones.');
      setActions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActions();
  }, [loadActions]);

  const handleExecute = async (action) => {
    if (!isConnected) return;
    try {
      await actionsApi.postAction(action.id ?? action.name, { robot_type: robotType });
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al ejecutar la acción.');
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
    <View style={styles.container}>
      {!isConnected ? (
        <Text style={styles.hint}>Conectá el robot para ejecutar acciones.</Text>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={actions}
        keyExtractor={(item, index) => String(item.id ?? item.name ?? index)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay acciones disponibles.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, !isConnected && styles.cardDisabled]}
            onPress={() => handleExecute(item)}
            disabled={!isConnected}>
            <Text style={styles.cardTitle}>{item.name ?? item.label ?? 'Acción'}</Text>
            {item.description ? (
              <Text style={styles.cardDesc}>{item.description}</Text>
            ) : null}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  },
  list: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardTitle: {
    color: colors.text,
    fontSize: fonts.sizes.lg,
    fontWeight: '600',
  },
  cardDesc: {
    color: colors.textMuted,
    marginTop: spacing.xs,
    fontSize: fonts.sizes.md,
  },
});
