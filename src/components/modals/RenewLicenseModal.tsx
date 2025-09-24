import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { commonApiService } from '../../services/commonApiService';
import { useUserRole } from '../../hooks/useUserRole';
import { SweetAlertService } from '../../utils/sweetAlert';

interface RenewLicenseModalProps {
  show: boolean;
  onHide: () => void;
  applicationData: {
    route: string;
    formMode: string;
    applicationType: number;
    generatedLicenseNumber?: string;
  };
}

interface LicenseValidationResponse {
  formModel: any;
  msj: string;
}

const RenewLicenseModal: React.FC<RenewLicenseModalProps> = ({
  show,
  onHide,
  applicationData
}) => {
  const [licenseNumber, setLicenseNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const licenseInputRef = useRef<HTMLInputElement>(null);
  const { getUserId } = useUserRole();

  // Focus input when modal opens
  useEffect(() => {
    if (show) {
      setLicenseNumber(applicationData.generatedLicenseNumber || '');
      setError('');
      setFormSubmitted(false);
      setIsSubmitting(false);
      
      // Focus license input after modal is rendered
      setTimeout(() => {
        if (licenseInputRef.current) {
          licenseInputRef.current.focus();
        }
      }, 200);
    }
  }, [show, applicationData.generatedLicenseNumber]);

  const validateLicenseNumber = (licenseNo: string): boolean => {
    const upperLicenseNo = licenseNo.toUpperCase();
    const { applicationType } = applicationData;

    // Match Angular validation logic exactly
    if (applicationType === 6) {
      // Contractor - must contain 'L'
      if (!upperLicenseNo.includes('L')) {
        setError('Please enter relevant Licence Number');
        return false;
      }
    } else if (applicationType === 7) {
      // Supervisor - must contain 'E' and 'P'
      if (!upperLicenseNo.includes('E') || !upperLicenseNo.includes('P')) {
        setError('Please enter relevant Licence Number');
        return false;
      }
    } else if (applicationType === 8) {
      // Wireman - must contain 'W', 'E', and 'A'
      if (!upperLicenseNo.includes('W') || !upperLicenseNo.includes('E') || !upperLicenseNo.includes('A')) {
        setError('Please enter relevant Licence Number');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    setFormSubmitted(true);
    setError('');

    // Basic validation
    if (!licenseNumber.trim()) {
      setError('Licence No is required.');
      return;
    }

    // License type validation
    if (!validateLicenseNumber(licenseNumber)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const userId = getUserId();
      if (!userId) {
        await SweetAlertService.error('Please log in to continue.');
        return;
      }

      // API call to validate renewal details - matching Angular exactly  
      const response: LicenseValidationResponse = await commonApiService.getRenewalDetailsByLicenseNumber(
        licenseNumber.toUpperCase(),
        userId
      );

      if (response?.formModel === null) {
        // Show info message from API
        await SweetAlertService.info(
          response?.msj || 'No renewal details found for this license number.'
        );
      } else {
        // Success - navigate to the renewal form  
        // Convert route string to proper navigation call
        if (applicationData.route) {
          window.location.href = applicationData.route;
        }
        
        // Close modal
        onHide();
      }
    } catch (error: any) {
      console.error('❌ [RENEW-MODAL] Error validating license:', error);
      
      // Show error message
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'An error occurred while validating the license number. Please try again.';
      
      await SweetAlertService.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setLicenseNumber('');
    setError('');
    setFormSubmitted(false);
    setIsSubmitting(false);
    onHide();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleSubmit();
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header>
        <Modal.Title className="font_family">Licence No</Modal.Title>
        <button 
          type="button" 
          className="close closeButton" 
          aria-label="Close"
          onClick={handleClose}
          disabled={isSubmitting}
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={(e) => e.preventDefault()}>
          <div className="mt-4">
            <div className="row m-0">
              <div className="col-12 px-0">
                <div className="row m-0">
                  <div className="col-12 px-0 mb-3">
                    <div className="form-group">
                      <label className="required" htmlFor="license_no">
                        Licence No
                      </label>
                      <input
                        ref={licenseInputRef}
                        type="text"
                        className={`form-control ${
                          ((formSubmitted || licenseNumber) && (!licenseNumber.trim() || error)) 
                            ? 'is-invalid' 
                            : ''
                        }`}
                        placeholder="Enter License Number"
                        id="license_no"
                        value={licenseNumber}
                        onChange={(e) => {
                          setLicenseNumber(e.target.value);
                          if (error) setError(''); // Clear error on typing
                        }}
                        onKeyPress={handleKeyPress}
                        disabled={isSubmitting}
                        autoComplete="off"
                      />
                      
                      {/* Error display - matching Angular validation */}
                      {((formSubmitted && !licenseNumber.trim()) || error) && (
                        <div className="invalid-feedback d-block">
                          {error || 'Licence No is required.'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center my-3">
            <Button
              type="submit"
              className="btn btn-primary my-3 w-50 font_family"
              style={{ fontSize: '13px', borderRadius: '0px !important' }}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Validating...
                </>
              ) : (
                'Submit'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default RenewLicenseModal;