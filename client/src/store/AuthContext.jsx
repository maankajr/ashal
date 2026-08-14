import { createContext, useContext, useMemo, useState } from "react";
import * as authApi from "../api/auth.js";

const AuthContext = createContext(null);

const TOKEN_KEY = "ashal_token";
const USER_KEY = "ashal_user";

function readStoredUser() {
  try {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  function persistAuth(nextToken, nextUser) {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  }

  function updateUser(nextUser) {
    setUser(nextUser);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  }

  function clearAuth() {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  async function login(credentials) {
    const result = await authApi.login(credentials);
    persistAuth(result.token, result.user);
    return result;
  }

  async function register(userData) {
    const result = await authApi.register(userData);
    persistAuth(result.token, result.user);
    return result;
  }

  async function registerVendor(userData) {
    const result = await authApi.registerVendor(userData);
    persistAuth(result.token, result.user);
    return result;
  }

  function logout() {
    clearAuth();
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      registerVendor,
      logout,
      updateUser,
    }),
    [user, token]
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
