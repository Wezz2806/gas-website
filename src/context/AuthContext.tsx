import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string, role: 'student' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (formData: FormData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Prevent double-calling in React StrictMode (dev only)
  const initCalled = useRef(false);

  // Check session once on mount
  useEffect(() => {
    if (initCalled.current) return;
    initCalled.current = true;

    authService.checkSession()
      .then(response => {
        if (response.success && response.user) {
          setUser(response.user);
          setIsAuthenticated(true);
        }
      })
      .catch(() => {
        // Session not found / expired — keep unauthenticated state
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authService.login(email, password);
    if (response.success && response.user) {
      setUser(response.user);
      setIsAuthenticated(true);
    }
  }, []);

  const register = useCallback(async (
    fullName: string,
    email: string,
    password: string,
    role: 'student' | 'admin'
  ) => {
    await authService.register(fullName, email, password, role);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore — clear local state regardless
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const updateUserProfile = useCallback(async (formData: FormData) => {
    const response = await authService.updateProfile(formData);
    if (response.success && response.user) {
      setUser(response.user);
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders in consumers
  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth harus digunakan di dalam komponen AuthProvider');
  }
  return context;
}
