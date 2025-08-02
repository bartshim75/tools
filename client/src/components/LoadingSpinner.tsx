import { Spinner } from 'react-bootstrap';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner = ({ size = 'md', className = '' }: LoadingSpinnerProps) => {
  const spinnerSize = size === 'sm' ? 'sm' : size === 'lg' ? undefined : undefined;
  
  return (
    <div className={`d-flex justify-content-center align-items-center ${className}`}>
      <Spinner animation="border" size={spinnerSize} role="status">
        <span className="visually-hidden">로딩 중...</span>
      </Spinner>
    </div>
  );
}; 