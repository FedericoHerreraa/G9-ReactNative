import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import * as authApi from '../api/auth';
import client, { setUnauthorizedHandler } from '../api/client';
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
    async (email, password) => {
      const data = await authApi.login(email, password);
      const nextToken = data.token ?? data.access_token;
      const nextUser = data.user ?? { email, id: data.user_id };
      await applySession(nextToken, nextUser);
      return data;
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    await clearLocalSession();
  }, [clearLocalSession]);

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      isLoading,
      isAuthenticated: Boolean(token),
    }),
    [user, token, login, logout, isLoading]
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
