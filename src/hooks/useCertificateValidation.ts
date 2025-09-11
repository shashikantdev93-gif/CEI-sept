import { useState, useCallback, useRef } from 'react';
import { userDetailsService } from '../services/api/userDetailsService';

interface CertificateValidationResult {
  isValid: boolean;
  isExpired: boolean;
  fullName?: string;
  licenceValidUpto?: string;
  panNo?: string;
  message?: string;
}

export const useCertificateValidation = () => {
  const [isValidatingSupervisor, setIsValidatingSupervisor] = useState(false);
  const [isValidatingWireman, setIsValidatingWireman] = useState(false);
  
  // Debounce refs to prevent multiple API calls
  const supervisorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wiremanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to format names from API response
  const formatFullName = (userProfile: any): string => {
    const firstName = userProfile?.firstName || '';
    const middleName = userProfile?.middleName || '';
    const lastName = userProfile?.lastName || '';
    return `${firstName} ${middleName} ${lastName}`.trim().replace(/\s+/g, ' ');
  };

  // Helper function to check if certificate is expired
  const isCertificateExpired = (validUptoDate: string): boolean => {
    const licenceValidUpto = new Date(validUptoDate);
    const today = new Date();
    licenceValidUpto.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return licenceValidUpto < today;
  };

  // Helper function to format date for form
  const formatDateForForm = (dateString: string): string => {
    return new Date(dateString).toISOString().split('T')[0];
  };

  // Validate supervisor certificate number (matches Angular implementation)
  const validateSupervisorCertificate = useCallback(async (
    licenceNo: string,
    isOnlineMode: boolean,
    contractorFormMode: 'new' | 'renew' = 'new'
  ): Promise<CertificateValidationResult> => {
    if (!licenceNo.trim()) {
      return { isValid: false, isExpired: false, message: 'Certificate number is required' };
    }

    setIsValidatingSupervisor(true);

    try {
      if (contractorFormMode === 'new') {
        // NEW CASE: Check if certificate already exists in backlog
        console.log('🔍 [CERTIFICATE-VALIDATION] Checking supervisor backlog for new application');
        const backlogResponse = await userDetailsService.getSuperBacklogDetailsByLicenceNo(licenceNo);
        
        if (backlogResponse?.data?.formModel?.length > 0) {
          return {
            isValid: false,
            isExpired: false,
            message: 'Certificate number already exists'
          };
        }

        // If online mode, fetch details from supervisor licence API
        if (isOnlineMode) {
          console.log('🌐 [CERTIFICATE-VALIDATION] Fetching supervisor details for online mode');
          const detailsResponse = await userDetailsService.getSupervisorDetails_ByLicenceNo(licenceNo);
          
          if (detailsResponse?.data?.formModel && detailsResponse.data.formModel.length > 0) {
            const latestRecord = detailsResponse.data.formModel[detailsResponse.data.formModel.length - 1];
            const isExpired = isCertificateExpired(latestRecord.licenceValidOnUpToDate);
            
            if (isExpired) {
              return {
                isValid: false,
                isExpired: true,
                message: 'It looks like licence has expired or something went wrong. Please try again'
              };
            }

            return {
              isValid: true,
              isExpired: false,
              fullName: formatFullName(latestRecord.userProfile),
              licenceValidUpto: formatDateForForm(latestRecord.licenceValidOnUpToDate),
              panNo: latestRecord.application?.projectSites?.applicantPanNumber
            };
          } else {
            return {
              isValid: false,
              isExpired: false,
              message: 'There is no data associated with this Certificate Number'
            };
          }
        }
      } else {
        // RENEW CASE: Different logic for renewal
        console.log('🔄 [CERTIFICATE-VALIDATION] Checking supervisor for renewal');
        const backlogResponse = await userDetailsService.getSuperBacklogDetailsByLicenceNo(licenceNo);
        
        if (backlogResponse?.data?.formModel?.length > 0) {
          // Find the record with largest ID
          const largestIdObject = backlogResponse.data.formModel.reduce((max: any, item: any) => 
            (item.id > max.id ? item : max), backlogResponse.data.formModel[0]);
          
          // Check if it matches renewal app ID (this would need to be passed in)
          // For now, proceed with the validation logic
          const isExpired = isCertificateExpired(largestIdObject.licenceValidUpto);
          
          if (isExpired && isOnlineMode) {
            const detailsResponse = await userDetailsService.getSupervisorDetails_ByLicenceNo(licenceNo);
            
            if (detailsResponse?.data?.formModel && detailsResponse.data.formModel.length > 0) {
              const latestRecord = detailsResponse.data.formModel[detailsResponse.data.formModel.length - 1];
              const newIsExpired = isCertificateExpired(latestRecord.licenceValidOnUpToDate);
              
              if (newIsExpired) {
                return {
                  isValid: false,
                  isExpired: true,
                  message: 'It looks like licence has expired or something went wrong. Please try again'
                };
              }

              return {
                isValid: true,
                isExpired: false,
                fullName: formatFullName(latestRecord.userProfile),
                licenceValidUpto: formatDateForForm(latestRecord.licenceValidOnUpToDate),
                panNo: latestRecord.application?.projectSites?.applicantPanNumber
              };
            }
          }
        }
      }

      return { isValid: true, isExpired: false };
    } catch (error: any) {
      console.error('❌ [CERTIFICATE-VALIDATION] Supervisor validation error:', error);
      return {
        isValid: false,
        isExpired: false,
        message: 'Error validating certificate. Please try again.'
      };
    } finally {
      setIsValidatingSupervisor(false);
    }
  }, []);

  // Validate wireman permit number (matches Angular implementation)
  const validateWiremanCertificate = useCallback(async (
    licenceNo: string,
    isOnlineMode: boolean,
    contractorFormMode: 'new' | 'renew' = 'new'
  ): Promise<CertificateValidationResult> => {
    if (!licenceNo.trim()) {
      return { isValid: false, isExpired: false, message: 'Permit number is required' };
    }

    setIsValidatingWireman(true);

    try {
      if (contractorFormMode === 'new') {
        // NEW CASE: Check if permit already exists in backlog
        console.log('🔍 [CERTIFICATE-VALIDATION] Checking wireman backlog for new application');
        const backlogResponse = await userDetailsService.getWireBacklogDetailsByLicenceNo(licenceNo);
        
        if (backlogResponse?.data?.formModel?.length > 0) {
          return {
            isValid: false,
            isExpired: false,
            message: 'Permit number already exists'
          };
        }

        // If online mode, fetch details from wireman licence API
        if (isOnlineMode) {
          console.log('🌐 [CERTIFICATE-VALIDATION] Fetching wireman details for online mode');
          const detailsResponse = await userDetailsService.getWiremanDetails_ByLicenceNo(licenceNo);
          
          if (detailsResponse?.data?.formModel && detailsResponse.data.formModel.length > 0) {
            const latestRecord = detailsResponse.data.formModel[detailsResponse.data.formModel.length - 1];
            const isExpired = isCertificateExpired(latestRecord.licenceValidOnUpToDate);
            
            if (isExpired) {
              return {
                isValid: false,
                isExpired: true,
                message: 'It looks like licence has expired or something went wrong. Please try again'
              };
            }

            return {
              isValid: true,
              isExpired: false,
              fullName: formatFullName(latestRecord.userProfile),
              licenceValidUpto: formatDateForForm(latestRecord.licenceValidOnUpToDate),
              panNo: latestRecord.application?.projectSites?.applicantPanNumber
            };
          } else {
            return {
              isValid: false,
              isExpired: false,
              message: 'There is no data associated with this Permit Number'
            };
          }
        }
      } else {
        // RENEW CASE: Different logic for renewal
        console.log('🔄 [CERTIFICATE-VALIDATION] Checking wireman for renewal');
        const backlogResponse = await userDetailsService.getWireBacklogDetailsByLicenceNo(licenceNo);
        
        if (backlogResponse?.data?.formModel?.length > 0) {
          // Find the record with largest ID
          const largestIdObject = backlogResponse.data.formModel.reduce((max: any, item: any) => 
            (item.id > max.id ? item : max), backlogResponse.data.formModel[0]);
          
          // Check if it matches renewal app ID (this would need to be passed in)
          // For now, proceed with the validation logic
          const isExpired = isCertificateExpired(largestIdObject.licenceValidUpto);
          
          if (isExpired && isOnlineMode) {
            const detailsResponse = await userDetailsService.getWiremanDetails_ByLicenceNo(licenceNo);
            
            if (detailsResponse?.data?.formModel && detailsResponse.data.formModel.length > 0) {
              const latestRecord = detailsResponse.data.formModel[detailsResponse.data.formModel.length - 1];
              const newIsExpired = isCertificateExpired(latestRecord.licenceValidOnUpToDate);
              
              if (newIsExpired) {
                return {
                  isValid: false,
                  isExpired: true,
                  message: 'It looks like licence has expired or something went wrong. Please try again'
                };
              }

              return {
                isValid: true,
                isExpired: false,
                fullName: formatFullName(latestRecord.userProfile),
                licenceValidUpto: formatDateForForm(latestRecord.licenceValidOnUpToDate),
                panNo: latestRecord.application?.projectSites?.applicantPanNumber
              };
            }
          }
        }
      }

      return { isValid: true, isExpired: false };
    } catch (error: any) {
      console.error('❌ [CERTIFICATE-VALIDATION] Wireman validation error:', error);
      return {
        isValid: false,
        isExpired: false,
        message: 'Error validating permit. Please try again.'
      };
    } finally {
      setIsValidatingWireman(false);
    }
  }, []);

  // Debounced supervisor certificate validation
  const debouncedValidateSupervisor = useCallback((
    licenceNo: string,
    isOnlineMode: boolean,
    onResult: (result: CertificateValidationResult) => void,
    contractorFormMode: 'new' | 'renew' = 'new'
  ) => {
    // Clear previous timeout
    if (supervisorTimeoutRef.current) {
      clearTimeout(supervisorTimeoutRef.current);
    }

    // Set new timeout (2 seconds debounce like Angular)
    supervisorTimeoutRef.current = setTimeout(async () => {
      const result = await validateSupervisorCertificate(licenceNo, isOnlineMode, contractorFormMode);
      onResult(result);
    }, 2000);
  }, [validateSupervisorCertificate]);

  // Debounced wireman certificate validation
  const debouncedValidateWireman = useCallback((
    licenceNo: string,
    isOnlineMode: boolean,
    onResult: (result: CertificateValidationResult) => void,
    contractorFormMode: 'new' | 'renew' = 'new'
  ) => {
    // Clear previous timeout
    if (wiremanTimeoutRef.current) {
      clearTimeout(wiremanTimeoutRef.current);
    }

    // Set new timeout (2 seconds debounce like Angular)
    wiremanTimeoutRef.current = setTimeout(async () => {
      const result = await validateWiremanCertificate(licenceNo, isOnlineMode, contractorFormMode);
      onResult(result);
    }, 2000);
  }, [validateWiremanCertificate]);

  // Check if existing lists have expired certificates
  const checkExpiredCertificates = useCallback((
    supervisorsList: any[],
    wiremansList: any[]
  ) => {
    const expiredSupervisors: string[] = [];
    const expiredWiremen: string[] = [];

    // Check supervisors
    supervisorsList.forEach(supervisor => {
      if (!supervisor.isOnline) {
        // Offline case: check date directly
        const isExpired = isCertificateExpired(supervisor.licenceValidUpto);
        if (isExpired) {
          supervisor.licenceExpired = true;
          expiredSupervisors.push(supervisor.licenceNo);
        } else {
          supervisor.licenceExpired = false;
        }
      } else {
        // Online case: would need API call, mark for checking
        supervisor.licenceExpired = false; // Default, would be updated by API
      }
    });

    // Check wiremen
    wiremansList.forEach(wireman => {
      if (!wireman.isOnline) {
        // Offline case: check date directly
        const isExpired = isCertificateExpired(wireman.licenceValidUpto);
        if (isExpired) {
          wireman.licenceExpired = true;
          expiredWiremen.push(wireman.licenceNo);
        } else {
          wireman.licenceExpired = false;
        }
      } else {
        // Online case: would need API call, mark for checking
        wireman.licenceExpired = false; // Default, would be updated by API
      }
    });

    return {
      expiredSupervisors,
      expiredWiremen,
      hasExpired: expiredSupervisors.length > 0 || expiredWiremen.length > 0
    };
  }, []);

  return {
    isValidatingSupervisor,
    isValidatingWireman,
    validateSupervisorCertificate,
    validateWiremanCertificate,
    debouncedValidateSupervisor,
    debouncedValidateWireman,
    checkExpiredCertificates
  };
};
