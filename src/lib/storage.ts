/**
 * Centralized storage service to replace direct localStorage/sessionStorage calls
 * Provides Angular-like storage service with error handling and type safety
 */

// Storage keys used across the application
export const STORAGE_KEYS = {
  // Application Draft Data
  APPLICATION_ID: 'ApplicationId',
  INSPECTION_TYPE: 'InspectionType',
  
  // Draft Navigation Data
  DRAFT_APPLICATION_DATA: 'draftApplicationData',
  ALLOW_DRAFT_NAVIGATION: 'allowDraftNavigation',
  
  // User Session Data
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_INFO: 'userInfo',
  
  // Form Data
  FORM_DATA: 'formData',
  FORM_MODE: 'formMode',
  
  // Application State
  APPLICATION_STATUS: 'applicationStatus',
  CONTRACTOR_TYPE: 'contractorType',
  
  // Other common keys
  REMEMBER_ME: 'rememberMe',
} as const;

export type StorageKey = keyof typeof STORAGE_KEYS;

// Error types for storage operations
export class StorageError extends Error {
  public key?: string;
  public operation?: string;
  
  constructor(message: string, key?: string, operation?: string) {
    super(message);
    this.name = 'StorageError';
    this.key = key;
    this.operation = operation;
  }
}

// Storage configuration
interface StorageConfig {
  enableLogging: boolean;
  enableErrorReporting: boolean;
  keyPrefix?: string;
}

export class AppStorageService {
  private config: StorageConfig;

  constructor(config: Partial<StorageConfig> = {}) {
    this.config = {
      enableLogging: true,
      enableErrorReporting: true,
      keyPrefix: '',
      ...config,
    };
  }

  private log(operation: string, key: string, value?: any, error?: any): void {
    if (!this.config.enableLogging) return;

    const logData = {
      operation,
      key,
      hasValue: value !== undefined,
      timestamp: new Date().toISOString(),
      error,
    };

    if (error) {
      console.error(`🏪 [STORAGE-${operation.toUpperCase()}] Error:`, logData);
    } else {
      console.log(`🏪 [STORAGE-${operation.toUpperCase()}]:`, logData);
    }
  }

  private getKey(key: string): string {
    return this.config.keyPrefix ? `${this.config.keyPrefix}_${key}` : key;
  }

  // localStorage operations
  setLocalItem<T = any>(key: string, value: T): boolean {
    try {
      const finalKey = this.getKey(key);
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      localStorage.setItem(finalKey, serializedValue);
      this.log('SET_LOCAL', finalKey, value);
      return true;
    } catch (error) {
      this.log('SET_LOCAL', key, value, error);
      if (this.config.enableErrorReporting) {
        throw new StorageError(`Failed to set localStorage item: ${key}`, key, 'setItem');
      }
      return false;
    }
  }

  getLocalItem<T = string>(key: string): T | null {
    try {
      const finalKey = this.getKey(key);
      const value = localStorage.getItem(finalKey);
      
      if (value === null) {
        this.log('GET_LOCAL', finalKey, null);
        return null;
      }

      // Try to parse as JSON, fallback to string
      try {
        const parsedValue = JSON.parse(value);
        this.log('GET_LOCAL', finalKey, parsedValue);
        return parsedValue as T;
      } catch {
        // Not JSON, return as string
        this.log('GET_LOCAL', finalKey, value);
        return value as T;
      }
    } catch (error) {
      this.log('GET_LOCAL', key, null, error);
      if (this.config.enableErrorReporting) {
        throw new StorageError(`Failed to get localStorage item: ${key}`, key, 'getItem');
      }
      return null;
    }
  }

  removeLocalItem(key: string): boolean {
    try {
      const finalKey = this.getKey(key);
      localStorage.removeItem(finalKey);
      this.log('REMOVE_LOCAL', finalKey);
      return true;
    } catch (error) {
      this.log('REMOVE_LOCAL', key, null, error);
      if (this.config.enableErrorReporting) {
        throw new StorageError(`Failed to remove localStorage item: ${key}`, key, 'removeItem');
      }
      return false;
    }
  }

