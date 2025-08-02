import { useState, useEffect } from 'react';
import type { AuthState } from '../types/index.js';
import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';
import { measurePerformance } from '../utils/performance';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAdmin: false,
    email: '',
    password: ''
  });

  const checkAdminStatus = async () => {
    const endTimer = measurePerformance('checkAdminStatus');
    try {
      logger.logApiCall('auth/session', 'GET');
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        logger.logError('checkAdminStatus', error);
        setAuthState(prev => ({ ...prev, isAdmin: false }));
      } else {
        logger.info('Admin status checked', { isAdmin: !!session });
        setAuthState(prev => ({ ...prev, isAdmin: !!session }));
      }
    } catch (error) {
      logger.logError('checkAdminStatus', error as Error);
      setAuthState(prev => ({ ...prev, isAdmin: false }));
    } finally {
      endTimer();
    }
  };

  const login = async (email: string, password: string) => {
    const endTimer = measurePerformance('login');
    try {
      logger.logUserAction('login', { email });
      logger.logApiCall('auth/signin', 'POST');
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw new Error(error.message);
      }
      await checkAdminStatus();
      logger.info('Login successful', { email });
      return { success: true };
    } catch (error) {
      logger.logError('login', error as Error, { email });
      return { success: false, error: error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.' };
    } finally {
      endTimer();
    }
  };

  const logout = async () => {
    const endTimer = measurePerformance('logout');
    try {
      logger.logUserAction('logout');
      logger.logApiCall('auth/signout', 'POST');
      const { error } = await supabase.auth.signOut();
      if (error) {
        logger.logError('logout', error);
        throw new Error('로그아웃 중 오류가 발생했습니다.');
      }
      setAuthState(prev => ({ ...prev, isAdmin: false, email: '', password: '' }));
      logger.info('Logout successful');
      return { success: true };
    } catch (error) {
      logger.logError('logout', error as Error);
      setAuthState(prev => ({ ...prev, isAdmin: false }));
      return { success: false, error: error instanceof Error ? error.message : '로그아웃 중 오류가 발생했습니다.' };
    } finally {
      endTimer();
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