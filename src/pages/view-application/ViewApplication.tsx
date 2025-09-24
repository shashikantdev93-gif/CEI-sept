import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Nav, Tab, Alert, Spinner } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { axiosInterceptor } from '../../lib/interceptor';

// Application type constants
const ApplicationType = {
  CONTRACTOR: 6,
  SUPERVISOR: 7,
  WIREMAN: 8
} as const;

type ApplicationTypeValue = typeof ApplicationType[keyof typeof ApplicationType];

// Application view data interface
interface ViewApplicationData {
  appId: number;
  appRefId: number;
  applicationType: ApplicationTypeValue;
  applicationPurposeType: number;
  projectSiteId: number;
  currentStatus: string;
  submittedDate: string;
  lastUpdated: string;
  applicantDetails: any;
  supervisorDetails?: any;
  attachments: any[];
  processingHistory: any[];
  licenseDetails?: any;
}

// Component props interface
interface ApplicationViewerProps {
  applicationData: ViewApplicationData;
}

// Contractor Application Viewer Component
const ContractorApplicationViewer: React.FC<ApplicationViewerProps> = ({ applicationData }) => (
  <Card className="mb-3">
    <Card.Header>
      <h6 className="mb-0">
        <i className="fa-solid fa-building me-2"></i>
        Contractor Application Details
      </h6>
    </Card.Header>
    <Card.Body>
      {applicationData.applicantDetails ? (
        <Row>
          <Col md={6}>
            <div className="mb-3">
              <strong>Applicant Name:</strong><br />
              <span>{applicationData.applicantDetails.applicantName}</span>
            </div>
            <div className="mb-3">
              <strong>Business Entity:</strong><br />
              <span>{applicationData.applicantDetails.businessEntity}</span>
            </div>
            <div className="mb-3">
              <strong>PAN Number:</strong><br />
              <span>{applicationData.applicantDetails.panNumber}</span>
            </div>
          </Col>
          <Col md={6}>
            <div className="mb-3">
              <strong>Contractor Type:</strong><br />
              <span>{applicationData.applicantDetails.contractorType}</span>
            </div>
            <div className="mb-3">
              <strong>Working Voltage:</strong><br />
              <span>{applicationData.applicantDetails.workingVoltage}</span>
            </div>
            <div className="mb-3">
              <strong>Address:</strong><br />
              <span>{applicationData.applicantDetails.address}</span>
            </div>
          </Col>
        </Row>
      ) : (
        <div className="text-center text-muted">
          <Spinner animation="border" size="sm" className="me-2" />
          Loading contractor details...
        </div>
      )}
    </Card.Body>
  </Card>
);

// Supervisor Application Viewer Component
const SupervisorApplicationViewer: React.FC<ApplicationViewerProps> = ({ applicationData }) => (
  <Card className="mb-3">
    <Card.Header>
      <h6 className="mb-0">
        <i className="fa-solid fa-user-tie me-2"></i>
        Supervisor Application Details
      </h6>
    </Card.Header>
    <Card.Body>
      {applicationData.applicantDetails ? (
        <Row>
          <Col md={6}>
            <div className="mb-3">
              <strong>Supervisor Name:</strong><br />
              <span>{applicationData.applicantDetails.supervisorName}</span>
            </div>
            <div className="mb-3">
              <strong>Father's Name:</strong><br />
              <span>{applicationData.applicantDetails.fatherName}</span>
            </div>
            <div className="mb-3">
              <strong>Date of Birth:</strong><br />
              <span>{new Date(applicationData.applicantDetails.dateOfBirth).toLocaleDateString()}</span>
            </div>
          </Col>
          <Col md={6}>
            <div className="mb-3">
              <strong>Experience:</strong><br />
              <span>{applicationData.applicantDetails.experience} years</span>
            </div>
            <div className="mb-3">
              <strong>Email:</strong><br />
              <span>{applicationData.applicantDetails.email}</span>
            </div>
            <div className="mb-3">
              <strong>Mobile:</strong><br />
              <span>{applicationData.applicantDetails.mobileNo}</span>
            </div>
          </Col>
        </Row>
      ) : (
        <div className="text-center text-muted">
          <Spinner animation="border" size="sm" className="me-2" />
          Loading supervisor details...
        </div>
      )}
    </Card.Body>
  </Card>
);

