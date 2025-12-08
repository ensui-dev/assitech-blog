import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await authApi.me();
          setUser(response.data.user);
          setToken(storedToken);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authApi.login(email, password);
    const { user: userData, token: authToken } = response.data;

    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);

    return userData;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAdmin,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
