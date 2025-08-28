/**
 * DateTime utilities for PostgreSQL compatibility
 * Handles DateTime formatting to ensure UTC timezone compliance
 */

export class DateTimeUtils {
  /**
   * Converts a date to UTC ISO string format for PostgreSQL
   * @param date - Date to convert (can be Date object, string, or null/undefined)
   * @returns UTC ISO string or null
   */
  static toUtcIsoString(date: Date | string | null | undefined): string | null {
    if (!date) return null;
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        console.warn('⚠️ [DateTimeUtils] Invalid date provided:', date);
        return null;
      }
      
      // Convert to UTC ISO string
      const utcIsoString = dateObj.toISOString();
      console.log('📅 [DateTimeUtils] Converted date:', {
        input: date,
        output: utcIsoString,
        timezone: 'UTC'
      });
      
      return utcIsoString;
    } catch (error) {
      console.error('❌ [DateTimeUtils] Error converting date:', error);
      return null;
    }
  }

  /**
   * Gets current UTC timestamp as ISO string
   * @returns Current UTC timestamp
   */
  static getCurrentUtcIsoString(): string {
    const now = new Date().toISOString();
    console.log('📅 [DateTimeUtils] Current UTC timestamp:', now);
    return now;
  }

  /**
   * Formats form data with proper DateTime handling for PostgreSQL
   * @param formData - Raw form data object
   * @returns FormData with properly formatted DateTime fields
   */
  static formatFormDataForPostgreSQL(formData: any): any {
    const formatted = { ...formData };
    
    // List of potential date fields that need UTC conversion
    const dateFields = [
      'dob', 'dateOfBirth', 'createdDate', 'modifiedDate', 
      'createdOnDate', 'lastModifiedOnDate', 'birthDate'
    ];
    
    dateFields.forEach(field => {
      if (formatted[field]) {
        formatted[field] = this.toUtcIsoString(formatted[field]);
      }
    });
    
    // Add system timestamps in UTC
    formatted.createdOnDate = formatted.createdOnDate || this.getCurrentUtcIsoString();
    formatted.lastModifiedOnDate = this.getCurrentUtcIsoString();
    
    console.log('📅 [DateTimeUtils] Form data formatted for PostgreSQL:', {
      originalFields: Object.keys(formData),
      formattedFields: Object.keys(formatted),
      dateFieldsProcessed: dateFields.filter(field => formatted[field])
    });
    
    return formatted;
  }

  /**
   * Validates if a date string is in proper UTC ISO format
   * @param dateString - Date string to validate
   * @returns boolean indicating if format is valid
   */
  static isValidUtcIsoString(dateString: string): boolean {
    if (!dateString) return false;
    
    // Check if it ends with 'Z' (UTC indicator) and is valid ISO format
    const utcPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
    const isValidFormat = utcPattern.test(dateString);
    
    if (!isValidFormat) {
      console.warn('⚠️ [DateTimeUtils] Invalid UTC ISO format:', dateString);
      return false;
    }
    
    // Verify the date is actually valid
    const date = new Date(dateString);
    const isValidDate = !isNaN(date.getTime());
    
    console.log('📅 [DateTimeUtils] Date validation:', {
      input: dateString,
      validFormat: isValidFormat,
      validDate: isValidDate
    });
    
    return isValidDate;
  }

  /**
   * Converts local date to UTC for form input
   * @param localDate - Local date string (YYYY-MM-DD format)
   * @returns UTC ISO string
   */
  static convertLocalDateToUtc(localDate: string): string | null {
    if (!localDate) return null;
    
    try {
      // Create date at midnight local time, then convert to UTC
      const date = new Date(localDate + 'T00:00:00');
      return this.toUtcIsoString(date);
    } catch (error) {
      console.error('❌ [DateTimeUtils] Error converting local date to UTC:', error);
      return null;
    }
  }
}

export default DateTimeUtils;