  // sessionStorage operations
  setSessionItem<T = any>(key: string, value: T): boolean {
    try {
      const finalKey = this.getKey(key);
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      sessionStorage.setItem(finalKey, serializedValue);
      this.log('SET_SESSION', finalKey, value);
      return true;
    } catch (error) {
      this.log('SET_SESSION', key, value, error);
      if (this.config.enableErrorReporting) {
        throw new StorageError(`Failed to set sessionStorage item: ${key}`, key, 'setItem');
      }
      return false;
    }
  }

  getSessionItem<T = string>(key: string): T | null {
    try {
      const finalKey = this.getKey(key);
      const value = sessionStorage.getItem(finalKey);
      
      if (value === null) {
        this.log('GET_SESSION', finalKey, null);
        return null;
      }

      // Try to parse as JSON, fallback to string
      try {
        const parsedValue = JSON.parse(value);
        this.log('GET_SESSION', finalKey, parsedValue);
        return parsedValue as T;
      } catch {
        // Not JSON, return as string
        this.log('GET_SESSION', finalKey, value);
        return value as T;
      }
    } catch (error) {
      this.log('GET_SESSION', key, null, error);
      if (this.config.enableErrorReporting) {
        throw new StorageError(`Failed to get sessionStorage item: ${key}`, key, 'getItem');
      }
      return null;
    }
  }

  removeSessionItem(key: string): boolean {
    try {
      const finalKey = this.getKey(key);
      sessionStorage.removeItem(finalKey);
      this.log('REMOVE_SESSION', finalKey);
      return true;
    } catch (error) {
      this.log('REMOVE_SESSION', key, null, error);
      if (this.config.enableErrorReporting) {
        throw new StorageError(`Failed to remove sessionStorage item: ${key}`, key, 'removeItem');
      }
      return false;
    }
  }

  // Application-specific convenience methods
  setApplicationId(applicationId: number | string): boolean {
    return this.setLocalItem(STORAGE_KEYS.APPLICATION_ID, String(applicationId));
  }

  getApplicationId(): string | null {
    return this.getLocalItem<string>(STORAGE_KEYS.APPLICATION_ID);
  }

  setInspectionType(inspectionType: string): boolean {
    return this.setLocalItem(STORAGE_KEYS.INSPECTION_TYPE, inspectionType);
  }

  getInspectionType(): string | null {
    return this.getLocalItem<string>(STORAGE_KEYS.INSPECTION_TYPE);
  }

  setDraftData(draftData: any): boolean {
    return this.setSessionItem(STORAGE_KEYS.DRAFT_APPLICATION_DATA, draftData);
  }

  getDraftData<T = any>(): T | null {
    return this.getSessionItem<T>(STORAGE_KEYS.DRAFT_APPLICATION_DATA);
  }

  enableDraftNavigation(): boolean {
    return this.setSessionItem(STORAGE_KEYS.ALLOW_DRAFT_NAVIGATION, 'true');
  }

  disableDraftNavigation(): boolean {
    return this.setSessionItem(STORAGE_KEYS.ALLOW_DRAFT_NAVIGATION, 'false');
  }

  isDraftNavigationEnabled(): boolean {
    return this.getSessionItem<string>(STORAGE_KEYS.ALLOW_DRAFT_NAVIGATION) === 'true';
  }

  // Clear all application data
  clearApplicationData(): void {
    const applicationKeys = [
      STORAGE_KEYS.APPLICATION_ID,
      STORAGE_KEYS.INSPECTION_TYPE,
      STORAGE_KEYS.DRAFT_APPLICATION_DATA,
      STORAGE_KEYS.ALLOW_DRAFT_NAVIGATION,
      STORAGE_KEYS.FORM_DATA,
      STORAGE_KEYS.FORM_MODE,
      STORAGE_KEYS.APPLICATION_STATUS,
      STORAGE_KEYS.CONTRACTOR_TYPE,
    ];

    applicationKeys.forEach(key => {
      this.removeLocalItem(key);
      this.removeSessionItem(key);
    });

    this.log('CLEAR_APP_DATA', 'all', null);
  }

  // Check if storage is available
  isStorageAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}

// Create singleton instance
export const appStorage = new AppStorageService({
  enableLogging: true,
  enableErrorReporting: false, // Set to true for development debugging
});

// Default export
export default appStorage;