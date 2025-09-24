
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
    // Get current state
    const allowProjectDetails = sessionStorage.getItem('allowProjectDetailsNavigation');
    const allowApplicationForm = sessionStorage.getItem('allowApplicationFormNavigation');
    const allowContractorDetails = sessionStorage.getItem('allowContractorDetailsNavigation');
    const allowEstablishedForm = sessionStorage.getItem('allowEstablishedFormNavigation');
    const allowUserDetailsForm = sessionStorage.getItem('allowUserDetailsFormNavigation');
    const currentPath = window.location.pathname;
    const navigationStabilized = sessionStorage.getItem('navigationStabilized');
    const loginNavigationComplete = sessionStorage.getItem('loginNavigationComplete');
    
    console.log('useAuth - useEffect triggered, currentPath:', currentPath);
    
    // 🎯 ANGULAR PARITY: Only run navigation logic in specific scenarios
    // 1. Initial app load (when navigation not stabilized)
    // 2. After login (when loginNavigationComplete flag exists)
    // Unlike Angular route guards, we only redirect during these scenarios
    
    const isInitialLoad = !navigationStabilized;
    const isPostLogin = loginNavigationComplete === 'true';
    const shouldRunNavigation = isInitialLoad || isPostLogin;
    
    console.log('useAuth - Navigation analysis:', {
      isInitialLoad,
      isPostLogin, 
      shouldRunNavigation,
      navigationStabilized,
      currentPath
    });
    
    // 🎯 ANGULAR PARITY: Allow free navigation between routes after initial setup
    if (!shouldRunNavigation) {
      console.log('useAuth - Navigation stabilized, allowing free user navigation');
      return;
    }
    
    // Clean up post-login flag
    if (isPostLogin) {
      console.log('useAuth - Post-login navigation, cleaning up flag');
      sessionStorage.removeItem('loginNavigationComplete');
    }

    
    // 🎯 ANGULAR PARITY: Check if user is accessing a specific sub-page with proper permission
    if (currentPath.startsWith('/dashboard/')) {
      // Check if user has permission for the specific sub-page
      if (currentPath === '/dashboard/ProjectDetails' && allowProjectDetails) {
        console.log('useAuth - Allowing ProjectDetails access via intentional navigation');
        sessionStorage.removeItem('allowProjectDetailsNavigation');
        sessionStorage.setItem('navigationStabilized', 'true');
        return;
      }
      
      if (currentPath === '/dashboard/ApplicationForm' && allowApplicationForm) {
        console.log('useAuth - Allowing ApplicationForm access via intentional navigation');
        sessionStorage.removeItem('allowApplicationFormNavigation');
        sessionStorage.setItem('navigationStabilized', 'true');
        return;
      }
      
      if (currentPath === '/dashboard/ContractorDetails' && allowContractorDetails) {
        console.log('useAuth - Allowing ContractorDetails access via intentional navigation');
        sessionStorage.removeItem('allowContractorDetailsNavigation');
        sessionStorage.setItem('navigationStabilized', 'true');
        return;
      }

      if (currentPath === '/dashboard/EstablishedForm' && allowEstablishedForm) {
        console.log('useAuth - Allowing EstablishedForm access via intentional navigation');
        sessionStorage.removeItem('allowEstablishedFormNavigation');
        sessionStorage.setItem('navigationStabilized', 'true');
        return;
      }

      if (currentPath === '/dashboard/UserDetailsForm' && allowUserDetailsForm) {
        console.log('useAuth - Allowing UserDetailsForm access via intentional navigation');
        sessionStorage.removeItem('allowUserDetailsFormNavigation');
        sessionStorage.setItem('navigationStabilized', 'true');
        return;
      }
    }

    // Handle old route patterns for backward compatibility
    if (allowProjectDetails === 'true' && (currentPath === '/ProjectDetails' || currentPath === '/dashboard/ProjectDetails')) {
      console.log('useAuth - Allowing intentional navigation to ProjectDetails (legacy)');
      sessionStorage.removeItem('allowProjectDetailsNavigation');
      sessionStorage.setItem('navigationStabilized', 'true');
      return;
    }

    if (allowApplicationForm === 'true' && currentPath === '/ApplicationForm') {
      console.log('useAuth - Allowing intentional navigation to ApplicationForm (legacy)');
      sessionStorage.removeItem('allowApplicationFormNavigation');
      sessionStorage.setItem('navigationStabilized', 'true');
      return;
    }

    if (allowContractorDetails === 'true' && currentPath === '/contractor-applicant-details') {
      console.log('useAuth - Allowing intentional navigation to ContractorApplicantDetails (legacy)');
      sessionStorage.removeItem('allowContractorDetailsNavigation');
      sessionStorage.setItem('navigationStabilized', 'true');
      return;
    }

    if (allowEstablishedForm === 'true' && currentPath === '/CommonApplicationFormEstablished') {
      console.log('useAuth - Allowing intentional navigation to EstablishedForm (legacy)');
      sessionStorage.removeItem('allowEstablishedFormNavigation');
      sessionStorage.setItem('navigationStabilized', 'true');
      return;
    }

    if (allowUserDetailsForm === 'true' && currentPath === '/CommonApplicationFormUserDetails') {
      console.log('useAuth - Allowing intentional navigation to UserDetailsForm (legacy)');
      sessionStorage.removeItem('allowUserDetailsFormNavigation');
      sessionStorage.setItem('navigationStabilized', 'true');
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

      const profileRoute = NavigationService.checkUserProfileStatus(
        userProfileId, 
        projectSiteId, 
        roleName as any
      );
      
      if (profileRoute) {
        // User needs to complete profile/project information
        console.log('useAuth - Profile incomplete, navigating to:', profileRoute);
        navigate(profileRoute);
        sessionStorage.setItem('lastRoute', profileRoute);
        sessionStorage.setItem('navigationStabilized', 'true');
      } else {
        // Check if user is on a valid dashboard sub-route
        const validDashboardSubRoutes = [
          '/dashboard/ProjectDetails',
          '/dashboard/ApplicationForm', 
          '/dashboard/contractor-applicant-details',
          '/dashboard/CommonApplicationFormEstablished',
          '/dashboard/CommonApplicationFormUserDetails',
          '/dashboard/admin-dashboard'
        ];
        
        const isOnValidSubRoute = validDashboardSubRoutes.some(route => currentPath === route);
        
        if (isOnValidSubRoute) {
          console.log('useAuth - User on valid dashboard sub-route:', currentPath, 'allowing continued access');
          sessionStorage.setItem('navigationStabilized', 'true');
          return;
        }
        
        // No profile issues, navigate based on role (Angular parity)
        const roleBasedRoute = NavigationService.getDashboardRoute(roleName as any);
        
        // Only navigate if not already on the correct dashboard route
        if (currentPath !== roleBasedRoute) {
          console.log('useAuth - redirecting to role-based dashboard on initial load:', roleBasedRoute);
          navigate(roleBasedRoute, { replace: true });
          sessionStorage.setItem('navigationStabilized', 'true');
        } else {
          console.log('useAuth - User already on correct dashboard route:', roleBasedRoute);
          sessionStorage.setItem('navigationStabilized', 'true');
        }
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
        console.log('🔍 [useAuth] Raw token received from backend:', token);
        console.log('🔍 [useAuth] Token keys:', Object.keys(token));
        console.log('🔍 [useAuth] Token.userId:', token.userId);
        console.log('🔍 [useAuth] Token.userProfileId:', token.userProfileId);
        
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
        
        // Clear any previous navigation state to allow proper routing after login
        sessionStorage.removeItem('navigationStabilized');
        sessionStorage.removeItem('lastRoute');
        
        // Check user profile status to determine navigation route (Angular parity)
        const profileRoute = NavigationService.checkUserProfileStatus(
          userProfileId, 
          projectSiteId, 
          roleName as any
        );
        
        if (profileRoute) {
          // User needs to complete profile/project information
          console.log('useAuth - Login: redirecting to profile completion route:', profileRoute);
          navigate(profileRoute, { replace: true });
          sessionStorage.setItem('lastRoute', profileRoute);
          sessionStorage.setItem('navigationStabilized', 'true');
          sessionStorage.setItem('loginNavigationComplete', 'true');
        } else {
          // No profile issues, navigate based on role (Angular parity)
          const roleBasedRoute = NavigationService.getDashboardRoute(roleName as any);
          console.log('useAuth - Login: redirecting to role-based dashboard:', roleBasedRoute);
          navigate(roleBasedRoute, { replace: true });
          sessionStorage.setItem('lastRoute', roleBasedRoute);
          sessionStorage.setItem('navigationStabilized', 'true');
          sessionStorage.setItem('loginNavigationComplete', 'true');
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
      // Clear all navigation state on logout
      sessionStorage.removeItem('navigationStabilized');
      sessionStorage.removeItem('lastRoute');
      sessionStorage.removeItem('loginNavigationComplete');
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
