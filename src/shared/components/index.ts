/**
 * Shared Components Export Index
 * Phase 2 - Modular Architecture
 * 
 * This file exports all shared components that can be used across
 * contractor, supervisor, and wireman modules.
 */

// Layout Components
export { default as CardContainer } from '../../components/CardContainer/CardContainer';
export { default as Footer } from '../../components/Footer/Footer';
export { default as Logo } from '../../components/Logo/Logo';

// Page Components
export { default as PageHeader } from '../../components/PageComponent/PageHeader';
export { default as Header1 } from '../../components/PageComponent/Header1';
export { default as Header2 } from '../../components/PageComponent/Header2';
export { default as Sidebar } from '../../components/PageComponent/Sidebar';

// Form Components  
export { default as InputField } from '../../components/InputField/InputField';
export { default as Button } from '../../components/Button/Button';
export { default as FileUpload } from '../../components/FileUpload';

// Shared Components (Phase 1 enhanced components) - These are the key ones for Phase 2
export * from '../../components/shared-component';

// Application Monitoring
// export { ApplicationActionMonitor } from '../../components/ApplicationActionMonitor'; // TODO: Fix export

/**
 * Key Phase 2 Components (from shared-component):
 * - DataTable: Consistent data display across modules
 * - EnhancedFileUpload: Standardized file upload with validation
 * - FormField: Unified form field component
 * - LoadingButton: Consistent loading states
 * - CaptchaField: Shared captcha functionality
 * - DetailsTable: Structured data display
 */