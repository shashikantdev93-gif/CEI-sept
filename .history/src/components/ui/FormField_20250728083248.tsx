import React from 'react';
import { Form } from 'react-bootstrap';

interface FormFieldProps {
  label: string;
  type?: string;
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

const FormField: React.FC<FormFieldProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  className = '',
  style,
  disabled = false,
}) => {
  const isLarge = className.includes('form-input-large');

  return (
    <Form.Group className="mb-2">
      <Form.Label 
        className={`fw-normal text-dark ${isLarge ? 'fs-7 mb-1' : 'fs-7 mb-1'}`}
        style={{ fontSize: '14px' }}
      >
        {label} {required && <span className="text-danger" >*</span>}
      </Form.Label>
      <Form.Control
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        required={required}
        disabled={disabled}
        className={`rounded-pill border-1 ${isLarge ? 'py-2 px-3' : 'py-1 px-3'} ${error ? 'is-invalid' : ''}`}
        style={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          minHeight: isLarge ? '38px' : '36px',
          fontSize: '18px',
          ...style,
        }}
      />
      {error && (
        <div className="invalid-feedback" style={{ fontSize: '11px' }}>
          {error}
        </div>
      )}
    </Form.Group>
  );
};

export default FormField;
