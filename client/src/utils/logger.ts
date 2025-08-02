type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  error?: Error;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private addLog(level: LogLevel, message: string, data?: any, error?: Error): void {
    const logEntry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level,
      message,
      data,
      error
    };

    this.logs.push(logEntry);

    // 로그 개수 제한
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // 개발 환경에서만 콘솔 출력
    if (import.meta.env.DEV) {
      const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      console[consoleMethod](`[${level.toUpperCase()}] ${message}`, data || '', error || '');
    }
  }

  debug(message: string, data?: any): void {
    this.addLog('debug', message, data);
  }

  info(message: string, data?: any): void {
    this.addLog('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.addLog('warn', message, data);
  }

  error(message: string, error?: Error, data?: any): void {
    this.addLog('error', message, data, error);
  }

  // API 호출 로깅
  logApiCall(endpoint: string, method: string, data?: any): void {
    this.info(`API ${method} ${endpoint}`, data);
  }

  // 사용자 액션 로깅
  logUserAction(action: string, details?: any): void {
    this.info(`User action: ${action}`, details);
  }

  // 에러 로깅
  logError(context: string, error: Error, additionalData?: any): void {
    this.error(`Error in ${context}`, error, additionalData);
  }

  // 성능 로깅
  logPerformance(operation: string, duration: number): void {
    this.info(`Performance: ${operation} took ${duration}ms`);
  }

  // 로그 내보내기 (디버깅용)
  exportLogs(): LogEntry[] {
    return [...this.logs];
  }

  // 로그 초기화
  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = new Logger(); 