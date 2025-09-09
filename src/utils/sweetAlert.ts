import Swal from 'sweetalert2';
import type { SweetAlertOptions } from 'sweetalert2';

/**
 * SweetAlert Service for Angular-equivalent enterprise modals
 * Provides consistent modal experience matching Angular SweetAlert implementation
 */
export class SweetAlertService {
  
  /**
   * Show success modal (Angular equivalent)
   * @param message - Success message to display
   * @param title - Optional title (default: "Success!")
   */
  static success(message: string, title: string = "Success!"): Promise<any> {
    return Swal.fire({
      icon: 'success',
      title: title,
      text: message,
      confirmButtonColor: '#28a745',
      timer: 3000,
      timerProgressBar: true,
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });
  }

  /**
   * Show error modal (Angular equivalent)
   * @param message - Error message to display
   * @param title - Optional title (default: "Error")
   */
  static error(message: string, title: string = "Error"): Promise<any> {
    return Swal.fire({
      icon: 'error',
      title: title,
      text: message,
      confirmButtonColor: '#dc3545',
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });
  }

  /**
   * Show warning modal (Angular equivalent)
   * @param message - Warning message to display
   * @param title - Optional title (default: "Warning")
   */
  static warning(message: string, title: string = "Warning"): Promise<any> {
    return Swal.fire({
      icon: 'warning',
      title: title,
      text: message,
      confirmButtonColor: '#ffc107',
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });
  }

  /**
   * Show confirmation modal (Angular equivalent)
   * @param message - Confirmation message
   * @param title - Optional title (default: "Are you sure?")
   * @param confirmText - Confirm button text (default: "Yes, proceed!")
   * @param cancelText - Cancel button text (default: "Cancel")
   */
  static confirm(
    message: string, 
    title: string = "Are you sure?",
    confirmText: string = "Yes, proceed!",
    cancelText: string = "Cancel"
  ): Promise<any> {
    return Swal.fire({
      icon: 'question',
      title: title,
      text: message,
      showCancelButton: true,
      confirmButtonColor: '#007bff',
      cancelButtonColor: '#6c757d',
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });
  }

  /**
   * Show delete confirmation modal (Angular equivalent)
   * @param itemName - Name of item to delete
   * @param message - Optional custom message
   */
  static confirmDelete(itemName: string, message?: string): Promise<any> {
    const defaultMessage = `Are you sure you want to delete "${itemName}"? This action cannot be undone.`;
    
    return Swal.fire({
      icon: 'warning',
      title: 'Delete Confirmation',
      text: message || defaultMessage,
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });
  }

  /**
   * Show info modal (Angular equivalent)
   * @param message - Information message
   * @param title - Optional title (default: "Information")
   */
  static info(message: string, title: string = "Information"): Promise<any> {
    return Swal.fire({
      icon: 'info',
      title: title,
      text: message,
      confirmButtonColor: '#17a2b8',
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });
  }

  /**
   * Show custom modal with full options
   * @param options - SweetAlert2 configuration options
   */
  static custom(options: SweetAlertOptions): Promise<any> {
    return Swal.fire(options);
  }

  /**
   * Show loading modal (for async operations)
   * @param message - Loading message
   */
  static loading(message: string = "Processing..."): void {
    Swal.fire({
      title: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  /**
   * Close any open modal
   */
  static close(): void {
    Swal.close();
  }
}
