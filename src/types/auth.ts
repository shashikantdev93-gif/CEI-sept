// Authentication related TypeScript types
// Based on Angular backend integration analysis

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  token: UserToken;
  message?: string;
  success: boolean;
}

export interface UserToken {
  userProfileId: string;
  roleName: string;
  projectSiteId: string;
  isActive: string;
  isBlocked: string;
  isDeleted: string;
  isLoggedIn: string;
  isPasswordUpdated: string;
  // Add other token properties as needed
  [key: string]: any;
}

export interface CaptchaResponse {
  result: {
    returnCode: number;
    data: string;
  };
}

export interface CaptchaData {
  Id: number;
  Img: string;
  captchaCode: string;
}

export interface UserRole {
  CONS: 'CONS';     // Contractor
  XEN: 'XEN';       // Executive Engineer
  SDO: 'SDO';       // Sub-Divisional Officer
  SUPP: 'SUPP';     // Supervisor
  CEI: 'CEI';       // Chief Electrical Inspector
  SUPT: 'SUPT';     // Superintendent
  NDOF: 'NDOF';     // Nodal Officer
  CLRK: 'CLRK';     // Clerk
  ADMN: 'ADMN';     // Administrator
  LICS: 'LICS';     // License Officer
}

export type RoleName = keyof UserRole;

export interface FormData {
  userName: string;
  password: string;
  captchaCode: string;
}

export interface FormErrors {
  userName?: string;
  password?: string;
  captchaCode?: string;
  general?: string;
}


export interface SignupFormData {
  username: string;
  password: string;
  confirmPassword: string;
  captchaCode: string;
}

export interface SignupFormErrors {
  username?: string;
  password?: string;
  confirmPassword?: string;
  captchaCode?: string;
  general?: string;
}


export interface AuthState {
  isAuthenticated: boolean;
  user: UserToken | null;
  loading: boolean;
  error: string | null;
}

export interface SignupRequest {
  userName: string;
  password: string;
  confirmPassword: string;
  // Add any other fields your backend expects
}

export interface SignupResponse {
  success: boolean;
  message: string;
  userId?: string;
  // Add any other fields your backend returns
}