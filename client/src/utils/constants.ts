// 환경 변수
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 애플리케이션 설정
export const APP_CONFIG = {
  name: 'GrowthCamp AX Tools',
  version: '1.0.0',
  description: 'GrowthCamp의 다양한 도구들을 한 곳에서 관리하고 접근할 수 있는 웹 애플리케이션',
  maxNameLength: 100,
  maxDescriptionLength: 500,
  minPasswordLength: 6,
  alertTimeout: 3000, // 3초
  reorderTimeout: 5000, // 5초
} as const;

// API 설정
export const API_CONFIG = {
  retryAttempts: 3,
  retryDelay: 1000, // 1초
  timeout: 10000, // 10초
} as const;

// UI 설정
export const UI_CONFIG = {
  skeletonCardCount: 6,
  dragDropSensitivity: 5,
  animationDuration: 300,
} as const;

// 유효성 검사 규칙
export const VALIDATION_RULES = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+/,
  dangerousChars: /[<>\"'&]/,
} as const;

// 에러 메시지
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  AUTH_ERROR: '인증에 실패했습니다.',
  VALIDATION_ERROR: '입력값을 확인해주세요.',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
  FETCH_TOOLS_ERROR: '도구 목록을 불러오는 중 오류가 발생했습니다.',
  ADD_TOOL_ERROR: '도구 추가 중 오류가 발생했습니다.',
  UPDATE_TOOL_ERROR: '도구 수정 중 오류가 발생했습니다.',
  DELETE_TOOL_ERROR: '도구 삭제 중 오류가 발생했습니다.',
  REORDER_TOOLS_ERROR: '순서 변경 중 오류가 발생했습니다.',
} as const;

// 성공 메시지
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '관리자로 로그인되었습니다!',
  LOGOUT_SUCCESS: '로그아웃되었습니다.',
  ADD_TOOL_SUCCESS: '도구가 추가되었습니다.',
  UPDATE_TOOL_SUCCESS: '도구가 변경되었습니다.',
  DELETE_TOOL_SUCCESS: '도구가 삭제되었습니다.',
  REORDER_TOOLS_SUCCESS: '도구 순서가 성공적으로 변경되었습니다!',
  TOGGLE_VISIBILITY_SUCCESS: '도구 가시성이 변경되었습니다.',
} as const; 