import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Alert, Spinner } from 'react-bootstrap';
import { useUserRole } from '../hooks/useUserRole';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  fallbackPath?: string;
  showAccessDenied?: boolean;
}

/**
 * ProtectedRoute Component
 * 
 * Provides role-based access control for routes in the application.
 * Features:
 * - Role-based access control
 * - Permission-based access control
 * - Fallback navigation
 * - Loading states
 * - Access denied messages
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallbackPath = '/dashboard',
  showAccessDenied = true
}) => {
  const location = useLocation();
  const { 
    roleName, 
    loading, 
    isAdmin, 
    isOfficer, 
    userToken 
  } = useUserRole();

  const isAuthenticated = () => !!userToken;
  const isLoading = loading;
  const isApplicant = () => roleName === 'Applicant' as keyof UserRole;
  const hasPermission = (permission: string) => {
    // Basic permission check - can be enhanced based on your permission system
    if (isAdmin()) return true;
    if (isOfficer() && permission.includes('view')) return true;
    return false;
  };

  // Show loading spinner while authentication is being verified
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Verifying access...</span>
          </Spinner>
          <p className="mt-2 text-muted">Verifying access permissions...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => {
      switch (role.toLowerCase()) {
        case 'admin':
          return isAdmin();
        case 'officer':
          return isOfficer();
        case 'applicant':
          return isApplicant();
        default:
          return roleName?.toLowerCase() === role.toLowerCase();
      }
    });

    if (!hasRequiredRole) {
      if (showAccessDenied) {
        return <AccessDeniedComponent requiredRoles={requiredRoles} currentRole={roleName || undefined} />;
      }
      return <Navigate to={fallbackPath} replace />;
    }
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const hasRequiredPermission = requiredPermissions.some(permission => 
      hasPermission(permission)
    );

    if (!hasRequiredPermission) {
      if (showAccessDenied) {
        return <AccessDeniedComponent requiredPermissions={requiredPermissions} currentRole={roleName || undefined} />;
      }
      return <Navigate to={fallbackPath} replace />;
    }
  }

  // Render the protected component if all checks pass
  return <>{children}</>;
};

/**
 * Access Denied Component
 * 
 * Displays a user-friendly access denied message with relevant information.
 */
interface AccessDeniedProps {
  requiredRoles?: string[];
  requiredPermissions?: string[];
  currentRole?: string;
}

const AccessDeniedComponent: React.FC<AccessDeniedProps> = ({
  requiredRoles = [],
  requiredPermissions = [],
  currentRole
}) => {
  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="text-center py-5">
            {/* Access Denied Icon */}
            <div className="mb-4">
              <i 
                className="bx bx-block text-danger" 
                style={{ fontSize: '4rem' }}
              ></i>
            </div>

            {/* Access Denied Alert */}
            <Alert variant="danger" className="text-start">
              <Alert.Heading className="d-flex align-items-center">
                <i className="bx bx-error-circle me-2"></i>
                Access Denied
              </Alert.Heading>
              
              <p className="mb-0">
                You don't have the necessary permissions to access this page.
              </p>

              {currentRole && (
                <>
                  <hr />
                  <div className="small">
                    <strong>Current Role:</strong> {currentRole}
                  </div>
                </>
              )}

              {requiredRoles.length > 0 && (
                <div className="small mt-2">
                  <strong>Required Roles:</strong> {requiredRoles.join(', ')}
                </div>
              )}

              {requiredPermissions.length > 0 && (
                <div className="small mt-2">
                  <strong>Required Permissions:</strong> {requiredPermissions.join(', ')}
                </div>
              )}
            </Alert>

            {/* Action Buttons */}
            <div className="mt-4">
              <button 
                className="btn btn-primary me-2"
                onClick={() => window.history.back()}
              >
                <i className="bx bx-arrow-back me-1"></i>
                Go Back
              </button>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => window.location.href = '/dashboard'}
              >
                <i className="bx bx-home me-1"></i>
                Dashboard
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-4">
              <small className="text-muted">
                If you believe this is an error, please contact your administrator.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Role-specific route guard hooks
 * 
 * Convenience hooks for common role-based routing scenarios.
 */

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={['admin']}>
    {children}
  </ProtectedRoute>
);

export const OfficerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={['officer']}>
    {children}
  </ProtectedRoute>
);

export const AdminOrOfficerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={['admin', 'officer']}>
    {children}
  </ProtectedRoute>
);

export const ApplicantRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={['applicant']}>
    {children}
  </ProtectedRoute>
);

/**
 * Permission-based route guards
 * 
 * Route guards based on specific permissions rather than roles.
 */

export const PermissionRoute: React.FC<{ 
  children: React.ReactNode; 
  permissions: string[] 
}> = ({ children, permissions }) => (
  <ProtectedRoute requiredPermissions={permissions}>
    {children}
  </ProtectedRoute>
);

// Common permission-based routes
export const PaymentManagementRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredPermissions={['payment.manage', 'payment.view']}>
    {children}
  </ProtectedRoute>
);

export const UserManagementRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredPermissions={['user.manage', 'user.view']}>
    {children}
  </ProtectedRoute>
);

export const ReportAccessRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredPermissions={['reports.view', 'reports.generate']}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;