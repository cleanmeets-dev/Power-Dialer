import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import {
  AUTH_UNAUTHORIZED_EVENT,
  clearAuthStorage,
  getCurrentUser,
  logout as logoutAPI,
  logoutFromBackend,
} from '../services/api';

export const AuthContext = createContext(null);

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      applyTheme(newTheme);
      return newTheme;
    });
  }, []);

  const clearAuthState = useCallback(() => {
    clearAuthStorage();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const hydrateAuth = useCallback(async () => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      clearAuthState();
      setIsLoading(false);
      return null;
    }

    setIsLoading(true);

    try {
      const currentUser = await getCurrentUser();
      localStorage.setItem('user', JSON.stringify(currentUser));
      setUser(currentUser);
      setIsAuthenticated(true);
      return currentUser;
    } catch (error) {
      console.error('Auth hydration failed:', error);
      clearAuthState();
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthState]);

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  useEffect(() => {
    // Apply theme whenever it changes
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  const login = useCallback((authData) => {
    const nextUser = authData?.user ?? null;
    const token = authData?.token;

    if (!token || !nextUser) {
      throw new Error('login requires a valid token and user payload');
    }

    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(nextUser));
    setUser(nextUser);
    setIsAuthenticated(true);
    setIsLoading(false);
  }, []);

  const signup = useCallback((authData) => {
    login(authData);
  }, [login]);

  const logout = useCallback(async () => {
    try {
      await logoutFromBackend();
    } catch (error) {
      console.error('Backend logout failed:', error);
    } finally {
      logoutAPI();
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      signup,
      logout,
      hydrateAuth,
      theme,
      toggleTheme,
    }),
    [user, isAuthenticated, isLoading, login, signup, logout, hydrateAuth, theme, toggleTheme]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
