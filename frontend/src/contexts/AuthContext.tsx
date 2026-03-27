import { useState, createContext, useContext } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://wxd-backend.onrender.com/api';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user } = res.data.data;
      localStorage.setItem('token', token);
      setUser(user);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || '登录失败，请检查邮箱和密码';
      throw new Error(errorMsg);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { email, password, name });
      const { token, user } = res.data.data;
      localStorage.setItem('token', token);
      setUser(user);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || '注册失败，请重试';
      throw new Error(errorMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
