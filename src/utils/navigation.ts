
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
    
    // Only redirect to registration form if userProfileId is "0"
    if (userProfileId === "0") {
      const route = '/CommonApplicationFormUserDetails';
      console.log('NavigationService - userProfileId is "0", returning registration route:', route);
      return route;
    }

    if (userProfileId !== "0" && projectSiteId === "0") {
      const route = '/CommonApplicationFormEstablished';
      console.log('NavigationService - userProfileId filled but projectSiteId is "0", returning established form route:', route);
      return route;
    }
    
    // For all other cases, return null to allow normal navigation
    console.log('NavigationService - userProfileId is not "0", allowing normal navigation');
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
