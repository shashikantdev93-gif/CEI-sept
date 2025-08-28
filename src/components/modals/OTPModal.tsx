import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';

interface OTPModalProps {
  show: boolean;
  onHide: () => void;
  mobileNumber: string;
  sentFrom: string;
  generatedOtp: string;
  onVerificationSuccess: () => void; // No parameter - matches Angular exactly
}

const OTPModal: React.FC<OTPModalProps> = ({
  show,
  onHide,
  mobileNumber,
  sentFrom,
  generatedOtp,
  onVerificationSuccess
}) => {
  const [otp, setOtp] = useState(['', '', '', '']); // Changed to 4 digits
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  
  useEffect(() => {
    console.log('🔍 [OTP-MODAL] Modal props:', {
      show,
      mobileNumber,
      sentFrom,
      generatedOtp: generatedOtp?.length // Don't log actual OTP for security
    });
  }, [show, mobileNumber, sentFrom, generatedOtp]);

  // Reset modal state when shown
  useEffect(() => {
    if (show) {
      console.log('🔍 [OTP-MODAL] Modal showing - resetting state');
      setOtp(['', '', '', '']); // Changed to 4 digits
      setError('');
      setIsSubmitting(false);
      
      // Focus first input
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 200);
    }
  }, [show]);

  const handleOTPChange = (value: string, index: number) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError('');
      
      // Auto-focus next input (changed to 3 for 4-digit OTP)
      if (value && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmitOTP = async () => {
    // Validate form first like Angular
    if (otp.some(digit => !digit)) {
      setError('Please enter complete 4-digit OTP');
      return;
    }

    // Combine 4 digits exactly like Angular
    let otpValue = otp[0] + otp[1] + otp[2] + otp[3];
    otpValue = parseInt(otpValue).toString(); // Convert to int then back to string like Angular

    setIsSubmitting(true);
    setError('');

    try {
      console.log('🔍 [OTP-VERIFICATION] onSave() called');
      console.log('🔍 [OTP-VERIFICATION] Form valid:', true);
      console.log('🔍 [OTP-VERIFICATION] Combined OTP:', otpValue);
      
      // SENT FROM CAF1 Verify Mobile Number - exact Angular logic
      if (sentFrom === "Verify Mobile Number") {
        console.log('🔍 [OTP-VERIFICATION] Processing "Verify Mobile Number" flow');
        console.log('🔍 [OTP-VERIFICATION] Comparing OTP:', otpValue, 'with generated:', generatedOtp);
        
        if (otpValue === generatedOtp) {
          console.log('✅ [OTP-VERIFICATION] OTP matched - setting mobileNumberVerified: true');
          
          // Exact Angular behavior: this.bsModalRef.content = { mobileNumberVerified: true};
          // then this.bsModalRef.hide();
          onHide(); // Hide modal first
          
          // Trigger success callback (simulates Angular's onHidden subscription)
          setTimeout(() => {
            console.log('🪟 [MODAL-HIDDEN] Modal hidden, triggering success callback');
            onVerificationSuccess();
          }, 100);
        } else {
          console.log('❌ [OTP-VERIFICATION] OTP mismatch');
          setError('Invalid OTP !! Please try again.');
          setIsSubmitting(false);
        }
      }
      // Can add other sentFrom cases here like Angular has
    } catch (error: any) {
      console.error('❌ [OTP-VERIFICATION] Error:', error);
      setError(error.message || 'Verification failed');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    console.log('🔍 [OTP-MODAL] Modal closed by user');
    onHide();
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      centered 
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title className="text-primary">
          {sentFrom === 'Verify Mobile Number' ? 'Verify Mobile Number' : 'OTP Verification'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center mb-4">
          <h6 className="mb-3">
            Please enter the 4-digit OTP sent to:
          </h6>
          <p className="fw-bold text-primary fs-5 mb-3">{mobileNumber}</p>
        </div>
        
        {error && (
          <Alert variant="danger" className="mb-3">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}
        
        <div className="d-flex justify-content-center gap-3 mb-4">
          {otp.map((digit, index) => (
            <Form.Control
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOTPChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={(e) => {
                e.preventDefault();
                const pastedData = e.clipboardData.getData('text').slice(0, 4); // Changed to 4 digits
                if (/^\d+$/.test(pastedData)) {
                  const newOtp = pastedData.split('').concat(['', '', '', '']).slice(0, 4); // Changed to 4 digits
                  setOtp(newOtp);
                  const lastIndex = Math.min(pastedData.length - 1, 3); // Changed to 3 (0-indexed)
                  inputRefs.current[lastIndex]?.focus();
                }
              }}
              style={{ 
                width: '60px', 
                height: '60px',
                textAlign: 'center',
                fontSize: '1.8rem',
                fontWeight: 'bold',
                border: '2px solid #dee2e6',
                borderRadius: '8px'
              }}
              disabled={isSubmitting}
              className={`${digit ? 'border-primary' : ''}`}
            />
          ))}
        </div>

        <div className="text-center mb-3">
          <small className="text-muted">
            Please check your SMS for the 4-digit verification code
          </small>
        </div>
      </Modal.Body>
      <Modal.Footer className="justify-content-center">
        <Button
          variant="secondary"
          onClick={handleClose}
          disabled={isSubmitting}
          className="me-3"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmitOTP}
          disabled={isSubmitting || otp.join('').length !== 4} // Changed to 4 digits
          size="lg"
          style={{ minWidth: '150px' }}
        >
          {isSubmitting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Verifying...
            </>
          ) : (
            'Submit'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OTPModal;