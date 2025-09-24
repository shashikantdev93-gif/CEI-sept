
import type{ RoleName } from '../types';
import toast from 'react-hot-toast';

export class NavigationService {
  
  static getDashboardRoute(roleName: RoleName): string {
    let route: string;
    
    switch (roleName) {
      case 'CONS':
        route = '/dashboard';
        break;
      case 'XEN':
      case 'SUPP':
      case 'SDO':
      case 'CEI':
      case 'SUPT':
      case 'NDOF':
      case 'CLRK':
        route = '/dashboard/officer-dashboard';
        break;
      case 'ADMN':
        route = '/dashboard/admin-dashboard';
        break;
      case 'LICS':
        route = '/dashboard/license-dashboard';
        break;
      default:
        route = '/dashboard';
        break;
    }
    
    return route;
  }

static checkUserProfileStatus(userProfileId: string, projectSiteId: string, roleName: RoleName): string | null {
    console.log('NavigationService.checkUserProfileStatus called with:');
    console.log('  - userProfileId:', userProfileId, 'type:', typeof userProfileId);
    console.log('  - projectSiteId:', projectSiteId, 'type:', typeof projectSiteId);
    console.log('  - roleName:', roleName);
    
    // Step 1: User Profile Validation (Angular parity - exact route match)
    if (userProfileId === "0") {
      const route = '/dashboard/caf/userDetails';
      console.log('NavigationService - Step 1: userProfileId is "0", returning user registration route:', route);
      return route;
    }

    // Step 2: Project Site Validation - CONTRACTORS ONLY (Angular parity - exact route match)
    if (userProfileId !== "0" && projectSiteId === "0" && roleName === 'CONS') {
      const route = '/dashboard/caf/projectSite';
      console.log('NavigationService - Step 2: Contractor with projectSiteId "0", returning established form route:', route);
      return route;
    }
    
    // Step 3: All validation passed, proceed to role-based navigation
    console.log('NavigationService - Steps 1&2 passed, proceeding to role-based navigation for role:', roleName);
    return null;
  }
}
export class ToastService {
  static success(message: string): void {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
    });
  }

  static error(message: string): void {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
    });
  }

  static warning(message: string): void {
    toast(message, {
      icon: '⚠️',
      duration: 3000,
      position: 'top-right',
    });
  }

  static info(message: string): void {
    toast(message, {
      icon: 'ℹ️',
      duration: 3000,
      position: 'top-right',
    });
  }
}
