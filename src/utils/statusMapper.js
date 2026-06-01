
export function mapConnectionState(connectionState) {
  const state = connectionState ?? 'disconnected';
  const valid = ['connected', 'disconnected', 'connecting', 'error'];
  return valid.includes(state) ? state : 'disconnected';
}

export function isConnectedState(connectionState) {
  return mapConnectionState(connectionState) === 'connected';
}
