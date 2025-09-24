import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Table, Modal, Badge } from 'react-bootstrap';
import { useEnhancedFormValidation } from '../../hooks/useEnhancedFormValidation';
import { FormValidators } from '../../utils/validators';
import { axiosInterceptor } from '../../lib/interceptor';
import { useAuth } from '../../hooks/useAuth';

// Processing status types
interface ProcessingStatus {
  id: number;
  label: string;
  action: number;
  mode: 'new' | 'renew' | 'new/renew';
  requiresReceiver: boolean;
  requiresLicenseDetails: boolean;
  nextStep?: string;
}

// Application processing form data
interface ProcessingFormData {
  status: string;
  receiver: string;
  comments: string;
  upload?: File;
  licenceNo?: string;
  issuedOn?: string;
  validTill?: string;
}

// Application data interface
interface ApplicationData {
  appId: number;
  applicationType: number;
  applicationPurposeType: number;
  projectSiteId: number;
  appActionId: number;
  licenceNoOfYear?: number;
  currentStatus: string;
  applicantName: string;
  applicationAction: {
    appActionType: number;
    actionName: string;
    actionDate: string;
    comments?: string;
  };
}

// Processing history interface
interface ProcessingHistory {
  id: number;
  actionType: string;
  actionDate: string;
  processedBy: string;
  comments: string;
  status: string;
}

