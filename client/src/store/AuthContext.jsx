import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/auth.js";
import { setUnauthorizedHandler } from "../api/axiosClient.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const clearAuth = useCallback(() => {
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAuth();
    });
    return () => setUnauthorizedHandler(null);
  }, [clearAuth]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const meResult = await authApi.getMe();
        if (!cancelled) setUser(meResult.user);
      } catch {
        try {
          const refreshResult = await authApi.refresh();
          if (!cancelled) setUser(refreshResult.user);
        } catch {
          if (!cancelled) setUser(null);
        }
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateUser(nextUser) {
    setUser(nextUser);
  }

  async function login(credentials) {
    const result = await authApi.login(credentials);
    setUser(result.user);
    return result;
  }

  async function register(userData) {
    const result = await authApi.register(userData);
    setUser(result.user);
    return result;
  }

  async function registerVendor(userData) {
    const result = await authApi.registerVendor(userData);
    setUser(result.user);
    return result;
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch {
      // Still clear local session if the network call fails.
    } finally {
      clearAuth();
    }
  }

  const value = useMemo(
    () => ({
      user,
      authReady,
      isAuthenticated: Boolean(user),
      login,
      register,
      registerVendor,
      logout,
      updateUser,
    }),
    [user, authReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
