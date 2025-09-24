import { useState, useEffect } from 'react';
import { encryptionService } from '../lib';
import type { RoleName, UserToken } from '../types';

/**
 * Hook to get current user role from stored token
 * Provides role-based information for dashboard and navigation
 */
export const useUserRole = () => {
  const [roleName, setRoleName] = useState<RoleName | null>(null);
  const [userToken, setUserToken] = useState<UserToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const tokenStr = localStorage.getItem('token');
      
      if (!tokenStr) {
        setLoading(false);
        return;
      }

      const token = JSON.parse(tokenStr) as UserToken;
      
      if (token && token.roleName) {
        const decryptedRoleName = encryptionService.get(token.roleName) as RoleName;
        
        console.log('🔐 [useUserRole] Role detected:', {
          encrypted: token.roleName,
          decrypted: decryptedRoleName
        });
        
        setUserToken(token);
        setRoleName(decryptedRoleName);
      } else {
        setError('Invalid token structure');
      }
    } catch (err) {
      console.error('🔐 [useUserRole] Error parsing token:', err);
      setError('Failed to parse user token');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user ID
  const getUserId = (): string | null => {
    console.log('🔍 [useUserRole] getUserId called, userToken:', userToken);
    console.log('🔍 [useUserRole] userToken.userId:', userToken?.userId);
    console.log('🔍 [useUserRole] userToken.userProfileId:', userToken?.userProfileId);
    
    if (!userToken?.userId) {
      console.log('❌ [useUserRole] No userId found, trying userProfileId as fallback');
      if (!userToken?.userProfileId) {
        console.log('❌ [useUserRole] No userProfileId either, returning null');
        return null;
      }
      try {
        const userProfileId = encryptionService.get(userToken.userProfileId);
        console.log('🔍 [useUserRole] Using userProfileId as fallback:', userProfileId);
        return userProfileId;
      } catch (error) {
        console.log('❌ [useUserRole] Error decrypting userProfileId:', error);
        return null;
      }
    }
    
    try {
      const userId = encryptionService.get(userToken.userId);
      console.log('✅ [useUserRole] Decrypted userId:', userId);
      return userId;
    } catch (error) {
      console.log('❌ [useUserRole] Error decrypting userId:', error);
      return null;
    }
  };

  // Get project site ID
  const getProjectSiteId = (): string | null => {
    if (!userToken?.projectSiteId) return null;
    try {
      return encryptionService.get(userToken.projectSiteId);
    } catch {
      return null;
    }
  };

  // Check if user has specific role
  const hasRole = (role: RoleName): boolean => {
    return roleName === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles: RoleName[]): boolean => {
    return roleName ? roles.includes(roleName) : false;
  };

  // Check if user is contractor
  const isContractor = (): boolean => {
    return roleName === 'CONS';
  };

  // Check if user is officer (XEN, SUPP, SDO, CEI, SUPT, NDOF, ADMN)
  const isOfficer = (): boolean => {
    const officerRoles: RoleName[] = ['XEN', 'SUPP', 'SDO', 'CEI', 'SUPT', 'NDOF', 'ADMN', 'CLRK'];
    return hasAnyRole(officerRoles);
  };

  // Check if user is admin
  const isAdmin = (): boolean => {
    return roleName === 'ADMN';
  };

  // Check if user can access agenda (CEI, SUPT)
  const canAccessAgenda = (): boolean => {
    return hasAnyRole(['CEI', 'SUPT']);
  };

  // Enhanced authentication and permission methods
  const isAuthenticated = (): boolean => {
    return !!userToken && userToken.isActive === 'true' && userToken.isLoggedIn === 'true';
  };

  const isApplicant = (): boolean => {
    return isContractor(); // Use existing contractor check for applicant
  };

  const hasPermission = (permission: string): boolean => {
    // Basic permission system - can be enhanced based on backend permissions
    if (!isAuthenticated()) return false;
    
    // Admin has all permissions
    if (isAdmin()) return true;
    
    // Role-based permissions
    switch (permission.toLowerCase()) {
      case 'user.manage':
      case 'user.create':
      case 'user.delete':
        return isAdmin();
      
      case 'user.view':
      case 'application.view':
      case 'payment.view':
        return isAdmin() || isOfficer();
      
      case 'payment.process':
      case 'application.create':
        return isApplicant() || isAdmin() || isOfficer();
      
      case 'payment.manage':
      case 'payment.verify':
      case 'payment.refund':
        return isAdmin() || isOfficer();
      
      case 'reports.view':
      case 'reports.generate':
        return isAdmin() || isOfficer();
      
      case 'license.manage':
      case 'license.renew':
        return isAdmin() || isOfficer();
      
      default:
        return false;
    }
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  // Navigation helpers
  const getDefaultRoute = (): string => {
    if (isAdmin()) return '/dashboard/admin-dashboard';
    if (isOfficer()) return '/dashboard/officer-dashboard';
    if (isApplicant()) return '/dashboard';
    return '/dashboard';
  };

  const canAccessRoute = (route: string): boolean => {
    // Route-based access control
    if (route.includes('/admin')) return isAdmin();
    if (route.includes('/officer')) return isOfficer();
    if (route.includes('/license')) return isAdmin() || isOfficer();
    if (route.includes('/payments') && !route.includes('/process')) return isAdmin() || isOfficer();
    if (route.includes('/payments/process')) return isApplicant();
    
    return isAuthenticated(); // Default: require authentication
  };

  // Check if user can access dashboard based on role
  const canAccessDashboard = (): boolean => {
    return isAuthenticated() && (isAdmin() || isOfficer() || isApplicant());
  };

  return {
    roleName,
    userToken,
    loading,
    error,
    
    // Helper methods
    getUserId,
    getProjectSiteId,
    hasRole,
    hasAnyRole,
    isContractor,
    isOfficer,
    isAdmin,
    isApplicant,
    isAuthenticated,
    hasPermission,
    hasAnyPermission,
    canAccessDashboard,
    canAccessAgenda,
    canAccessRoute,
    getDefaultRoute
  };
};

export default useUserRole;