// Wireman Application Viewer Component
const WiremanApplicationViewer: React.FC<ApplicationViewerProps> = ({ applicationData }) => (
  <Card className="mb-3">
    <Card.Header>
      <h6 className="mb-0">
        <i className="fa-solid fa-hard-hat me-2"></i>
        Wireman Application Details
      </h6>
    </Card.Header>
    <Card.Body>
      {applicationData.applicantDetails ? (
        <Row>
          <Col md={6}>
            <div className="mb-3">
              <strong>Wireman Name:</strong><br />
              <span>{applicationData.applicantDetails.wiremanName}</span>
            </div>
            <div className="mb-3">
              <strong>Father's Name:</strong><br />
              <span>{applicationData.applicantDetails.fatherName}</span>
            </div>
            <div className="mb-3">
              <strong>Date of Birth:</strong><br />
              <span>{new Date(applicationData.applicantDetails.dateOfBirth).toLocaleDateString()}</span>
            </div>
          </Col>
          <Col md={6}>
            <div className="mb-3">
              <strong>Training Certificate:</strong><br />
              <span>{applicationData.applicantDetails.trainingCertificate || 'N/A'}</span>
            </div>
            <div className="mb-3">
              <strong>Email:</strong><br />
              <span>{applicationData.applicantDetails.email}</span>
            </div>
            <div className="mb-3">
              <strong>Mobile:</strong><br />
              <span>{applicationData.applicantDetails.mobileNo}</span>
            </div>
          </Col>
        </Row>
      ) : (
        <div className="text-center text-muted">
          <Spinner animation="border" size="sm" className="me-2" />
          Loading wireman details...
        </div>
      )}
    </Card.Body>
  </Card>
);

