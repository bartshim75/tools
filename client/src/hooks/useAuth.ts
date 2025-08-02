import { useState, useEffect } from 'react';
import type { AuthState } from '../types/index.js';
import { supabase } from '../utils/supabase';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAdmin: false,
    email: '',
    password: ''
  });

  const checkAdminStatus = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error checking session:', error);
        setAuthState(prev => ({ ...prev, isAdmin: false }));
      } else {
        setAuthState(prev => ({ ...prev, isAdmin: !!session }));
      }
    } catch (error) {
      console.error('Unexpected error checking session:', error);
      setAuthState(prev => ({ ...prev, isAdmin: false }));
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw new Error(error.message);
      }
      await checkAdminStatus();
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.' };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error logging out:', error);
        throw new Error('로그아웃 중 오류가 발생했습니다.');
      }
      setAuthState(prev => ({ ...prev, isAdmin: false, email: '', password: '' }));
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      setAuthState(prev => ({ ...prev, isAdmin: false }));
      return { success: false, error: error instanceof Error ? error.message : '로그아웃 중 오류가 발생했습니다.' };
    }
  };

  useEffect(() => {
    checkAdminStatus();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState(prev => ({ ...prev, isAdmin: !!session }));
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return {
    isAdmin: authState.isAdmin,
    email: authState.email,
    password: authState.password,
    setEmail: (email: string) => setAuthState(prev => ({ ...prev, email })),
    setPassword: (password: string) => setAuthState(prev => ({ ...prev, password })),
    login,
    logout,
    checkAdminStatus
  };
}; 