import { useCallback } from 'react';

import { postCommand } from '../api/history';


export function useCommandLog() {
  const logCommand = useCallback(async ({ action, success }) => {
    try {
      await postCommand({
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
