import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Row, Col, Form, Button, Alert, Spinner, Modal, Badge } from 'react-bootstrap';
import { PaymentApiService } from '../../services/paymentApiService';

interface FeeStructure {
  applicationType: string;
  baseFee: number;
  processingFee: number;
  additionalCharges: Record<string, number>;
  totalFee: number;
}

interface PaymentFormData {
  applicationId: string;
  applicantId: string;
  paymentType: string;
  amount: number;
  paymentMode: 'online' | 'offline' | 'cheque' | 'dd';
  chequeDetails?: {
    chequeNumber: string;
    bankName: string;
    chequeDate: string;
  };
  ddDetails?: {
    ddNumber: string;
    bankName: string;
    ddDate: string;
  };
}

interface PaymentProcessorProps {
  // Add any props if needed
}

export const PaymentProcessor: React.FC<PaymentProcessorProps> = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();

  // State Management
  const [feeStructure, setFeeStructure] = useState<FeeStructure | null>(null);
  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    applicationId: applicationId || '',
    applicantId: '',
    paymentType: '',
    amount: 0,
    paymentMode: 'online'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  // Form Validation State
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Services
  const paymentApiService = new PaymentApiService();

  useEffect(() => {
    if (!applicationId) {
      toast.error('Application ID is required');
      navigate('/dashboard');
      return;
    }

    initializePaymentForm();
  }, [applicationId, navigate]);

  const initializePaymentForm = async () => {
    try {
      setIsLoading(true);
      
      // Get fee structure for the application type
      const feeResponse = await paymentApiService.getFeeStructure();
      if (feeResponse?.formModel) {
        setFeeStructure(feeResponse.formModel);
        setPaymentForm(prev => ({
          ...prev,
          amount: feeResponse.formModel.totalFee,
          paymentType: feeResponse.formModel.applicationType
        }));
      }

      // Pre-fill applicant ID from session/context if available
      const applicantId = sessionStorage.getItem('applicantId');
      if (applicantId) {
        setPaymentForm(prev => ({ ...prev, applicantId }));
      }
      
    } catch (error) {
      console.error('Error initializing payment form:', error);
      setError('Failed to load payment information');
      toast.error('Failed to load payment information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof PaymentFormData, value: any) => {
    setPaymentForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleChequeDetailsChange = (field: string, value: string) => {
    setPaymentForm(prev => ({
      ...prev,
      chequeDetails: {
        ...prev.chequeDetails,
        [field]: value
      } as any
    }));
  };

  const handleDdDetailsChange = (field: string, value: string) => {
    setPaymentForm(prev => ({
      ...prev,
      ddDetails: {
        ...prev.ddDetails,
        [field]: value
      } as any
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!paymentForm.applicationId.trim()) {
      errors.applicationId = 'Application ID is required';
    }

    if (!paymentForm.applicantId.trim()) {
      errors.applicantId = 'Applicant ID is required';
    }

    if (!paymentForm.paymentType.trim()) {
      errors.paymentType = 'Payment type is required';
    }

    if (!paymentForm.amount || paymentForm.amount <= 0) {
      errors.amount = 'Valid amount is required';
    }

    if (!paymentForm.paymentMode) {
      errors.paymentMode = 'Payment mode is required';
    }

    // Validate payment mode specific details
    if (paymentForm.paymentMode === 'cheque') {
      if (!paymentForm.chequeDetails?.chequeNumber?.trim()) {
        errors.chequeNumber = 'Cheque number is required';
      }
      if (!paymentForm.chequeDetails?.bankName?.trim()) {
        errors.bankName = 'Bank name is required';
      }
      if (!paymentForm.chequeDetails?.chequeDate) {
        errors.chequeDate = 'Cheque date is required';
      }
    }

    if (paymentForm.paymentMode === 'dd') {
      if (!paymentForm.ddDetails?.ddNumber?.trim()) {
        errors.ddNumber = 'DD number is required';
      }
      if (!paymentForm.ddDetails?.bankName?.trim()) {
        errors.bankName = 'Bank name is required';
      }
      if (!paymentForm.ddDetails?.ddDate) {
        errors.ddDate = 'DD date is required';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitPayment = () => {
    if (!validateForm()) {
      toast.error('Please fix the form errors before proceeding');
      return;
    }
    setShowConfirmModal(true);
  };

  const processPayment = async () => {
    try {
      setIsLoading(true);
      
      const response = await paymentApiService.initiatePayment(paymentForm);
      
      if (response?.formModel) {
        toast.success('Payment initiated successfully');
        setPaymentInitiated(true);
        
        // If it's an online payment, redirect to gateway
        if (paymentForm.paymentMode === 'online' && response.formModel.gatewayUrl) {
          window.location.href = response.formModel.gatewayUrl;
        } else {
          // For offline payments, navigate to payment details
          navigate(`/dashboard/payments/payment/${response.formModel.paymentId}`);
        }
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    } finally {
      setIsLoading(false);
      setShowConfirmModal(false);
    }
  };

  const renderFeeStructure = () => {
    if (!feeStructure) return null;

    return (
      <Card className="mb-4">
        <Card.Header>
          <h5 className="card-title mb-0">Fee Structure</h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <table className="table table-sm">
              <tbody>
                <tr>
                  <td>Base Fee</td>
                  <td className="text-end">₹{feeStructure.baseFee.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td>Processing Fee</td>
                  <td className="text-end">₹{feeStructure.processingFee.toLocaleString('en-IN')}</td>
                </tr>
                {Object.entries(feeStructure.additionalCharges || {}).map(([key, value]) => (
                  <tr key={key}>
                    <td>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</td>
                    <td className="text-end">₹{value.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
                <tr className="table-active fw-bold">
                  <td>Total Amount</td>
                  <td className="text-end">₹{feeStructure.totalFee.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>
    );
  };

  const renderPaymentModeSpecificFields = () => {
    if (paymentForm.paymentMode === 'cheque') {
      return (
        <Card className="mb-4">
          <Card.Header>
            <h6 className="card-title mb-0">Cheque Details</h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Cheque Number <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter cheque number"
                    value={paymentForm.chequeDetails?.chequeNumber || ''}
                    onChange={(e) => handleChequeDetailsChange('chequeNumber', e.target.value)}
                    isInvalid={!!formErrors.chequeNumber}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.chequeNumber}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Bank Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter bank name"
                    value={paymentForm.chequeDetails?.bankName || ''}
                    onChange={(e) => handleChequeDetailsChange('bankName', e.target.value)}
                    isInvalid={!!formErrors.bankName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.bankName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Cheque Date <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    value={paymentForm.chequeDetails?.chequeDate || ''}
                    onChange={(e) => handleChequeDetailsChange('chequeDate', e.target.value)}
                    isInvalid={!!formErrors.chequeDate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.chequeDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      );
    }

    if (paymentForm.paymentMode === 'dd') {
      return (
        <Card className="mb-4">
          <Card.Header>
            <h6 className="card-title mb-0">Demand Draft Details</h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>DD Number <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter DD number"
                    value={paymentForm.ddDetails?.ddNumber || ''}
                    onChange={(e) => handleDdDetailsChange('ddNumber', e.target.value)}
                    isInvalid={!!formErrors.ddNumber}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.ddNumber}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Bank Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter bank name"
                    value={paymentForm.ddDetails?.bankName || ''}
                    onChange={(e) => handleDdDetailsChange('bankName', e.target.value)}
                    isInvalid={!!formErrors.bankName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.bankName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>DD Date <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    value={paymentForm.ddDetails?.ddDate || ''}
                    onChange={(e) => handleDdDetailsChange('ddDate', e.target.value)}
                    isInvalid={!!formErrors.ddDate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.ddDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      );
    }

    return null;
  };

  if (isLoading && !feeStructure) {
    return (
      <div className="container-fluid">
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading payment form...</span>
          </Spinner>
          <p className="mt-2 text-muted">Loading payment form...</p>
        </div>
      </div>
    );
  }

  if (paymentInitiated) {
    return (
      <div className="container-fluid">
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="bx bx-check-circle text-success" style={{ fontSize: '4rem' }}></i>
          </div>
          <h3 className="text-success">Payment Initiated Successfully</h3>
          <p className="text-muted">Your payment has been processed. You will receive a confirmation shortly.</p>
          <div className="d-flex gap-2 justify-content-center mt-4">
            <Button variant="primary" onClick={() => navigate('/dashboard/payments')}>
              View Payments
            </Button>
            <Button variant="outline-secondary" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="page-title">Payment Processing</h2>
          <p className="text-muted mb-0">Complete your payment for Application ID: {applicationId}</p>
        </div>
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate(-1)}
        >
          <i className="bx bx-arrow-back me-1"></i>
          Back
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Row>
        <Col lg={8}>
          {/* Payment Form */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="card-title mb-0">Payment Details</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Application ID</Form.Label>
                    <Form.Control
                      type="text"
                      value={paymentForm.applicationId}
                      onChange={(e) => handleInputChange('applicationId', e.target.value)}
                      isInvalid={!!formErrors.applicationId}
                      readOnly
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.applicationId}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Applicant ID</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter applicant ID"
                      value={paymentForm.applicantId}
                      onChange={(e) => handleInputChange('applicantId', e.target.value)}
                      isInvalid={!!formErrors.applicantId}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.applicantId}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Payment Type</Form.Label>
                    <Form.Control
                      type="text"
                      value={paymentForm.paymentType}
                      onChange={(e) => handleInputChange('paymentType', e.target.value)}
                      isInvalid={!!formErrors.paymentType}
                      readOnly={!!feeStructure}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.paymentType}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Amount</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">₹</span>
                      <Form.Control
                        type="number"
                        value={paymentForm.amount}
                        onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                        isInvalid={!!formErrors.amount}
                        readOnly={!!feeStructure}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.amount}
                      </Form.Control.Feedback>
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Payment Mode</Form.Label>
                    <Form.Select
                      value={paymentForm.paymentMode}
                      onChange={(e) => handleInputChange('paymentMode', e.target.value as any)}
                      isInvalid={!!formErrors.paymentMode}
                    >
                      <option value="online">Online Payment</option>
                      <option value="offline">Offline Payment</option>
                      <option value="cheque">Cheque</option>
                      <option value="dd">Demand Draft</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {formErrors.paymentMode}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Payment Mode Specific Fields */}
          {renderPaymentModeSpecificFields()}

          {/* Submit Button */}
          <div className="d-flex gap-2 mb-4">
            <Button 
              variant="primary" 
              size="lg"
              onClick={handleSubmitPayment}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Processing...
                </>
              ) : (
                <>
                  <i className="bx bx-credit-card me-2"></i>
                  Proceed to Payment
                </>
              )}
            </Button>
            <Button 
              variant="outline-secondary" 
              size="lg"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
          </div>

          {/* Payment Mode Information */}
          <Alert variant="info">
            <h6 className="alert-heading">Payment Information</h6>
            {paymentForm.paymentMode === 'online' && (
              <p className="mb-0">You will be redirected to the payment gateway to complete your transaction securely.</p>
            )}
            {paymentForm.paymentMode === 'offline' && (
              <p className="mb-0">Your payment will be processed manually. Please keep your payment reference for future communication.</p>
            )}
            {paymentForm.paymentMode === 'cheque' && (
              <p className="mb-0">Please ensure the cheque details are accurate. The cheque should be drawn in favor of the concerned authority.</p>
            )}
            {paymentForm.paymentMode === 'dd' && (
              <p className="mb-0">Please ensure the DD details are accurate. The DD should be drawn in favor of the concerned authority.</p>
            )}
          </Alert>
        </Col>

        <Col lg={4}>
          {/* Fee Structure */}
          {renderFeeStructure()}

          {/* Payment Summary */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="card-title mb-0">Payment Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Application ID:</span>
                <span className="font-monospace">{paymentForm.applicationId}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Payment Mode:</span>
                <Badge bg="primary">{paymentForm.paymentMode.toUpperCase()}</Badge>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold">
                <span>Total Amount:</span>
                <span className="text-success">₹{paymentForm.amount.toLocaleString('en-IN')}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please confirm the payment details:</p>
          <div className="bg-light p-3 rounded">
            <div className="row">
              <div className="col-6"><strong>Application ID:</strong></div>
              <div className="col-6">{paymentForm.applicationId}</div>
              <div className="col-6"><strong>Payment Type:</strong></div>
              <div className="col-6">{paymentForm.paymentType}</div>
              <div className="col-6"><strong>Amount:</strong></div>
              <div className="col-6">₹{paymentForm.amount.toLocaleString('en-IN')}</div>
              <div className="col-6"><strong>Payment Mode:</strong></div>
              <div className="col-6">{paymentForm.paymentMode.toUpperCase()}</div>
            </div>
          </div>
          {paymentForm.paymentMode === 'online' && (
            <Alert variant="warning" className="mt-3">
              <i className="bx bx-info-circle me-2"></i>
              You will be redirected to the payment gateway to complete the transaction.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={processPayment}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Confirm Payment'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PaymentProcessor;