import { useCallback } from 'react';

import { useAuth } from '../context/AuthContext';
import { resolveUserId, saveCommand } from '../utils/commandHistory';

export function useCommandLog() {
  const { user } = useAuth();
  const userId = resolveUserId(user);

  const logCommand = useCallback(
    async (command, success) => {
      try {
        await saveCommand(userId, command, success);
      } catch {
        // El logging no debe interrumpir el control del robot.
      }
    },
    [userId]
  );

  return { logCommand };
}
