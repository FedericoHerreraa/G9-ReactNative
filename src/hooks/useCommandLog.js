import { useCallback } from 'react';

import { postCommand } from '../api/history';

/**
 * Interfaz única para registrar comandos enviados al robot.
 *
 * Uso:
 *   const { logCommand } = useCommandLog();
 *   await logCommand({ action: 'move_forward', success: true });
 *
 * El shape que se envía al servidor:
 *   { action: string, success: boolean, timestamp: string (ISO 8601) }
 */
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
      // El logging nunca debe cortar el flujo de control del robot.
      // Si hay error (offline, token vencido, etc.) se ignora silenciosamente.
    }
  }, []);

  return { logCommand };
}
