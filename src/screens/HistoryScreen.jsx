import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import CommandHistoryItem from '../components/CommandHistoryItem';
import * as historyApi from '../api/history';
import { useRobot } from '../context/RobotContext';
import { colors, getRobotTheme, spacing, fonts } from '../constants/theme';

function normalizeHistoryList(data) {
  if (Array.isArray(data)) return data;
  return data?.items ?? [];
}

export default function HistoryScreen() {
  const { robotType } = useRobot();
  const theme = getRobotTheme(robotType);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadHistory = useCallback(async () => {
    setError('');
    try {
      const data = await historyApi.getHistory();
      setHistory(normalizeHistoryList(data));
    } catch (err) {
      setHistory([]);
      setError(err.response?.data?.message ?? 'No se pudo cargar el historial.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        setLoading(true);
        await loadHistory();
        if (active) setLoading(false);
      })();
      return () => {
        active = false;
      };
    }, [loadHistory])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
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
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={history}
        keyExtractor={(item, index) => String(item.id ?? index)}
        renderItem={({ item }) => <CommandHistoryItem item={item} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>El historial de comandos aparecerá aquí.</Text>
        }
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
  error: {
    color: colors.error,
    padding: spacing.md,
    fontSize: fonts.sizes.md,
  },
  list: {
    padding: spacing.md,
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
