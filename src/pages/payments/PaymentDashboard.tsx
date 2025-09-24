import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Row, Col, Table, Spinner, Form, Button, Pagination, Badge, Modal, Alert } from 'react-bootstrap';
import { useUserRole } from '../../hooks/useUserRole';
import { PaymentApiService } from '../../services/paymentApiService';

interface PaymentDashboardCountData {
  pendingPayments: number;
  completedPayments: number;
  failedPayments: number;
  totalAmount: number;
  pendingAmount: number;
}

interface PaymentItem {
  id: string;
  applicationId: string;
  applicantName: string;
  paymentType: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDate: string;
  paymentMode: 'online' | 'offline' | 'cheque' | 'dd';
  transactionId?: string;
  gatewayResponse?: string;
}

interface PaymentDashboardProps {
  // Add any props if needed
}

export const PaymentDashboard: React.FC<PaymentDashboardProps> = () => {
  const navigate = useNavigate();
  const { roleName, getUserId, isAdmin, isOfficer } = useUserRole();
  
  // State Management
  const [dashboardCountData, setDashboardCountData] = useState<PaymentDashboardCountData | null>(null);
  const [paymentsData, setPaymentsData] = useState<PaymentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Modal State
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);
  const [verificationRemarks, setVerificationRemarks] = useState<string>('');
  
  // Table Management
  const [tableTitle, setTableTitle] = useState<string>('Pending Payments');
  const [paymentStatus, setPaymentStatus] = useState<string>('pending');
  
  // Search, Sort, Pagination
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Services
  const paymentApiService = new PaymentApiService();
  
  useEffect(() => {
    // Check if user has payment access
    if (!isAdmin() && !isOfficer()) {
      toast.error('Access denied. Admin or Officer privileges required for payment management.');
      navigate('/dashboard');
      return;
    }
    
    initializeDashboard();
  }, [roleName, navigate]);

  useEffect(() => {
    if (isAdmin() || isOfficer()) {
      getPaymentsData();
    }
  }, [currentPage, paymentStatus, searchTerm, sortField, sortDirection]);

  const initializeDashboard = async () => {
    try {
      setIsLoading(true);
      await getPaymentCounts();
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      setError('Failed to load payment data');
      toast.error('Failed to load payment data');
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentCounts = async () => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User ID not found');
      }
      const response = await paymentApiService.getPaymentDashboardCounts(userId);
      
      if (response?.formModel) {
        setDashboardCountData(response.formModel);
        setTotalItemsCount(response.formModel);
      }
    } catch (error) {
      console.error('Error fetching payment counts:', error);
      throw error;
    }
  };

  const getPaymentsData = async () => {
    try {
      setIsLoading(true);
      const userId = getUserId();
      if (!userId) {
        throw new Error('User ID not found');
      }

      const params = {
        userId,
        status: paymentStatus,
        pageNumber: currentPage,
        pageSize: itemsPerPage,
        searchTerm: searchTerm || '',
        sortField: sortField || '',
        sortDirection: sortDirection || 'asc'
      };

      const response = await paymentApiService.getPaymentsData(params);
      
      if (response?.formModel) {
        setPaymentsData(response.formModel);
        setTotalItems(response.totalCount || 0);
        setTotalPages(Math.ceil((response.totalCount || 0) / itemsPerPage));
      }
    } catch (error) {
      console.error('Error fetching payments data:', error);
      setError('Failed to load payments data');
      toast.error('Failed to load payments data');
    } finally {
      setIsLoading(false);
    }
  };

  const setTotalItemsCount = (countData: PaymentDashboardCountData) => {
    let count = 0;
    switch (paymentStatus) {
      case 'pending':
        count = countData.pendingPayments || 0;
        break;
      case 'completed':
        count = countData.completedPayments || 0;
        break;
      case 'failed':
        count = countData.failedPayments || 0;
        break;
      default:
        count = countData.pendingPayments || 0;
    }
    setTotalItems(count);
    setTotalPages(Math.ceil(count / itemsPerPage));
  };

  const handleStatusFilter = (title: string, status: string) => {
    setTableTitle(title);
    setPaymentStatus(status);
    setCurrentPage(1);
    setPaymentsData([]);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleVerifyPayment = (payment: PaymentItem) => {
    setSelectedPayment(payment);
    setShowVerificationModal(true);
  };

  const processPaymentVerification = async (action: 'approve' | 'reject') => {
    if (!selectedPayment) return;

    try {
      setIsLoading(true);
      await paymentApiService.verifyPayment(selectedPayment.id, action, verificationRemarks);
      toast.success(`Payment ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      setShowVerificationModal(false);
      setSelectedPayment(null);
      setVerificationRemarks('');
      // Refresh data
      getPaymentsData();
      getPaymentCounts();
    } catch (error) {
      console.error('Error processing payment verification:', error);
      toast.error('Failed to process payment verification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefundPayment = async (paymentId: string) => {
    if (!window.confirm('Are you sure you want to initiate a refund for this payment?')) {
      return;
    }

    try {
      setIsLoading(true);
      await paymentApiService.initiateRefund(paymentId, 'Admin initiated refund');
      toast.success('Refund initiated successfully');
      // Refresh data
      getPaymentsData();
      getPaymentCounts();
    } catch (error) {
      console.error('Error initiating refund:', error);
      toast.error('Failed to initiate refund');
    } finally {
      setIsLoading(false);
    }
  };

  const renderDashboardCards = () => {
    if (!dashboardCountData) return null;

    const cards = [
      {
        title: 'Pending Payments',
        count: dashboardCountData.pendingPayments,
        amount: dashboardCountData.pendingAmount,
        icon: 'bx bx-time-five',
        bgColor: 'bg-warning',
        textColor: 'text-white',
        onClick: () => handleStatusFilter('Pending Payments', 'pending')
      },
      {
        title: 'Completed Payments',
        count: dashboardCountData.completedPayments,
        icon: 'bx bx-check-circle',
        bgColor: 'bg-success',
        textColor: 'text-white',
        onClick: () => handleStatusFilter('Completed Payments', 'completed')
      },
      {
        title: 'Failed Payments',
        count: dashboardCountData.failedPayments,
        icon: 'bx bx-x-circle',
        bgColor: 'bg-danger',
        textColor: 'text-white',
        onClick: () => handleStatusFilter('Failed Payments', 'failed')
      },
      {
        title: 'Total Amount',
        count: `₹${(dashboardCountData.totalAmount || 0).toLocaleString('en-IN')}`,
        icon: 'bx bx-rupee',
        bgColor: 'bg-info',
        textColor: 'text-white',
        onClick: () => {}
      }
    ];

    return (
      <Row className="mb-4">
        {cards.map((card, index) => (
          <Col xl={3} lg={6} md={6} sm={12} key={index} className="mb-3">
            <Card 
              className={`${card.bgColor} ${card.textColor} h-100 cursor-pointer`}
              onClick={card.onClick}
            >
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h6 className="card-title mb-1">{card.title}</h6>
                    <h3 className="mb-0">{card.count || 0}</h3>
                    {card.amount && (
                      <small>Amount: ₹{card.amount.toLocaleString('en-IN')}</small>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <i className={`${card.icon} fs-2`}></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  const renderSearchAndFilters = () => (
    <Row className="mb-3">
      <Col md={6}>
        <Form.Group>
          <Form.Control
            type="text"
            placeholder="Search payments by transaction ID, applicant name..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </Form.Group>
      </Col>
      <Col md={6} className="text-end">
        <span className="text-muted">
          Showing {paymentsData.length} of {totalItems} results
        </span>
      </Col>
    </Row>
  );

  const renderDataTable = () => {
    if (isLoading) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      );
    }

    if (paymentsData.length === 0) {
      return (
        <div className="text-center py-5">
          <p className="text-muted">No payments found for {tableTitle.toLowerCase()}</p>
        </div>
      );
    }

    return (
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead className="table-dark">
            <tr>
              <th 
                className="cursor-pointer"
                onClick={() => handleSort('transactionId')}
              >
                Transaction ID
                {sortField === 'transactionId' && (
                  <i className={`ms-1 bx bx-${sortDirection === 'asc' ? 'up' : 'down'}-arrow-alt`}></i>
                )}
              </th>
              <th 
                className="cursor-pointer"
                onClick={() => handleSort('applicantName')}
              >
                Applicant Name
                {sortField === 'applicantName' && (
                  <i className={`ms-1 bx bx-${sortDirection === 'asc' ? 'up' : 'down'}-arrow-alt`}></i>
                )}
              </th>
              <th 
                className="cursor-pointer"
                onClick={() => handleSort('paymentType')}
              >
                Payment Type
                {sortField === 'paymentType' && (
                  <i className={`ms-1 bx bx-${sortDirection === 'asc' ? 'up' : 'down'}-arrow-alt`}></i>
                )}
              </th>
              <th 
                className="cursor-pointer"
                onClick={() => handleSort('amount')}
              >
                Amount
                {sortField === 'amount' && (
                  <i className={`ms-1 bx bx-${sortDirection === 'asc' ? 'up' : 'down'}-arrow-alt`}></i>
                )}
              </th>
              <th 
                className="cursor-pointer"
                onClick={() => handleSort('paymentDate')}
              >
                Payment Date
                {sortField === 'paymentDate' && (
                  <i className={`ms-1 bx bx-${sortDirection === 'asc' ? 'up' : 'down'}-arrow-alt`}></i>
                )}
              </th>
              <th>Payment Mode</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paymentsData.map((item, index) => (
              <tr key={item.id || index}>
                <td className="font-monospace">{item.transactionId || 'N/A'}</td>
                <td>{item.applicantName}</td>
                <td>{item.paymentType}</td>
                <td className="fw-bold">₹{item.amount.toLocaleString('en-IN')}</td>
                <td>{new Date(item.paymentDate).toLocaleDateString()}</td>
                <td>
                  <Badge bg={getPaymentModeBadgeClass(item.paymentMode)}>
                    {item.paymentMode.toUpperCase()}
                  </Badge>
                </td>
                <td>
                  <Badge bg={getStatusBadgeClass(item.status)}>
                    {item.status.toUpperCase()}
                  </Badge>
                </td>
                <td>
                  <div className="d-flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline-primary"
                      onClick={() => handleViewPayment(item)}
                    >
                      View
                    </Button>
                    {item.status === 'pending' && isAdmin() && (
                      <Button 
                        size="sm" 
                        variant="outline-success"
                        onClick={() => handleVerifyPayment(item)}
                      >
                        Verify
                      </Button>
                    )}
                    {item.status === 'completed' && isAdmin() && (
                      <Button 
                        size="sm" 
                        variant="outline-warning"
                        onClick={() => handleRefundPayment(item.id)}
                      >
                        Refund
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const items = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    return (
      <div className="d-flex justify-content-center mt-4">
        <Pagination>
          <Pagination.First 
            disabled={currentPage === 1}
            onClick={() => handlePageChange(1)}
          />
          <Pagination.Prev 
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          />
          {items}
          <Pagination.Next 
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          />
          <Pagination.Last 
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(totalPages)}
          />
        </Pagination>
      </div>
    );
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

  const handleViewPayment = (item: PaymentItem) => {
    navigate(`/dashboard/payments/payment/${item.id}`);
  };

  if (!isAdmin() && !isOfficer()) {
    return null;
  }

  return (
    <div className="container-fluid">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="page-title">Payment Management</h2>
          <p className="text-muted mb-0">Monitor and manage payment transactions</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" size="sm">
            <i className="bx bx-download me-1"></i>
            Export
          </Button>
          <Button variant="outline-secondary" size="sm" onClick={() => window.location.reload()}>
            <i className="bx bx-refresh me-1"></i>
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Dashboard Cards */}
      {renderDashboardCards()}

      {/* Data Table Section */}
      <Card>
        <Card.Header>
          <h5 className="card-title mb-0">{tableTitle}</h5>
        </Card.Header>
        <Card.Body>
          {renderSearchAndFilters()}
          {renderDataTable()}
          {renderPagination()}
        </Card.Body>
      </Card>

      {/* Payment Verification Modal */}
      <Modal show={showVerificationModal} onHide={() => setShowVerificationModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Payment Verification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayment && (
            <div>
              <Row>
                <Col md={6}>
                  <p><strong>Transaction ID:</strong> {selectedPayment.transactionId}</p>
                  <p><strong>Applicant:</strong> {selectedPayment.applicantName}</p>
                  <p><strong>Payment Type:</strong> {selectedPayment.paymentType}</p>
                  <p><strong>Amount:</strong> ₹{selectedPayment.amount.toLocaleString('en-IN')}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Payment Date:</strong> {new Date(selectedPayment.paymentDate).toLocaleString()}</p>
                  <p><strong>Payment Mode:</strong> {selectedPayment.paymentMode}</p>
                  <p><strong>Current Status:</strong> {selectedPayment.status}</p>
                  {selectedPayment.gatewayResponse && (
                    <p><strong>Gateway Response:</strong> {selectedPayment.gatewayResponse}</p>
                  )}
                </Col>
              </Row>
              <hr />
              <Form.Group className="mb-3">
                <Form.Label>Verification Remarks</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter verification remarks..."
                  value={verificationRemarks}
                  onChange={(e) => setVerificationRemarks(e.target.value)}
                />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowVerificationModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={() => processPaymentVerification('reject')}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Reject Payment'}
          </Button>
          <Button 
            variant="success" 
            onClick={() => processPaymentVerification('approve')}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Approve Payment'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PaymentDashboard;