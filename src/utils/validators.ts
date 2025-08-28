
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
