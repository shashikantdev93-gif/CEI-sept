import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Row, Col, Spinner, Button, Badge, Alert, Table, Modal, Form } from 'react-bootstrap';
import { paymentApiService } from '../../services/paymentApiService';
import { useUserRole } from '../../hooks/useUserRole';

interface PaymentDetails {
  id: string;
  applicationId: string;
  applicantId: string;
  applicantName: string;
  paymentType: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDate: string;
  paymentMode: 'online' | 'offline' | 'cheque' | 'dd';
  transactionId?: string;
  gatewayProvider?: string;
  gatewayResponse?: string;
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
  verificationRemarks?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  refundDetails?: {
    refundId: string;
    refundAmount: number;
    refundReason: string;
    refundStatus: string;
    refundInitiatedAt: string;
    refundCompletedAt?: string;
  };
  auditTrail?: Array<{
    action: string;
    performedBy: string;
    performedAt: string;
    remarks?: string;
  }>;
}

interface PaymentDetailsPageProps {
  // Add any props if needed
}

export const PaymentDetailsPage: React.FC<PaymentDetailsPageProps> = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const { isAdmin, isOfficer } = useUserRole();

  // State Management
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Modal State
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusRemarks, setStatusRemarks] = useState<string>('');
  const [refundReason, setRefundReason] = useState<string>('');

  // Services (using singleton)

  useEffect(() => {
    if (!paymentId) {
      toast.error('Invalid payment ID');
      navigate('/dashboard/payments');
      return;
    }

    loadPaymentDetails();
  }, [paymentId, navigate]);

  const loadPaymentDetails = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await paymentApiService.getPaymentDetails(paymentId!);
      
      if (response?.formModel) {
        setPaymentDetails(response.formModel);
      } else {
        setError('Payment details not found');
      }
    } catch (error) {
      console.error('Error loading payment details:', error);
      setError('Failed to load payment details');
      toast.error('Failed to load payment details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!paymentDetails || !newStatus) return;

    try {
      setIsLoading(true);
      await paymentApiService.updatePaymentStatus(paymentDetails.id, newStatus as any, statusRemarks);
      toast.success('Payment status updated successfully');
      setShowUpdateStatusModal(false);
      setNewStatus('');
      setStatusRemarks('');
      // Reload payment details
      await loadPaymentDetails();
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiateRefund = async () => {
    if (!paymentDetails || !refundReason.trim()) {
      toast.error('Please provide a reason for the refund');
      return;
    }

    try {
      setIsLoading(true);
      await paymentApiService.initiateRefund(paymentDetails.id, refundReason);
      toast.success('Refund initiated successfully');
      setShowRefundModal(false);
      setRefundReason('');
      // Reload payment details
      await loadPaymentDetails();
    } catch (error) {
      console.error('Error initiating refund:', error);
      toast.error('Failed to initiate refund');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!paymentDetails) return;

    try {
      setIsLoading(true);
      const receiptBlob = await paymentApiService.getPaymentReceipt(paymentDetails.id, 'pdf');
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([receiptBlob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payment-receipt-${paymentDetails.transactionId || paymentDetails.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'completed':
        return 'success';
      case 'failed':
        return 'danger';
      case 'refunded':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const getPaymentModeBadgeClass = (mode: string): string => {
    switch (mode?.toLowerCase()) {
      case 'online':
        return 'primary';
      case 'offline':
        return 'secondary';
      case 'cheque':
        return 'info';
      case 'dd':
        return 'success';
      default:
        return 'light';
    }
  };

  if (isLoading && !paymentDetails) {
    return (
      <div className="container-fluid">
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading payment details...</span>
          </Spinner>
          <p className="mt-2 text-muted">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error || !paymentDetails) {
    return (
      <div className="container-fluid">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error || 'Payment details not found'}</p>
          <Button variant="outline-danger" onClick={() => navigate('/dashboard/payments')}>
            Back to Payments
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="page-title">Payment Details</h2>
          <p className="text-muted mb-0">
            Transaction ID: {paymentDetails.transactionId || paymentDetails.id}
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-secondary" 
            size="sm" 
            onClick={() => navigate('/dashboard/payments')}
          >
            <i className="bx bx-arrow-back me-1"></i>
            Back to Payments
          </Button>
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={handleDownloadReceipt}
            disabled={isLoading}
          >
            <i className="bx bx-download me-1"></i>
            Download Receipt
          </Button>
          {(isAdmin() || isOfficer()) && (
            <>
              <Button 
                variant="outline-warning" 
                size="sm" 
                onClick={() => setShowUpdateStatusModal(true)}
                disabled={isLoading}
              >
                <i className="bx bx-edit me-1"></i>
                Update Status
              </Button>
              {paymentDetails.status === 'completed' && isAdmin() && (
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  onClick={() => setShowRefundModal(true)}
                  disabled={isLoading}
                >
                  <i className="bx bx-undo me-1"></i>
                  Initiate Refund
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <Row>
        <Col lg={8}>
          {/* Basic Payment Information */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="card-title mb-0">Payment Information</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Transaction ID</label>
                    <p className="mb-0 font-monospace">{paymentDetails.transactionId || 'N/A'}</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Applicant Name</label>
                    <p className="mb-0">{paymentDetails.applicantName}</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Payment Type</label>
                    <p className="mb-0">{paymentDetails.paymentType}</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Amount</label>
                    <p className="mb-0 fw-bold text-success">
                      ₹{paymentDetails.amount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Payment Date</label>
                    <p className="mb-0">{new Date(paymentDetails.paymentDate).toLocaleString()}</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Payment Mode</label>
                    <p className="mb-0">
                      <Badge bg={getPaymentModeBadgeClass(paymentDetails.paymentMode)}>
                        {paymentDetails.paymentMode.toUpperCase()}
                      </Badge>
                    </p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Status</label>
                    <p className="mb-0">
                      <Badge bg={getStatusBadgeClass(paymentDetails.status)} className="fs-6">
                        {paymentDetails.status.toUpperCase()}
                      </Badge>
                    </p>
                  </div>
                  {paymentDetails.gatewayProvider && (
                    <div className="mb-3">
                      <label className="form-label fw-bold">Gateway Provider</label>
                      <p className="mb-0">{paymentDetails.gatewayProvider.toUpperCase()}</p>
                    </div>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Payment Method Specific Details */}
          {(paymentDetails.chequeDetails || paymentDetails.ddDetails) && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="card-title mb-0">Payment Method Details</h5>
              </Card.Header>
              <Card.Body>
                {paymentDetails.chequeDetails && (
                  <Row>
                    <Col md={4}>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Cheque Number</label>
                        <p className="mb-0">{paymentDetails.chequeDetails.chequeNumber}</p>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Bank Name</label>
                        <p className="mb-0">{paymentDetails.chequeDetails.bankName}</p>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Cheque Date</label>
                        <p className="mb-0">{new Date(paymentDetails.chequeDetails.chequeDate).toLocaleDateString()}</p>
                      </div>
                    </Col>
                  </Row>
                )}
                
                {paymentDetails.ddDetails && (
                  <Row>
                    <Col md={4}>
                      <div className="mb-3">
                        <label className="form-label fw-bold">DD Number</label>
                        <p className="mb-0">{paymentDetails.ddDetails.ddNumber}</p>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Bank Name</label>
                        <p className="mb-0">{paymentDetails.ddDetails.bankName}</p>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="mb-3">
                        <label className="form-label fw-bold">DD Date</label>
                        <p className="mb-0">{new Date(paymentDetails.ddDetails.ddDate).toLocaleDateString()}</p>
                      </div>
                    </Col>
                  </Row>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Gateway Response */}
          {paymentDetails.gatewayResponse && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="card-title mb-0">Gateway Response</h5>
              </Card.Header>
              <Card.Body>
                <pre className="bg-light p-3 rounded">
                  {JSON.stringify(JSON.parse(paymentDetails.gatewayResponse), null, 2)}
                </pre>
              </Card.Body>
            </Card>
          )}

          {/* Audit Trail */}
          {paymentDetails.auditTrail && paymentDetails.auditTrail.length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="card-title mb-0">Audit Trail</h5>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table striped>
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th>Performed By</th>
                        <th>Date & Time</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentDetails.auditTrail.map((trail, index) => (
                        <tr key={index}>
                          <td>{trail.action}</td>
                          <td>{trail.performedBy}</td>
                          <td>{new Date(trail.performedAt).toLocaleString()}</td>
                          <td>{trail.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col lg={4}>
          {/* Verification Details */}
          {(paymentDetails.verificationRemarks || paymentDetails.verifiedBy) && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="card-title mb-0">Verification Details</h5>
              </Card.Header>
              <Card.Body>
                {paymentDetails.verifiedBy && (
                  <div className="mb-3">
                    <label className="form-label fw-bold">Verified By</label>
                    <p className="mb-0">{paymentDetails.verifiedBy}</p>
                  </div>
                )}
                {paymentDetails.verifiedAt && (
                  <div className="mb-3">
                    <label className="form-label fw-bold">Verified At</label>
                    <p className="mb-0">{new Date(paymentDetails.verifiedAt).toLocaleString()}</p>
                  </div>
                )}
                {paymentDetails.verificationRemarks && (
                  <div className="mb-3">
                    <label className="form-label fw-bold">Verification Remarks</label>
                    <p className="mb-0">{paymentDetails.verificationRemarks}</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Refund Details */}
          {paymentDetails.refundDetails && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="card-title mb-0">Refund Details</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <label className="form-label fw-bold">Refund ID</label>
                  <p className="mb-0 font-monospace">{paymentDetails.refundDetails.refundId}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Refund Amount</label>
                  <p className="mb-0 fw-bold">₹{paymentDetails.refundDetails.refundAmount.toLocaleString('en-IN')}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Refund Reason</label>
                  <p className="mb-0">{paymentDetails.refundDetails.refundReason}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Refund Status</label>
                  <p className="mb-0">
                    <Badge bg={getStatusBadgeClass(paymentDetails.refundDetails.refundStatus)}>
                      {paymentDetails.refundDetails.refundStatus.toUpperCase()}
                    </Badge>
                  </p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Initiated At</label>
                  <p className="mb-0">{new Date(paymentDetails.refundDetails.refundInitiatedAt).toLocaleString()}</p>
                </div>
                {paymentDetails.refundDetails.refundCompletedAt && (
                  <div className="mb-3">
                    <label className="form-label fw-bold">Completed At</label>
                    <p className="mb-0">{new Date(paymentDetails.refundDetails.refundCompletedAt).toLocaleString()}</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Application Link */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="card-title mb-0">Related Application</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <label className="form-label fw-bold">Application ID</label>
                <p className="mb-0 font-monospace">{paymentDetails.applicationId}</p>
              </div>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => navigate(`/dashboard/application/${paymentDetails.applicationId}`)}
              >
                <i className="bx bx-link-external me-1"></i>
                View Application
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Update Status Modal */}
      <Modal show={showUpdateStatusModal} onHide={() => setShowUpdateStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Payment Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>New Status</Form.Label>
            <Form.Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              <option value="">Select status...</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Remarks</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter remarks for status update..."
              value={statusRemarks}
              onChange={(e) => setStatusRemarks(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateStatusModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateStatus}
            disabled={!newStatus || isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Status'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Initiate Refund Modal */}
      <Modal show={showRefundModal} onHide={() => setShowRefundModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Initiate Refund</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <i className="bx bx-warning-alt me-2"></i>
            This action will initiate a refund for the payment amount of ₹{paymentDetails.amount.toLocaleString('en-IN')}
          </Alert>
          <Form.Group className="mb-3">
            <Form.Label>Refund Reason <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter reason for refund..."
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRefundModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleInitiateRefund}
            disabled={!refundReason.trim() || isLoading}
          >
            {isLoading ? 'Processing...' : 'Initiate Refund'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PaymentDetailsPage;