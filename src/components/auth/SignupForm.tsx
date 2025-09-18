import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import type { SignupFormErrors } from '../../types/auth';
import { FormField, PasswordField, CaptchaField, LoadingButton } from '../shared-component';
import { useCaptcha } from '../../hooks/useCaptcha';
import useSignupValidation from '../../hooks/useSignupValidation';
import authService from '../../services/api/authService';


const SignupForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [generalErrors, setGeneralErrors] = useState<Pick<SignupFormErrors, 'general'>>({});

  const {
    formData,
    errors,
    touched,
    handleFieldChange,
    handleFieldBlur,
    validateForm,
    resetForm,
  } = useSignupValidation();

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
    e.preventDefault();
    setLoading(true);
    
    try {
    // First validate the form and show errors if invalid
    const isFormValid = validateForm();
    if (!isFormValid) {
      setLoading(false); // Stop loading if form is invalid
      return;
    }

    const isCaptchaValid = validateCaptcha(formData.captchaCode);
    if (!isCaptchaValid) {
      setLoading(false); // Stop loading if captcha is invalid
      return;
    }

      const signupResponse = await authService.signup({
        userName: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      if (signupResponse.success) {
        setSuccess('Registration successful! You can now login with your credentials.');
        resetForm();
        generateCaptcha();

      } else {
        setSuccess(null);

        const errorMessage = signupResponse.error || 'Registration failed. Please try again.';

        let userFriendlyError = errorMessage;
        if (errorMessage.toLowerCase().includes('already registered')) {
          userFriendlyError = 'This username is already taken. Please choose a different username.';
        } else if (errorMessage.toLowerCase().includes('invalid')) {
          userFriendlyError = 'Please check your details and try again.';
        } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('connection')) {
          userFriendlyError = 'Network error. Please check your internet connection and try again.';
        }

        setGeneralErrors({ general: userFriendlyError });
        generateCaptcha();
      }
      
    } catch (error) {
      console.error('💥 [SIGNUP-FORM] Error during signup:', error);
      
      setSuccess(null);
      
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.toLowerCase().includes('network')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.message.toLowerCase().includes('timeout')) {
          errorMessage = 'Request timeout. Please try again.';
        } else if (error.message.toLowerCase().includes('server')) {
          errorMessage = 'Server error. Please try again later.';
        }
      }
      
      setGeneralErrors({ general: errorMessage });
      generateCaptcha();
    } finally {
      setLoading(false);
      }
  };

  return (
    <Form onSubmit={handleSubmit} className="w-100">
      {}
      {success && (
        <div className="alert alert-success small d-flex align-items-center" role="alert">
          <i className="bi bi-check-circle-fill me-2" style={{ fontSize: '16px' }}></i>
          <span>{success}</span>
        </div>
      )}

      {}
      {(errors.general || generalErrors.general) && (
        <div className="alert alert-danger small d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2" style={{ fontSize: '16px' }}></i>
          <span>{errors.general || generalErrors.general}</span>
        </div>
      )}

      <div className="mb-3">
        {}
        <FormField
          type="text"
          placeholder="Enter username"
          label="User Name"
          value={formData.username}
          error={touched.username ? errors.username : undefined}
          onChange={(value) => handleFieldChange('username', value)}
          onBlur={() => handleFieldBlur('username')}
          className="form-input-large"
          style={{
            fontSize: '13px',
            fontWeight: '500'
        }}
          required
        />
      </div>

      <div className="mb-3">
        {}
        <PasswordField
          placeholder="Enter your password"
          label="Password"
          value={formData.password}
          error={touched.password ? errors.password : undefined}
          onChange={(value) => handleFieldChange('password', value)}
          onBlur={() => handleFieldBlur('password')}
          className="password-input-large"
          style={{
            fontSize: '13px',
            fontWeight: '500'
        }}
          required
        />
      </div>

      <div className="mb-3">
        {}
        <PasswordField
          placeholder="Confirm your password"
          label="Confirm Password"
          value={formData.confirmPassword}
          error={touched.confirmPassword ? errors.confirmPassword : undefined}
          onChange={(value) => handleFieldChange('confirmPassword', value)}
          onBlur={() => handleFieldBlur('confirmPassword')}
          className="password-input-large"
          style={{
            fontSize: '13px',
            fontWeight: '500'
          }}
          required
        />
      </div>

      <div className="mb-1">
        {}
        <CaptchaField
          placeholder="Enter Captcha"
          label="Captcha"
          value={formData.captchaCode}
          error={touched.captchaCode ? errors.captchaCode : undefined}
          onChange={(value) => handleFieldChange('captchaCode', value)}
          onBlur={() => handleFieldBlur('captchaCode')}
          captchaImage={captchaImage}
          loading={captchaLoading}
          onRefreshCaptcha={generateCaptcha}
          className="captcha-input-large"
          style={{
            fontSize: '13px',
            fontWeight: '500'
        }}
          required
        />
      </div>

      {}
      <LoadingButton
        type="submit"
        variant="primary"
        size="lg"
        loading={loading || captchaLoading}
        className="w-100 rounded-pill py-2 mt-2"
        style={{
          fontSize: '15px',
          fontWeight: '500'
        }}
      >
        Register
      </LoadingButton>

      {}
      <div className="text-center mt-3" >
        <p className="mb-1" style={{ fontSize: '14px', color: '#666' }}>
          Already have a Chief Electrical Inspector account?{' '}
          <Link 
            to="/" 
            className="text-decoration-none"
            style={{ color: '#007bff', fontWeight: '500' }}
          >
            Login
          </Link>
        </p>
        <p className="mb-0" style={{ fontSize: '14px', color: '#666' }}>
          Need Technical Assistance?{' '}
          <Link 
            to="/contact" 
            className="text-decoration-none"
            style={{ color: '#007bff' }}
          >
            Contact Us
          </Link>
        </p>
      </div>

      {}

    </Form>
  );
};

export default SignupForm;