// Attachments Viewer Component
const AttachmentsViewer: React.FC<{ attachments: any[] }> = ({ attachments }) => (
  <Card className="mb-3">
    <Card.Header>
      <h6 className="mb-0">
        <i className="fa-solid fa-paperclip me-2"></i>
        Attachments & Documents
      </h6>
    </Card.Header>
    <Card.Body>
      {attachments && attachments.length > 0 ? (
        <div className="list-group">
          {attachments.map((attachment, index) => (
            <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <i className="fa-solid fa-file-pdf me-2 text-danger"></i>
                <strong>{attachment.documentType}</strong><br />
                <small className="text-muted">{attachment.fileName}</small>
              </div>
              <div>
                <Badge bg="success" className="me-2">Uploaded</Badge>
                <Button variant="outline-primary" size="sm" onClick={() => window.open(attachment.fileUrl, '_blank')}>
                  <i className="fa-solid fa-download me-1"></i>
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted">No attachments available</div>
      )}
    </Card.Body>
  </Card>
);

// Main ViewApplication Component
const ViewApplication: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // State management
  const [applicationData, setApplicationData] = useState<ViewApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('application');

  // Extract parameters from URL
  const appRefId = parseInt(searchParams.get('appRefId') || '0');
  const applicationType = parseInt(searchParams.get('applicationType') || '6');
  const projectSiteId = parseInt(searchParams.get('projectSiteRefId') || '0');
  const applicationPurposeType = parseInt(searchParams.get('applicationPurposeType') || '1');

  // Load application data on component mount
  useEffect(() => {
    if (appRefId && applicationType) {
      loadApplicationData();
    } else {
      setError('Invalid application parameters');
      setLoading(false);
    }
  }, [appRefId, applicationType]);

  // Load application data from API
  const loadApplicationData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 [VIEW-APPLICATION] Loading application data:', {
        appRefId,
        applicationType,
        projectSiteId,
        applicationPurposeType
      });

      const response = await axiosInterceptor.get('/Application/getApplicationDetails', {
        params: {
          appRefId,
          applicationType,
          projectSiteId: projectSiteId || 0,
          applicationPurposeType: applicationPurposeType || 1
        }
      });

      if (response.success && response.data) {
        setApplicationData((response.data as any)?.data);
        console.log('✅ [VIEW-APPLICATION] Application data loaded successfully');
      } else {
        setError('Application not found or access denied');
      }
    } catch (err: any) {
      console.error('❌ [VIEW-APPLICATION] Error loading application data:', err);
      setError(err.message || 'Failed to load application data');
    } finally {
      setLoading(false);
    }
  };

  // Get application type label
  const getApplicationTypeLabel = (type: number): string => {
    switch (type) {
      case ApplicationType.CONTRACTOR:
        return 'Contractor';
      case ApplicationType.SUPERVISOR:
        return 'Supervisor';
      case ApplicationType.WIREMAN:
        return 'Wireman';
      default:
        return 'Unknown';
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string): string => {
    const statusColors: { [key: string]: string } = {
      'approved': 'success',
      'rejected': 'danger',
      'under review': 'warning',
      'pending': 'secondary',
      'correction required': 'info',
      'submitted': 'primary'
    };
    return statusColors[status.toLowerCase()] || 'secondary';
  };

  // Render application viewer based on type
  const renderApplicationViewer = () => {
    if (!applicationData) return null;

    const props = { applicationData };

    switch (applicationData.applicationType) {
      case ApplicationType.CONTRACTOR:
        return <ContractorApplicationViewer {...props} />;
      case ApplicationType.SUPERVISOR:
        return <SupervisorApplicationViewer {...props} />;
      case ApplicationType.WIREMAN:
        return <WiremanApplicationViewer {...props} />;
      default:
        return (
          <Alert variant="warning">
            <i className="fa-solid fa-exclamation-triangle me-2"></i>
            Unsupported application type: {applicationData.applicationType}
          </Alert>
        );
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <Spinner animation="border" className="me-2" />
          Loading application details...
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <i className="fa-solid fa-exclamation-circle me-2"></i>
          {error}
        </Alert>
        <Button variant="outline-secondary" onClick={handleBack}>
          <i className="fa-solid fa-arrow-left me-2"></i>
          Back
        </Button>
      </Container>
    );
  }

  return (
    <Container className="mt-4" style={{ fontSize: '0.8rem' }}>
      {applicationData && (
        <>
          {/* Application Header */}
          <Card className="mb-4 shadow-lg">
            <Card.Body>
              <Row className="align-items-center">
                <Col md={8}>
                  <h4 className="mb-2">
                    <i className="fa-solid fa-file-text me-2"></i>
                    {getApplicationTypeLabel(applicationData.applicationType)} Application
                  </h4>
                  <div className="d-flex flex-wrap gap-3">
                    <div>
                      <strong>Application ID:</strong> {applicationData.appRefId}
                    </div>
                    <div>
                      <strong>Status:</strong>{' '}
                      <Badge bg={getStatusBadgeColor(applicationData.currentStatus)}>
                        {applicationData.currentStatus}
                      </Badge>
                    </div>
                    <div>
                      <strong>Submitted:</strong> {new Date(applicationData.submittedDate).toLocaleDateString()}
                    </div>
                  </div>
                </Col>
                <Col md={4} className="text-end">
                  <Button variant="outline-secondary" onClick={handleBack}>
                    <i className="fa-solid fa-arrow-left me-2"></i>
                    Back
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Tabbed Content */}
          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'application')}>
            <Card className="shadow-lg">
              <Card.Header>
                <Nav variant="tabs">
                  <Nav.Item>
                    <Nav.Link eventKey="application">
                      <i className="fa-solid fa-user me-2"></i>
                      Application Details
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="attachments">
                      <i className="fa-solid fa-paperclip me-2"></i>
                      Attachments ({applicationData.attachments?.length || 0})
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="history">
                      <i className="fa-solid fa-history me-2"></i>
                      Processing History
                    </Nav.Link>
                  </Nav.Item>
                  {applicationData.licenseDetails && (
                    <Nav.Item>
                      <Nav.Link eventKey="license">
                        <i className="fa-solid fa-certificate me-2"></i>
                        License Details
                      </Nav.Link>
                    </Nav.Item>
                  )}
                </Nav>
              </Card.Header>

              <Card.Body>
                <Tab.Content>
                  <Tab.Pane eventKey="application">
                    {renderApplicationViewer()}
                  </Tab.Pane>

                  <Tab.Pane eventKey="attachments">
                    <AttachmentsViewer 
                      attachments={applicationData.attachments || []} 
                    />
                  </Tab.Pane>

                  <Tab.Pane eventKey="history">
                    <Card>
                      <Card.Header>
                        <h6 className="mb-0">
                          <i className="fa-solid fa-timeline me-2"></i>
                          Processing Timeline
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        {applicationData.processingHistory && applicationData.processingHistory.length > 0 ? (
                          <div className="timeline">
                            {applicationData.processingHistory.map((history, index) => (
                              <div key={index} className="timeline-item mb-3 p-3 border-start border-3 border-primary">
                                <div className="d-flex justify-content-between">
                                  <strong>{history.actionType}</strong>
                                  <small className="text-muted">{new Date(history.actionDate).toLocaleDateString()}</small>
                                </div>
                                <div className="mt-1">
                                  <Badge bg={getStatusBadgeColor(history.status)} className="me-2">
                                    {history.status}
                                  </Badge>
                                  <span className="text-muted">by {history.processedBy}</span>
                                </div>
                                {history.comments && (
                                  <div className="mt-2 text-muted">
                                    <i className="fa-solid fa-quote-left me-1"></i>
                                    {history.comments}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-muted">No processing history available</div>
                        )}
                      </Card.Body>
                    </Card>
                  </Tab.Pane>

                  {applicationData.licenseDetails && (
                    <Tab.Pane eventKey="license">
                      <Card>
                        <Card.Header>
                          <h6 className="mb-0">
                            <i className="fa-solid fa-award me-2"></i>
                            License Information
                          </h6>
                        </Card.Header>
                        <Card.Body>
                          <Row>
                            <Col md={6}>
                              <div className="mb-3">
                                <strong>License Number:</strong><br />
                                <span className="font-monospace">{applicationData.licenseDetails.licenseNumber}</span>
                              </div>
                              <div className="mb-3">
                                <strong>Issued Date:</strong><br />
                                <span>{new Date(applicationData.licenseDetails.issuedDate).toLocaleDateString()}</span>
                              </div>
                            </Col>
                            <Col md={6}>
                              <div className="mb-3">
                                <strong>Valid Until:</strong><br />
                                <span>{new Date(applicationData.licenseDetails.validUntil).toLocaleDateString()}</span>
                              </div>
                              <div className="mb-3">
                                <strong>License Status:</strong><br />
                                <Badge bg={applicationData.licenseDetails.isActive ? 'success' : 'danger'}>
                                  {applicationData.licenseDetails.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Tab.Pane>
                  )}
                </Tab.Content>
              </Card.Body>
            </Card>
          </Tab.Container>
        </>
      )}
    </Container>
  );
};

export default ViewApplication;