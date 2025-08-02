import { logger } from './logger';

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // 성능 측정 시작
  startTimer(operation: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.recordMetric(operation, duration);
      logger.logPerformance(operation, duration);
    };
  }

  // 메트릭 기록
  private recordMetric(operation: string, duration: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    
    const operationMetrics = this.metrics.get(operation)!;
    operationMetrics.push(duration);
    
    // 최대 100개 메트릭만 유지
    if (operationMetrics.length > 100) {
      operationMetrics.splice(0, operationMetrics.length - 100);
    }
  }

  // 평균 성능 계산
  getAveragePerformance(operation: string): number {
    const metrics = this.metrics.get(operation);
    if (!metrics || metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, val) => acc + val, 0);
    return sum / metrics.length;
  }

  // 최고 성능 기록
  getBestPerformance(operation: string): number {
    const metrics = this.metrics.get(operation);
    if (!metrics || metrics.length === 0) return 0;
    
    return Math.min(...metrics);
  }

  // 최저 성능 기록
  getWorstPerformance(operation: string): number {
    const metrics = this.metrics.get(operation);
    if (!metrics || metrics.length === 0) return 0;
    
    return Math.max(...metrics);
  }

  // 성능 통계
  getPerformanceStats(operation: string): {
    average: number;
    best: number;
    worst: number;
    count: number;
  } {
    const metrics = this.metrics.get(operation);
    if (!metrics || metrics.length === 0) {
      return { average: 0, best: 0, worst: 0, count: 0 };
    }
    
    return {
      average: this.getAveragePerformance(operation),
      best: this.getBestPerformance(operation),
      worst: this.getWorstPerformance(operation),
      count: metrics.length
    };
  }

  // 모든 메트릭 내보내기
  exportMetrics(): Record<string, number[]> {
    const result: Record<string, number[]> = {};
    this.metrics.forEach((value, key) => {
      result[key] = [...value];
    });
    return result;
  }

  // 메트릭 초기화
  clearMetrics(): void {
    this.metrics.clear();
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// 편의 함수들
export const measurePerformance = (operation: string) => {
  return performanceMonitor.startTimer(operation);
};

export const getPerformanceStats = (operation: string) => {
  return performanceMonitor.getPerformanceStats(operation);
}; 