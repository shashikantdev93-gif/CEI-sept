import { useState, useCallback } from 'react';
import authService from '../utils/authService';
import { ToastService } from '../utils/navigation';
import type { CaptchaData } from '../types/auth';

export const useCaptcha = () => {
  const [captchaData, setCaptchaData] = useState<CaptchaData | null>(null);
  const [captchaImage, setCaptchaImage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCaptcha = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.getCaptchaImage();
      if (response.success && response.data) {
        setCaptchaData(response.data);
        
        const imgString = response.data.Img.split('"')[1];
        const imageUrl = `data:image/png;base64,${imgString}`;
        setCaptchaImage(imageUrl);
      } else {
        const errorMsg = response.message || 'Failed to load captcha from backend';
        setError(errorMsg);
        ToastService.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = 'Network error while fetching captcha from backend';
      setError(errorMsg);
      ToastService.error(errorMsg);
      console.error('Captcha fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const validateCaptcha = useCallback((inputCode: string): boolean => {
    if (!captchaData) {
      setError('Captcha not loaded');
      return false;
    }

    if (inputCode !== captchaData.captchaCode) {
      setError('Invalid captcha');
      ToastService.error('Invalid captcha');
      generateCaptcha();
      return false;
    }

    setError(null);
    return true;
  }, [captchaData, generateCaptcha]);

  return {
    captchaData,
    captchaImage,
    loading,
    error,
    generateCaptcha,
    validateCaptcha,
  };
};