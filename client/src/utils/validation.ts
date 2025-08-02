export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateUrl = (url: string): ValidationResult => {
  if (!url) {
    return { isValid: false, error: 'URL을 입력해주세요.' };
  }

  try {
    const urlObj = new URL(url);
    if (!urlObj.protocol || !urlObj.hostname) {
      return { isValid: false, error: '올바른 URL 형식을 입력해주세요.' };
    }
    
    // 허용된 프로토콜만 체크
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'HTTP 또는 HTTPS 프로토콜만 사용 가능합니다.' };
    }
    
    return { isValid: true };
  } catch {
    return { isValid: false, error: '올바른 URL 형식을 입력해주세요.' };
  }
};

export const validateName = (name: string): ValidationResult => {
  if (!name.trim()) {
    return { isValid: false, error: '도구 이름을 입력해주세요.' };
  }
  
  if (name.length > 100) {
    return { isValid: false, error: '도구 이름은 100자 이하여야 합니다.' };
  }
  
  // XSS 방지를 위한 특수문자 체크
  const dangerousChars = /[<>\"'&]/;
  if (dangerousChars.test(name)) {
    return { isValid: false, error: '도구 이름에 특수문자를 사용할 수 없습니다.' };
  }
  
  return { isValid: true };
};

export const validateDescription = (description: string): ValidationResult => {
  if (description.length > 500) {
    return { isValid: false, error: '설명은 500자 이하여야 합니다.' };
  }
  
  return { isValid: true };
};

export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: '이메일을 입력해주세요.' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: '올바른 이메일 형식을 입력해주세요.' };
  }
  
  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: '비밀번호를 입력해주세요.' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: '비밀번호는 6자 이상이어야 합니다.' };
  }
  
  return { isValid: true };
};

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>\"'&]/g, '') // XSS 방지
    .trim();
}; 