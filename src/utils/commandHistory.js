import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY_PREFIX = 'command_history_';

export function resolveUserId(user) {
  if (!user) return null;
  const id = user.id ?? user.identifier ?? user.email ?? user.username;
  return id ? String(id) : null;
}

function getHistoryKey(userId) {
  return `${HISTORY_KEY_PREFIX}${userId}`;
}

export async function getCommandHistory(userId) {
  if (!userId) return [];
  try {
    const raw = await AsyncStorage.getItem(getHistoryKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveCommand(userId, command, success) {
  if (!userId) return;
  const history = await getCommandHistory(userId);
  const entry = {
    id: Date.now().toString(),
    command,
    success: Boolean(success),
    timestamp: new Date().toISOString(),
  };
  history.unshift(entry);
  await AsyncStorage.setItem(getHistoryKey(userId), JSON.stringify(history));
}
