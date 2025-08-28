import React from 'react';
import { Form, Button } from 'react-bootstrap';

interface PasswordFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  placeholder = 'Enter your password',
  value,
  onChange,
  onBlur,
  error,
  required = false,
  className = '',
  style,
  disabled = false,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  
  const isLarge = className.includes('password-input-large');

  return (
    <Form.Group className="mb-2 position-relative">
      <Form.Label 
        className={`fw-normal text-dark ${isLarge ? 'fs-7 mb-1' : 'fs-7 mb-1'}`}
        style={{ fontSize: '14px' }}
      >
        {label} {required && <span className="text-danger">*</span>}
      </Form.Label>
      <div className="position-relative">
        <Form.Control
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          required={required}
          disabled={disabled}
          className={`rounded-pill border-1 pe-5 ${isLarge ? 'py-2 ps-3' : 'py-1 ps-3'} ${error ? 'is-invalid' : ''}`}
          style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            minHeight: isLarge ? '38px' : '36px',
            fontSize: '14px',
            paddingRight: '45px',
            ...style,
          }}
        />
        <Button
          variant="link"
          className="border-0 position-absolute top-50 end-0 me-2 translate-middle-y p-0"
          style={{
            zIndex: 10,
            width: '20px',
            height: '20px',
          }}
          onClick={() => setShowPassword(!showPassword)}
          type="button"
        >
          <i 
            className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} 
            style={{ fontSize: '14px', color: '#6c757d' }}
          />
        </Button>
      </div>
      {error && (
        <div className="invalid-feedback d-block" style={{ fontSize: '11px' }}>
          {error}
        </div>
      )}
    </Form.Group>
  );
};

export default PasswordField;
