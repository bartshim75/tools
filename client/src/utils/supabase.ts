import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './constants';

// 환경 변수 검증
if (!SUPABASE_URL) {
  throw new Error('VITE_SUPABASE_URL 환경 변수가 설정되지 않았습니다. GitHub Secrets를 확인해주세요.');
}

if (!SUPABASE_ANON_KEY) {
  throw new Error('VITE_SUPABASE_ANON_KEY 환경 변수가 설정되지 않았습니다. GitHub Secrets를 확인해주세요.');
}

// 싱글톤 Supabase 클라이언트
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseInstance;
};

// 기본 export로도 제공
export const supabase = getSupabaseClient(); 