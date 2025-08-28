import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import { FormField, PasswordField, CaptchaField, LoadingButton } from '../ui';
import { useFormValidation, useCaptcha, useAuth } from '../../hooks';


const LoginForm: React.FC = () => {
  const { login, loading } = useAuth();
  
  const {
    formData,
    errors,
    handleFieldChange,
    handleFieldBlur,
    submitForm,
  } = useFormValidation();

  const {
    captchaImage,
    loading: captchaLoading,
    generateCaptcha,
    validateCaptcha,
  } = useCaptcha();

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('LoginForm - handleSubmit called');
    e.preventDefault();
    
    console.log('LoginForm - Form data:', { userName: formData.userName, captchaCode: formData.captchaCode });
    
    const formValidation = submitForm();
    console.log('LoginForm - Form validation result:', formValidation);
    if (!formValidation) {
      console.log('LoginForm - Form validation failed, returning');
      return;
    }

    const captchaValidation = validateCaptcha(formData.captchaCode);
    console.log('LoginForm - Captcha validation result:', captchaValidation);
    if (!captchaValidation) {
      console.log('LoginForm - Captcha validation failed, returning');
      return;
    }

    const loginCredentials = {
      userName: formData.userName,
      password: formData.password,
    };
    
    console.log('LoginForm - Calling login with credentials:', { userName: loginCredentials.userName });
    const success = await login(loginCredentials);
    console.log('LoginForm - Login result:', success);
        
        if (!success) {
          console.log('LoginForm - Login failed, regenerating captcha');
          generateCaptcha();
        }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {}
      <FormField
        label="Username"
        placeholder="Enter username"
        value={formData.userName}
        onChange={(value) => handleFieldChange('userName', value)}
        onBlur={() => handleFieldBlur('userName')}
        error={errors.userName}
        className="form-input-large"
        style={{
          fontSize: '13px',
          fontWeight: '500'
        }}
        required
      />

      {}
      <PasswordField
        label="Password"
        placeholder="Enter your password"
        value={formData.password}
        onChange={(value) => handleFieldChange('password', value)}
        onBlur={() => handleFieldBlur('password')}
        error={errors.password}
        className="password-input-large"
        style={{
          fontSize: '13px',
          fontWeight: '500'
        }}
        required
      />

      {}
      <CaptchaField
        label="Captcha"
        placeholder="Enter Captcha"
        value={formData.captchaCode}
        onChange={(value) => handleFieldChange('captchaCode', value)}
        onBlur={() => handleFieldBlur('captchaCode')}
        error={errors.captchaCode}
        captchaImage={captchaImage}
        onRefreshCaptcha={generateCaptcha}
        loading={captchaLoading}
        className="captcha-input-large"
        style={{
          fontSize: '13px',
          fontWeight: '500'
        }}
        required
      />

      {}
      <LoadingButton
        type="submit"
        loading={loading}
        loadingText="Logging in..."
        className="w-100 rounded-pill fw-medium mb-3"
        style={{
          fontSize: '152x',
          fontWeight: '500'
        }}
      >
        Login
      </LoadingButton>

      {}
      <div className="text-center mb-3">
        <Link
          to="/Signup"
          className="text-decoration-none fw-medium"
          style={{ color: '#0d6efd', fontSize: '17px' }}
        >
          Signup To Create Your Account
        </Link>
        <span className="text-muted mx-2">|</span>
        <Link
          to="#"
          className="text-decoration-none fw-medium"
          style={{ color: '#0d6efd', fontSize: '17px' }}
        >
          Forgot Password?
        </Link>
      </div>

    </Form>
  );
};

export default LoginForm;
