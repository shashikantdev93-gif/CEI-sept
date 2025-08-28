import React from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';

interface CaptchaFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  captchaImage: string;
  onRefreshCaptcha: () => void;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const CaptchaField: React.FC<CaptchaFieldProps> = ({
  label,
  placeholder = 'Enter Captcha',
  value,
  onChange,
  onBlur,
  error,
  required = false,
  captchaImage,
  onRefreshCaptcha,
  loading = false,
  className = '',
  style,
}) => {
  const isLarge = className.includes('captcha-input-large');

  return (
    <Form.Group className="mb-2">
      <Form.Label 
        className={`fw-normal text-dark ${isLarge ? 'fs-7 mb-1' : 'fs-7 mb-1'}`}
        style={{ fontSize: '14px' }}
      >
        {label} {required && <span className="text-danger">*</span>}
      </Form.Label>
      <Row className="g-2 align-items-center">
        <Col xs={12} sm={7}>
          <Form.Control
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            required={required}
            className={`rounded-pill border-1 ${isLarge ? 'py-2 px-3' : 'py-1 px-3'} ${error ? 'is-invalid' : ''}`}
            style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              minHeight: isLarge ? '38px' : '36px',
              fontSize: '14px',
              ...style,
            }}
          />
        </Col>
        <Col xs={12} sm={5}>
          <div
            className={`d-flex align-items-center justify-content-center rounded-pill p-1`}
            style={{ 
              backgroundColor: '#e3f2fd', 
              height: isLarge ? '38px' : '36px' 
            }}
          >
            {captchaImage ? (
              <img
                src={captchaImage}
                alt="Captcha"
                className="rounded"
                style={{ 
                  width: '100px', 
                  height: '32px',
                  backgroundColor: 'white',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <div 
                style={{ 
                  width: '100px', 
                  height: '32px',
                  backgroundColor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#666'
                }}
              >
                {loading ? 'Loading...' : 'No Captcha'}
              </div>
            )}
            
            <Button
              variant="primary"
              size="sm"
              className="rounded-circle border-0 ms-2"
              onClick={onRefreshCaptcha}
              disabled={loading}
              type="button"
              style={{
                width: '32px',
                height: '32px',
                fontSize: '18px',
                backgroundColor:"white"
               
              }}
            >
              🔄
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <div className="text-danger mt-2" style={{ fontSize: '12px' }}>
          {error}
        </div>
      )}
    </Form.Group>
  );
};

export default CaptchaField;
