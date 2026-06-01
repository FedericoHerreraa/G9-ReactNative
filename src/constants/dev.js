/** Token ficticio para sesión local sin API */
export const DEV_AUTH_TOKEN = 'dev-bypass-token';


const devBypassFlag = process.env.EXPO_PUBLIC_DEV_BYPASS_AUTH;

export const isDevBypassAuthEnabled =
  typeof __DEV__ !== 'undefined' && __DEV__ && devBypassFlag !== 'false';

export const isDevMockRobotEnabled =
  isDevBypassAuthEnabled && process.env.EXPO_PUBLIC_DEV_MOCK_ROBOT === 'true';
