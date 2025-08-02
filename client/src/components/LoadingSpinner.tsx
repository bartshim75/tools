import React, { memo } from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
}

const LoadingSpinner = memo<LoadingSpinnerProps>(({ 
  message = '로딩 중...', 
  size = 'md',
  variant = 'primary'
}) => {
  const sizeClass = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg'
  }[size];

  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-4">
      <div className={`spinner-border ${sizeClass} text-${variant}`} role="status">
        <span className="visually-hidden">{message}</span>
      </div>
      {message && (
        <div className="mt-2 text-muted">
          {message}
        </div>
      )}
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner; 