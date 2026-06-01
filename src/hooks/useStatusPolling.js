import { useEffect } from 'react';

import { useAuth } from '../context/AuthContext';
import { useRobot } from '../context/RobotContext';

const DEFAULT_INTERVAL_MS = 3000;

export function useStatusPolling(intervalMs = DEFAULT_INTERVAL_MS) {
  const { token } = useAuth();
  const { isConnected, fetchStatus, isDevSimulated } = useRobot();

  useEffect(() => {
    if (!token || !isConnected || isDevSimulated) return undefined;

    const id = setInterval(() => {
      fetchStatus().catch(() => {
        // Errores de red se manejan en fetchStatus / reconexión.
      });
    }, intervalMs);

    return () => clearInterval(id);
  }, [token, isConnected, isDevSimulated, intervalMs, fetchStatus]);
}
