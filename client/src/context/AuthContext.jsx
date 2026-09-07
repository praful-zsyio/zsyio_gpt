import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getToken, setToken, removeToken } from '../services/api.js';
import {
  signInWithGoogle as fbSignInWithGoogle,
  loginWithEmail as fbLoginWithEmail,
  registerWithEmail as fbRegisterWithEmail,
  logoutFromFirebase,
} from '../services/firebase.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth session
  useEffect(() => {
    const initAuth = async () => {
      const existingToken = getToken();
      if (existingToken) {
        try {
          const res = await api.auth.getMe();
          if (res.success && res.data) {
            setUser(res.data);
          }
        } catch (e) {
          console.warn('[Auth] Session restore failed, acquiring guest session');
          removeToken();
        }
      }

      // If no valid session token exists, user remains unauthenticated until real Google sign-in
      if (!getToken()) {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const handleAuthSuccess = (token, userData) => {
    if (token) setToken(token);
    setUser(userData);
  };

  // Standard Login
  const login = async (email, password) => {
    const res = await api.auth.login(email, password);
    if (res.success) {
      handleAuthSuccess(res.data.token, res.data.user);
    }
    return res;
  };

  // Standard Register
  const register = async (name, email, password) => {
    const res = await api.auth.register(name, email, password);
    if (res.success) {
      handleAuthSuccess(res.data.token, res.data.user);
    }
    return res;
  };

  // Firebase Google Login + Backend Sync
  const loginWithGoogle = async () => {
    const fbRes = await fbSignInWithGoogle();
    if (fbRes.success) {
      // Sync with backend API
      const syncRes = await api.auth.syncFirebase(fbRes.user);
      if (syncRes.success) {
        handleAuthSuccess(syncRes.data.token, syncRes.data.user);
        return syncRes;
      }
    }
    return fbRes;
  };

  // Firebase Email Register + Backend Sync
  const registerWithFirebaseEmail = async (email, password, name) => {
    const fbRes = await fbRegisterWithEmail(email, password, name);
    if (fbRes.success) {
      const syncRes = await api.auth.syncFirebase(fbRes.user);
      if (syncRes.success) {
        handleAuthSuccess(syncRes.data.token, syncRes.data.user);
        return syncRes;
      }
    }
    return fbRes;
  };

  // Firebase Email Login + Backend Sync
  const loginWithFirebaseEmail = async (email, password) => {
    const fbRes = await fbLoginWithEmail(email, password);
    if (fbRes.success) {
      const syncRes = await api.auth.syncFirebase(fbRes.user);
      if (syncRes.success) {
        handleAuthSuccess(syncRes.data.token, syncRes.data.user);
        return syncRes;
      }
    }
    return fbRes;
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {}
    await logoutFromFirebase();
    removeToken();
    setUser(null);
  };

  const updateCredits = (newCredits) => {
    if (user) {
      setUser({ ...user, credits: newCredits });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        loginWithGoogle,
        loginWithFirebaseEmail,
        registerWithFirebaseEmail,
        logout,
        updateCredits,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
