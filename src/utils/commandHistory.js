import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@unitree_command_history';
const MAX_ENTRIES = 200;

export async function getCommandHistory() {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function appendCommand({ action, success, timestamp }) {
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    action,
    command: action,
    success: Boolean(success),
    status: success ? 'ok' : 'error',
    timestamp: timestamp ?? new Date().toISOString(),
  };

  const history = await getCommandHistory();
  const next = [entry, ...history].slice(0, MAX_ENTRIES);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return entry;
}

export async function clearCommandHistory() {
  await AsyncStorage.removeItem(HISTORY_KEY);
}
