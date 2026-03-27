import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // 检查本地存储的token
    const token = localStorage.getItem('token');
    if (token) {
      // 验证token
      api.get('/auth/me')
        .then(res => {
          if (res.data.success) {
            setUser(res.data.data);
          } else {
            localStorage.removeItem('token');
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);
  
  const register = async (email: string, password: string, name?: string) => {
    const res = await api.post('/auth/register', { email, password, name: name || email.split('@')[0] });
    if (res.data.success) {
      localStorage.setItem('token', res.data.data.token);
      setUser(res.data.data.user);
      return res.data;
    }
    throw new Error(res.data.error || '注册失败');
  };
  
  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('token', res.data.data.token);
      setUser(res.data.data.user);
      return res.data;
    }
    throw new Error(res.data.error || '登录失败');
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };
  
  const isLoggedIn = () => !!user;
  
  return { user, loading, register, login, logout, isLoggedIn };
}
