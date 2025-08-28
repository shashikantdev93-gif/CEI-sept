
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5143/api',
  
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/Auth/Login',
      CAPTCHA: '/Auth/GetCaptchaImage',
      LOGOUT: '/Auth/Logout',
      REFRESH_TOKEN: '/Auth/RefreshToken',
    },
    USER: {
      PROFILE: '/User/Profile',
      UPDATE_PROFILE: '/User/UpdateProfile',
    },
  },

  TIMEOUT: 30000,

  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

export default API_CONFIG;
