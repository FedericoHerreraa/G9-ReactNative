import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import * as authApi from '../api/auth';
import client, { setUnauthorizedHandler } from '../api/client';
import { DEV_AUTH_TOKEN, isDevBypassAuthEnabled } from '../constants/dev';
import { clearSession, getToken, getUser, setToken, setUser } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [token, setTokenState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const applySession = useCallback(async (nextToken, nextUser) => {
    if (nextToken) await setToken(nextToken);
    if (nextUser) await setUser(nextUser);
    setTokenState(nextToken ?? null);
    setUserState(nextUser ?? null);
  }, []);

  const clearLocalSession = useCallback(async () => {
    await clearSession();
    setTokenState(null);
    setUserState(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setTokenState(null);
      setUserState(null);
    });

    async function restoreSession() {
      try {
        const storedToken = await getToken();
        const storedUser = await getUser();
        if (storedToken) {
          setTokenState(storedToken);
          setUserState(storedUser);
          client.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
        }
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  const login = useCallback(
    async (identifier, password) => {
      const data = await authApi.login(identifier, password);
      const nextToken = data.access_token ?? data.token;
      const nextUser = data.user ?? { identifier };
      await applySession(nextToken, nextUser);
      return data;
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    await clearLocalSession();
  }, [clearLocalSession]);

  const loginAsDev = useCallback(async () => {
    const devUser = { identifier: 'dev@local', username: 'dev' };
    setTokenState(DEV_AUTH_TOKEN);
    setUserState(devUser);
    client.defaults.headers.common.Authorization = `Bearer ${DEV_AUTH_TOKEN}`;
    try {
      await setToken(DEV_AUTH_TOKEN);
      await setUser(devUser);
    } catch {
      // Si AsyncStorage falla, la sesión en memoria igual permite probar la UI
    }
    return { access_token: DEV_AUTH_TOKEN, user: devUser };
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      loginAsDev,
      logout,
      isLoading,
      isAuthenticated: Boolean(token),
      isDevBypassAuthEnabled,
    }),
    [user, token, login, loginAsDev, logout, isLoading, isDevBypassAuthEnabled]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
