
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export class FormValidators {
  
  static required(value: string): ValidationResult {
    if (!value || value.trim().length === 0) {
      return {
        isValid: false,
        error: 'This field is required',
      };
    }
    return { isValid: true };
  }

static minLength(value: string, min: number): ValidationResult {
    if (value.length < min) {
      return {
        isValid: false,
        error: `Minimum length is ${min} characters`,
      };
    }
    return { isValid: true };
  }

static maxLength(value: string, max: number): ValidationResult {
    if (value.length > max) {
      return {
        isValid: false,
        error: `Maximum length is ${max} characters`,
      };
    }
    return { isValid: true };
  }

static email(value: string): ValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return {
        isValid: false,
        error: 'Please enter a valid email address',
      };
    }
    return { isValid: true };
  }

  // Supervisor/Wireman specific validators
  static pan(value: string): ValidationResult {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(value.toUpperCase())) {
      return {
        isValid: false,
        error: 'Please enter a valid PAN number (e.g., ABCDE1234F)',
      };
    }
    return { isValid: true };
  }

  static supervisorName(value: string): ValidationResult {
    const nameRegex = /^[a-zA-Z\s]*$/;
    if (!nameRegex.test(value)) {
      return {
        isValid: false,
        error: 'Name should contain only alphabets and spaces',
      };
    }
    return { isValid: true };
  }

  static licenceNumber(value: string): ValidationResult {
    const licenceRegex = /^[a-zA-Z0-9\s\-\/]*$/;
    if (!licenceRegex.test(value)) {
      return {
        isValid: false,
        error: 'Licence number contains invalid characters',
      };
    }
    return { isValid: true };
  }

  static futureDate(value: string): ValidationResult {
    if (!value) {
      return {
        isValid: false,
        error: 'This field is required',
      };
    }
    
    const validDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (validDate <= today) {
      return {
        isValid: false,
        error: 'Date should be in the future',
      };
    }
    return { isValid: true };
  }

  static dropdownSelection(value: string): ValidationResult {
    if (!value || value === '') {
      return {
        isValid: false,
        error: 'Please make a selection',
      };
    }
    return { isValid: true };
  }

static noSpaces(value: string): ValidationResult {
    const hasSpace = /\s/.test(value);
    if (hasSpace) {
      return {
        isValid: false,
        error: 'Spaces are not allowed',
      };
    }
    return { isValid: true };
  }

static username(value: string): ValidationResult {
    const requiredCheck = this.required(value);
    if (!requiredCheck.isValid) return requiredCheck;

    const minLengthCheck = this.minLength(value, 3);
    if (!minLengthCheck.isValid) return minLengthCheck;

    return { isValid: true };
  }

static password(value: string): ValidationResult {
    const requiredCheck = this.required(value);
    if (!requiredCheck.isValid) return requiredCheck;

    const minLengthCheck = this.minLength(value, 6);
    if (!minLengthCheck.isValid) return minLengthCheck;

    return { isValid: true };
  }

static captcha(value: string): ValidationResult {
    const requiredCheck = this.required(value);
    if (!requiredCheck.isValid) return requiredCheck;

    const lengthCheck = this.minLength(value, 4);
    if (!lengthCheck.isValid) return lengthCheck;

    const maxLengthCheck = this.maxLength(value, 4);
    if (!maxLengthCheck.isValid) return maxLengthCheck;

    return { isValid: true };
  }
}
