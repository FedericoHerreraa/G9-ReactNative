import { useCallback } from 'react';

import { appendCommand } from '../utils/commandHistory';

/**
 * Registra comandos enviados al robot en historial local (AsyncStorage).
 * La API REST no expone endpoint de historial.
 */
export function useCommandLog() {
  const logCommand = useCallback(async ({ action, success }) => {
    try {
      await appendCommand({
        action,
        success,
        timestamp: new Date().toISOString(),
      });
    } catch {
      // El logging no debe interrumpir el control del robot.
    }
  }, []);

  return { logCommand };
}
