/**
 * License Renewal Validation Utilities
 * Matches Angular's allowRenewOnlyBefore60DaysOfNewExpiration logic exactly
 */

export interface RenewalValidationResult {
  canRenew: boolean;
  errorMessage?: string;
  daysRemaining?: number;
}

/**
 * Validates if license renewal is allowed based on 60-day rule
 * Matches Angular's allowRenewOnlyBefore60DaysOfNewExpiration function exactly
 */
export const validateRenewalEligibility = (
  licenceValidOnUpToDate: string | null | undefined,
  applicationArray: any[]
): RenewalValidationResult => {
  console.log('🔍 [RENEWAL-VALIDATION] Checking renewal eligibility:', {
    licenceValidOnUpToDate,
    applicationCount: applicationArray?.length
  });

  // Angular: if ( ( !licenceValidOnUpToDate && applicationArray?.length===1 ) || ( !licenceValidOnUpToDate && applicationArray?.length===0 ) )
  if ((!licenceValidOnUpToDate && applicationArray?.length === 1) || 
      (!licenceValidOnUpToDate && applicationArray?.length === 0)) {
    return {
      canRenew: false,
      errorMessage: 'You must complete a new application before applying for renewal.'
    };
  }

  // Angular: if (!licenceValidOnUpToDate && applicationArray?.length > 1)
  if (!licenceValidOnUpToDate && applicationArray?.length > 1) {
    return {
      canRenew: false,
      errorMessage: 'Oops ! It looks like your current renewal is still in progress, so you cannot proceed with another renewal.'
    };
  }

  if (!licenceValidOnUpToDate) {
    return {
      canRenew: false,
      errorMessage: 'License expiry date not available.'
    };
  }

  // Calculate days remaining until license expires
  const daysRemaining = Math.floor(
    (new Date(licenceValidOnUpToDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  console.log('📅 [RENEWAL-VALIDATION] Days remaining until expiry:', daysRemaining);

  // Angular: if (daysRemaining > 60 && applicationArray.length===1)
  if (daysRemaining > 60 && applicationArray.length === 1) {
    return {
      canRenew: false,
      errorMessage: 'Renewal is allowed only within 60 days prior to the expiration date.',
      daysRemaining
    };
  } 
  // Angular: else if(daysRemaining > 60 && applicationArray.length>1)
  else if (daysRemaining > 60 && applicationArray.length > 1) {
    return {
      canRenew: false,
      errorMessage: 'Oops! Application for the next renewal can only be submitted in the 60 days before your current renewal ends',
      daysRemaining
    };
  }

  // Renewal is allowed
  console.log('✅ [RENEWAL-VALIDATION] Renewal allowed');
  return {
    canRenew: true,
    daysRemaining
  };
};

/**
 * Get the latest application with license information for renewal validation
 */
export const getLatestApplicationForRenewal = (applications: any[]): any => {
  if (!applications || applications.length === 0) return null;
  
  // Get the latest application (last in array, matching Angular logic)
  return applications[applications.length - 1];
};

/**
 * Check if application has purpose type 2 (renewal)
 */
export const isRenewalApplication = (application: any): boolean => {
  return application?.applicationPurposeType === 2;
};