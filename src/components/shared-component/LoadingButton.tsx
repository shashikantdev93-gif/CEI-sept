import React from 'react';
import { Button } from 'react-bootstrap';

interface LoadingButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  variant?: string;
  size?: 'sm' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  loadingText?: string;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  children,
  loading = false,
  disabled = false,
  variant = 'primary',
  size,
  type = 'button',
  className = '',
  style,
  onClick,
  loadingText = 'Loading...',
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      type={type}
      disabled={loading || disabled}
      className={`d-flex align-items-center justify-content-center ${className}`}
      style={style}
      onClick={onClick}
    >
      {loading && (
        <span
          className="spinner-border spinner-border-sm me-2"
          role="status"
          aria-hidden="true"
        />
      )}
      {loading ? loadingText : children}
    </Button>
  );
};

export default LoadingButton;
