import { useCallback } from 'react';

import { postCommand } from '../api/history';
import { appendCommand } from '../utils/commandHistory';

export function useCommandLog() {
  const logCommand = useCallback(async ({ action, success }) => {
    const entry = {
      action,
      success,
      timestamp: new Date().toISOString(),
    };

    try {
      await postCommand(entry);
    } catch {
      // Sin endpoint de historial o sin red: se guarda solo en el dispositivo.
    }

    try {
      await appendCommand(entry);
    } catch {
      // El logging no debe interrumpir el control del robot.
    }
  }, []);

  return { logCommand };
}
