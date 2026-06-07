import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import CommandHistoryItem from '../components/CommandHistoryItem';
import { useAuth } from '../context/AuthContext';
import { useRobot } from '../context/RobotContext';
import { getCommandHistory, resolveUserId } from '../utils/commandHistory';
import { colors, getRobotTheme, spacing } from '../constants/theme';

export default function HistoryScreen() {
  const { user } = useAuth();
  const { robotType } = useRobot();
  const theme = getRobotTheme(robotType);
  const userId = resolveUserId(user);
  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      const data = await getCommandHistory(userId);
      setHistory(data);
    } catch {
      setHistory([]);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadHistory();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(item, index) => String(item.id ?? index)}
        renderItem={({ item }) => <CommandHistoryItem item={item} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            {userId
              ? 'El historial de comandos aparecerá aquí.'
              : 'Iniciá sesión para ver tu historial de comandos.'}
          </Text>
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
  list: {
    padding: spacing.md,
    flexGrow: 1,
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