const ProcessApplication: React.FC = () => {
  // Auth state
  const { user } = useAuth();
  const roleName = user?.roleName || 'CONTRACTOR';

  // Form and application state
  const [formData, setFormData] = useState<ProcessingFormData>({
    status: '',
    receiver: '',
    comments: '',
    licenceNo: '',
    issuedOn: '',
    validTill: ''
  });

  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [processingHistory, setProcessingHistory] = useState<ProcessingHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Processing status options based on role
  const [processingStatusList, setProcessingStatusList] = useState<ProcessingStatus[]>([]);
  const [receiversList, setReceiversList] = useState<any[]>([]);

  // Enhanced form validation
  const { validateForm, handleFieldChange, validationState } = useEnhancedFormValidation<ProcessingFormData>({
    validationRules: {
      status: [{ validator: FormValidators.required }],
      receiver: [{ 
        validator: FormValidators.required,
        when: () => getSelectedStatus()?.requiresReceiver || false
      }],
      comments: [{ validator: FormValidators.required }],
      licenceNo: [{ 
        validator: FormValidators.required,
        when: () => getSelectedStatus()?.requiresLicenseDetails || false
      }],
      issuedOn: [{ 
        validator: FormValidators.required,
        when: () => getSelectedStatus()?.requiresLicenseDetails || false
      }],
      validTill: [{ 
        validator: FormValidators.required,
        when: () => getSelectedStatus()?.requiresLicenseDetails || false
      }],
    },
    mode: 'onChange'
  });

  // Get processing status options based on role and application type
  const getProcessingStatusByRole = (role: string): ProcessingStatus[] => {
    const statusMap: { [key: string]: ProcessingStatus[] } = {
      'CEI': [
        { id: 1, label: 'Approved', action: 1, mode: 'new/renew', requiresReceiver: false, requiresLicenseDetails: true },
        { id: 2, label: 'Rejected', action: 2, mode: 'new/renew', requiresReceiver: false, requiresLicenseDetails: false },
        { id: 3, label: 'Return for Correction', action: 3, mode: 'new/renew', requiresReceiver: false, requiresLicenseDetails: false },
      ],
      'SUPT': [
        { id: 4, label: 'Forward to CEI', action: 4, mode: 'new/renew', requiresReceiver: true, requiresLicenseDetails: false },
        { id: 5, label: 'Rejected', action: 2, mode: 'new/renew', requiresReceiver: false, requiresLicenseDetails: false },
        { id: 6, label: 'Return for Correction', action: 3, mode: 'new/renew', requiresReceiver: false, requiresLicenseDetails: false },
      ],
      'ADMIN_OFFICER': [
        { id: 7, label: 'Forward to Superintendent', action: 7, mode: 'new/renew', requiresReceiver: true, requiresLicenseDetails: false },
        { id: 8, label: 'Return for Correction', action: 3, mode: 'new/renew', requiresReceiver: false, requiresLicenseDetails: false },
      ],
      'CONTRACTOR': []
    };

    return statusMap[role] || [];
  };

  // Get selected status details
  const getSelectedStatus = (): ProcessingStatus | undefined => {
    return processingStatusList.find(status => status.id.toString() === formData.status);
  };

  // Initialize component
  useEffect(() => {
    const statusOptions = getProcessingStatusByRole(roleName);
    setProcessingStatusList(statusOptions);
    
    // Load receivers list
    loadReceiversList();
    
    // Load application data if available
    loadApplicationData();
  }, [roleName]);

  // Load receivers list based on current user role
  const loadReceiversList = async () => {
    try {
      const response = await axiosInterceptor.get('/Admin/getReceiversByRole', {
        params: { roleName }
      });
      setReceiversList((response.data as any)?.data || []);
    } catch (error) {
      console.error('Error loading receivers list:', error);
    }
  };

  // Load application data (would normally come from props or route params)
  const loadApplicationData = async () => {
    try {
      // This would typically load from route params or props
      // For now, using mock data
      const mockApplication: ApplicationData = {
        appId: 12345,
        applicationType: 1,
        applicationPurposeType: 1,
        projectSiteId: 100,
        appActionId: 50,
        currentStatus: 'Under Review',
        applicantName: 'John Doe Contractor',
        applicationAction: {
          appActionType: 1,
          actionName: 'New Application Submitted',
          actionDate: new Date().toISOString(),
          comments: 'Application submitted for electrical contractor license'
        }
      };
      
      setApplication(mockApplication);
    } catch (error) {
      console.error('Error loading application data:', error);
    }
  };

  // Load processing history
  const loadProcessingHistory = async () => {
    if (!application) return;
    
    try {
      const response = await axiosInterceptor.get('/Application/getProcessingHistory', {
        params: { appId: application.appId }
      });
      setProcessingHistory((response.data as any)?.data || []);
      setShowHistoryModal(true);
    } catch (error) {
      console.error('Error loading processing history:', error);
    }
  };

  // Handle form field changes
  const handleInputChange = (fieldName: keyof ProcessingFormData, value: string) => {
    const newFormData = { ...formData, [fieldName]: value };
    setFormData(newFormData);
    handleFieldChange(fieldName, value, newFormData);
  };

  // Handle file upload
  const handleFileUpload = (file: File) => {
    setFormData({ ...formData, upload: file });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!application) {
      setError('No application loaded for processing');
      return;
    }

    const validationResult = validateForm(formData);
    if (!validationResult.isValid) {
      console.log('❌ [PROCESS-APPLICATION] Form validation failed:', validationResult.errors);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const selectedStatus = getSelectedStatus();
      if (!selectedStatus) {
        throw new Error('Invalid status selected');
      }

      console.log('🔄 [PROCESS-APPLICATION] Processing application:', {
        appId: application.appId,
        action: selectedStatus.action,
        status: formData.status,
        comments: formData.comments
      });

      const payload = {
        appId: application.appId,
        appActionId: application.appActionId,
        actionType: selectedStatus.action,
        status: formData.status,
        receiverId: formData.receiver || null,
        comments: formData.comments,
        licenceDetails: selectedStatus.requiresLicenseDetails ? {
          licenceNo: formData.licenceNo,
          issuedOn: formData.issuedOn,
          validTill: formData.validTill
        } : null
      };

      const response = await axiosInterceptor.post('/Application/processApplication', payload);

      if (response.success) {
        setSuccess(`Application ${selectedStatus.label.toLowerCase()} successfully!`);
        
        // Refresh application data
        loadApplicationData();
        
        // Clear form
        setFormData({
          status: '',
          receiver: '',
          comments: '',
          licenceNo: '',
          issuedOn: '',
          validTill: ''
        });
      }
    } catch (err: any) {
      console.error('❌ [PROCESS-APPLICATION] Error processing application:', err);
      setError(err.message || 'Failed to process application');
    } finally {
      setLoading(false);
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string): string => {
    const statusColors: { [key: string]: string } = {
      'approved': 'success',
      'rejected': 'danger',
      'under review': 'warning',
      'pending': 'secondary',
      'correction required': 'info'
    };
    return statusColors[status.toLowerCase()] || 'secondary';
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">
                <i className="fa-solid fa-cogs me-2"></i>
                Process Application
              </h5>
            </Card.Header>
            <Card.Body>
              {/* Application Details Summary */}
              {application && (
                <div className="mb-4 p-3 bg-light rounded">
                  <Row>
                    <Col md={6}>
                      <strong>Application ID:</strong> {application.appId}<br />
                      <strong>Applicant:</strong> {application.applicantName}<br />
                      <strong>Current Status:</strong>{' '}
                      <Badge bg={getStatusBadgeColor(application.currentStatus)}>
                        {application.currentStatus}
                      </Badge>
                    </Col>
                    <Col md={6}>
                      <strong>Application Type:</strong> {application.applicationType}<br />
                      <strong>Project Site ID:</strong> {application.projectSiteId}<br />
                      <Button 
                        variant="outline-info" 
                        size="sm" 
                        onClick={loadProcessingHistory}
                        className="mt-2"
                      >
                        <i className="fa-solid fa-history me-1"></i>
                        View History
                      </Button>
                    </Col>
                  </Row>
                </div>
              )}

              {/* Processing Form */}
              <Form onSubmit={handleSubmit}>
                <Row>
                  {/* Status Selection */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="required">Processing Action</Form.Label>
                      <Form.Select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        isInvalid={!!validationState.errors.status}
                      >
                        <option value="">Select action...</option>
                        {processingStatusList.map((status) => (
                          <option key={status.id} value={status.id.toString()}>
                            {status.label}
                          </option>
                        ))}
                      </Form.Select>
                      {validationState.errors.status && (
                        <Form.Control.Feedback type="invalid">
                          {validationState.errors.status}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>
                  </Col>

                  {/* Receiver Selection (conditional) */}
                  {getSelectedStatus()?.requiresReceiver && (
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="required">Forward To</Form.Label>
                        <Form.Select
                          value={formData.receiver}
                          onChange={(e) => handleInputChange('receiver', e.target.value)}
                          isInvalid={!!validationState.errors.receiver}
                        >
                          <option value="">Select receiver...</option>
                          {receiversList.map((receiver) => (
                            <option key={receiver.id} value={receiver.id}>
                              {receiver.name} - {receiver.role}
                            </option>
                          ))}
                        </Form.Select>
                        {validationState.errors.receiver && (
                          <Form.Control.Feedback type="invalid">
                            {validationState.errors.receiver}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>
                    </Col>
                  )}

                  {/* Comments */}
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label className="required">Comments</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={formData.comments}
                        onChange={(e) => handleInputChange('comments', e.target.value)}
                        isInvalid={!!validationState.errors.comments}
                        placeholder="Enter processing comments..."
                      />
                      {validationState.errors.comments && (
                        <Form.Control.Feedback type="invalid">
                          {validationState.errors.comments}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>
                  </Col>

                  {/* License Details (for CEI approval) */}
                  {getSelectedStatus()?.requiresLicenseDetails && (
                    <>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label className="required">License Number</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.licenceNo}
                            onChange={(e) => handleInputChange('licenceNo', e.target.value)}
                            isInvalid={!!validationState.errors.licenceNo}
                            placeholder="Generated license number"
                          />
                          {validationState.errors.licenceNo && (
                            <Form.Control.Feedback type="invalid">
                              {validationState.errors.licenceNo}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label className="required">Issued On</Form.Label>
                          <Form.Control
                            type="date"
                            value={formData.issuedOn}
                            onChange={(e) => handleInputChange('issuedOn', e.target.value)}
                            isInvalid={!!validationState.errors.issuedOn}
                          />
                          {validationState.errors.issuedOn && (
                            <Form.Control.Feedback type="invalid">
                              {validationState.errors.issuedOn}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label className="required">Valid Till</Form.Label>
                          <Form.Control
                            type="date"
                            value={formData.validTill}
                            onChange={(e) => handleInputChange('validTill', e.target.value)}
                            isInvalid={!!validationState.errors.validTill}
                          />
                          {validationState.errors.validTill && (
                            <Form.Control.Feedback type="invalid">
                              {validationState.errors.validTill}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>
                      </Col>
                    </>
                  )}

                  {/* File Upload */}
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Upload Supporting Document</Form.Label>
                      <Form.Control
                        type="file"
                        onChange={(e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                      <Form.Text className="text-muted">
                        Accepted formats: PDF, DOC, DOCX, JPG, PNG. Max size: 10MB
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Success Message */}
                {success && (
                  <Alert variant="success" className="mt-3">
                    <i className="fa-solid fa-check-circle me-2"></i>
                    {success}
                  </Alert>
                )}

                {/* Error Message */}
                {error && (
                  <Alert variant="danger" className="mt-3">
                    <i className="fa-solid fa-exclamation-circle me-2"></i>
                    {error}
                  </Alert>
                )}

                {/* Submit Button */}
                <div className="d-flex justify-content-end mt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading || !application}
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin me-2"></i>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-check me-2"></i>
                        Process Application
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Processing Guidelines */}
        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Header>
              <h6 className="mb-0">
                <i className="fa-solid fa-info-circle me-2"></i>
                Processing Guidelines
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="small">
                <strong>Role: {roleName}</strong>
                <hr />
                <ul className="list-unstyled">
                  {processingStatusList.map((status) => (
                    <li key={status.id} className="mb-2">
                      <Badge bg="secondary" className="me-2">{status.label}</Badge>
                      {status.requiresReceiver && <span className="text-muted">→ Requires Receiver</span>}
                      {status.requiresLicenseDetails && <span className="text-muted">→ License Details</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Processing History Modal */}
      <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fa-solid fa-history me-2"></i>
            Processing History
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {processingHistory.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Action</th>
                  <th>Processed By</th>
                  <th>Status</th>
                  <th>Comments</th>
                </tr>
              </thead>
              <tbody>
                {processingHistory.map((history) => (
                  <tr key={history.id}>
                    <td>{new Date(history.actionDate).toLocaleDateString()}</td>
                    <td>{history.actionType}</td>
                    <td>{history.processedBy}</td>
                    <td>
                      <Badge bg={getStatusBadgeColor(history.status)}>
                        {history.status}
                      </Badge>
                    </td>
                    <td>{history.comments}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center text-muted">No processing history available</div>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ProcessApplication;