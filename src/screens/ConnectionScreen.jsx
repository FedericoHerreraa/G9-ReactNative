import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import RobotSelector from '../components/RobotSelector';
import StatusBadge from '../components/StatusBadge';
import { useRobot } from '../context/RobotContext';
import { colors, getRobotTheme, spacing, fonts } from '../constants/theme';

export default function ConnectionScreen() {
  const {
    robotType,
    setRobotType,
    isConnected,
    connectionStatus,
    networkInterface,
    setNetworkInterface,
    statusData,
    connectRobot,
    disconnectRobot,
    refreshStatus,
  } = useRobot();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const theme = getRobotTheme(robotType);

  const handleConnect = async () => {
    setError('');
    setLoading(true);
    try {
      // TODO: connect to API — manejar estados intermedios del backend
      await connectRobot();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al conectar con el robot.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setError('');
    setLoading(true);
    try {
      await disconnectRobot();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al desconectar.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setError('');
    try {
      await refreshStatus();
    } catch (err) {
      setError(err.response?.data?.message ?? 'No se pudo obtener el estado.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Tipo de robot</Text>
      <RobotSelector value={robotType} onChange={setRobotType} />

      <Text style={styles.sectionTitle}>Interfaz de red</Text>
      <TextInput
        style={styles.input}
        value={networkInterface}
        onChangeText={setNetworkInterface}
        placeholder="eth0"
        placeholderTextColor={colors.textMuted}
        editable={!isConnected}
      />

      <View style={styles.statusRow}>
        <StatusBadge status={connectionStatus} />
        {isConnected ? (
          <Pressable onPress={handleRefresh}>
            <Text style={[styles.refreshLink, { color: theme.primary }]}>
              Actualizar estado
            </Text>
          </Pressable>
        ) : null}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        <Pressable
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={handleConnect}
          disabled={isConnected || loading}>
          {loading && !isConnected ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Conectar</Text>
          )}
        </Pressable>
        <Pressable
          style={[styles.button, styles.buttonOutline]}
          onPress={handleDisconnect}
          disabled={!isConnected || loading}>
          <Text style={styles.buttonOutlineText}>Desconectar</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Estado (JSON)</Text>
      <View style={styles.jsonBox}>
        <Text style={styles.jsonText}>
          {statusData ? JSON.stringify(statusData, null, 2) : 'Sin datos de estado'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fonts.sizes.lg,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
    color: colors.text,
    fontSize: fonts.sizes.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  refreshLink: {
    fontSize: fonts.sizes.md,
    fontWeight: '600',
  },
  error: {
    color: colors.error,
    fontSize: fonts.sizes.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontWeight: '700',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonOutlineText: {
    color: colors.text,
    fontWeight: '600',
  },
  jsonBox: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 120,
  },
  jsonText: {
    color: colors.textMuted,
    fontFamily: 'monospace',
    fontSize: fonts.sizes.sm,
  },
});
