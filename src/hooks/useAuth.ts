
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type{ AuthState } from '../types';

import { authService, NavigationService, ToastService } from '../utils';
import { encryptionService } from '../lib';

export const useAuth = () => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    // Check if user is intentionally navigating to specific pages
    const allowProjectDetails = sessionStorage.getItem('allowProjectDetailsNavigation');
    const allowApplicationForm = sessionStorage.getItem('allowApplicationFormNavigation');
    const allowContractorDetails = sessionStorage.getItem('allowContractorDetailsNavigation');
    const allowEstablishedForm = sessionStorage.getItem('allowEstablishedFormNavigation');
    const allowUserDetailsForm = sessionStorage.getItem('allowUserDetailsFormNavigation');
    const currentPath = window.location.pathname;
    

    if (allowProjectDetails === 'true' && currentPath === '/ProjectDetails') {
      console.log('useAuth - Allowing intentional navigation to ProjectDetails');
      sessionStorage.removeItem('allowProjectDetailsNavigation');
      return; // Skip navigation service check
    }

    if (allowApplicationForm === 'true' && currentPath === '/ApplicationForm') {
      console.log('useAuth - Allowing intentional navigation to ApplicationForm');
      sessionStorage.removeItem('allowApplicationFormNavigation');
      return; // Skip navigation service check
    }

    if (allowContractorDetails === 'true' && currentPath === '/contractor-applicant-details') {
      console.log('useAuth - Allowing intentional navigation to ContractorApplicantDetails');
      sessionStorage.removeItem('allowContractorDetailsNavigation');
      return; // Skip navigation service check
    }

    if (allowEstablishedForm === 'true' && currentPath === '/CommonApplicationFormEstablished') {
      console.log('useAuth - Allowing intentional navigation to EstablishedForm');
      sessionStorage.removeItem('allowEstablishedFormNavigation');
      return;
    }

    if (allowUserDetailsForm === 'true' && currentPath === '/CommonApplicationFormUserDetails') {
      console.log('useAuth - Allowing intentional navigation to UserDetailsForm');
      sessionStorage.removeItem('allowUserDetailsFormNavigation');
      return;
    }

    const isLoggedIn = authService.isAuthenticated();
    const user = authService.getCurrentUser();
    
    setAuthState(prev => ({
      ...prev,
      isAuthenticated: isLoggedIn,
      user: user,
    }));
    
    if (isLoggedIn && user) {
      const roleName = encryptionService.decrypt(user.roleName);
      const userProfileId = encryptionService.decrypt(user.userProfileId);
      const projectSiteId = encryptionService.decrypt(user.projectSiteId);
      
      console.log('Debug - roleName:', roleName);
      console.log('Debug - userProfileId:', userProfileId);
      console.log('Debug - projectSiteId:', projectSiteId);


      const dashboardRoute = NavigationService.checkUserProfileStatus(
        userProfileId, 
        projectSiteId, 
        roleName as any
      );
      
      if (dashboardRoute) {
        navigate(dashboardRoute);
      }
    }
  }, [navigate]);

  const login = async (credentials: { userName: string; password: string }) => {
    console.log('useAuth - login function called with:', { userName: credentials.userName });
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('useAuth - calling authService.login');
      const response = await authService.login(credentials);
      console.log('useAuth - authService.login response:', response);
      
      if (response.success && response.data) {
        console.log('useAuth - login successful, processing token');
        const { token } = response.data;
        console.log('useAuth - token received:', token);
        
        const userProfileId = encryptionService.decrypt(token.userProfileId);
        const roleName = encryptionService.decrypt(token.roleName);
        const projectSiteId = encryptionService.decrypt(token.projectSiteId);
        const isActive = encryptionService.decrypt(token.isActive);
        const isBlocked = encryptionService.decrypt(token.isBlocked);
        const isDeleted = encryptionService.decrypt(token.isDeleted);
        const isLoggedIn = encryptionService.decrypt(token.isLoggedIn);

        console.log('useAuth - Decrypted values:');
        console.log('  - userProfileId:', userProfileId);
        console.log('  - projectSiteId:', projectSiteId);
        console.log('  - roleName:', roleName);
        console.log('  - isActive:', isActive);
        console.log('  - isBlocked:', isBlocked);
        console.log('  - isDeleted:', isDeleted);
        console.log('  - isLoggedIn:', isLoggedIn);
        
        if (isActive === 'False') {
          console.log('useAuth - User is deactivated');
          ToastService.error('User is deactivated, please contact Admin');
          setAuthState(prev => ({ ...prev, loading: false, error: 'User deactivated' }));
          return false;
        }

        if (isBlocked === 'True') {
          console.log('useAuth - User is blocked');
          ToastService.error('User is locked, please contact Admin');
          setAuthState(prev => ({ ...prev, loading: false, error: 'User blocked' }));
          return false;
        }

        if (isDeleted === 'True') {
          console.log('useAuth - User is deleted');
          ToastService.error('User is deleted, please contact Admin');
          setAuthState(prev => ({ ...prev, loading: false, error: 'User deleted' }));
          return false;
        }

        if (isLoggedIn === 'True') {
          console.log('useAuth - User is already logged in');
          ToastService.error('User is already logged in');
          setAuthState(prev => ({ ...prev, loading: false, error: 'Already logged in' }));
          return false;
        }
        
        console.log('useAuth - All validations passed, storing token and navigating');
        localStorage.setItem('token', JSON.stringify(token));
        localStorage.setItem('loginTime', encryptionService.encrypt(new Date().toString()));
        setAuthState({
          isAuthenticated: true,
          user: token,
          loading: false,
          error: null,
        });
        
        // Check user profile status to determine navigation route
        const dashboardRoute = NavigationService.checkUserProfileStatus(
          userProfileId, 
          projectSiteId, 
          roleName as any
        );
        
        if (dashboardRoute) {
          console.log('useAuth - redirecting to:', dashboardRoute);
          navigate(dashboardRoute);
        } else {
          console.log('useAuth - redirecting to dashboard');
          navigate('/dashboard');
        }
        return true;
      } else {
        console.log('useAuth - login failed:', response.error);
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          error: response.error || 'Login failed' 
        }));
        ToastService.error(response.error || 'Login failed');
        return false;
      }
    } catch (error) {
      console.log('useAuth - login error caught:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      ToastService.error(errorMessage);
      return false;
    }
  };

  const logout = async () => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      await authService.logout();
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
      navigate('/login');
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  return {
    ...authState,
    login,
    logout,
  };
};
