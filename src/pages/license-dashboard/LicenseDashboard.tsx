import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Row, Col, Table, Spinner, Form, Button, Pagination, Badge, Modal } from 'react-bootstrap';
import { useUserRole } from '../../hooks/useUserRole';
import { ProjectSiteDataMapper } from '../../lib/project-site-data-mapper';
import { licenseApiService } from '../../services/licenseApiService';

interface LicenseDashboardCountData {
  activeCount: number;
  expiredCount: number;
  renewalPendingCount: number;
  newApplicationsCount: number;
  totalLicensesCount: number;
}

interface LicenseDashboardItem {
  id: string;
  licenseType: string;
  applicationDate: string;
  status: string;
  applicantName: string;
  expiryDate: string;
  renewalRequired: boolean;
  licenseNumber?: string;
  contractorCategory?: string;
}

interface LicenseDashboardProps {
  // Add any props if needed
}

export const LicenseDashboard: React.FC<LicenseDashboardProps> = () => {
  const navigate = useNavigate();
  const { roleName, getUserId, hasRole } = useUserRole();
  
  // State Management
  const [dashboardCountData, setDashboardCountData] = useState<LicenseDashboardCountData | null>(null);
  const [licenseDashboardData, setLicenseDashboardData] = useState<LicenseDashboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Modal State
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<LicenseDashboardItem | null>(null);
  
  // Table Management
  const [tableTitle, setTableTitle] = useState<string>('Active Licenses');
  const [dashboardNameType, setDashboardNameType] = useState<string>('Active');
  
  // Search, Sort, Pagination
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Services
  // Using licenseApiService singleton
  
  useEffect(() => {
    // Check if user has license board role
    if (!hasRole('LICS')) {
      toast.error('Access denied. License Board privileges required.');
      navigate('/dashboard');
      return;
    }
    
    initializeDashboard();
  }, [roleName, navigate]);

  useEffect(() => {
    if (hasRole('LICS')) {
      getLicenseDashboardData();
    }
  }, [currentPage, dashboardNameType, searchTerm, sortField, sortDirection]);

  const initializeDashboard = async () => {
    try {
      setIsLoading(true);
      await getDashboardCountData();
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getDashboardCountData = async () => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User ID not found');
      }
      const response = await licenseApiService.getLicenseDashboardCounts(userId);
      
      if (response?.formModel) {
        setDashboardCountData(response.formModel);
        setTotalItemsCount(response.formModel);
      }
    } catch (error) {
      console.error('Error fetching dashboard count:', error);
      throw error;
    }
  };

  const getLicenseDashboardData = async () => {
    try {
      setIsLoading(true);
      const userId = getUserId();
      if (!userId) {
        throw new Error('User ID not found');
      }

      const params = {
        userId,
        dashboardNameType,
        pageNumber: currentPage,
        pageSize: itemsPerPage,
        searchTerm: searchTerm || '',
        sortField: sortField || '',
        sortDirection: sortDirection || 'asc'
      };

      const response = await licenseApiService.getLicenseDashboardData(params);
      
      if (response?.formModel) {
        const mappedData = response.formModel.map((item: any) => 
          ProjectSiteDataMapper.mapLicenseDashboardItem(item)
        );
        setLicenseDashboardData(mappedData);
      }
    } catch (error) {
      console.error('Error fetching license dashboard data:', error);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const setTotalItemsCount = (countData: LicenseDashboardCountData) => {
    let count = 0;
    switch (tableTitle) {
      case 'Active Licenses':
        count = countData.activeCount || 0;
        break;
      case 'Expired Licenses':
        count = countData.expiredCount || 0;
        break;
      case 'Renewal Pending':
        count = countData.renewalPendingCount || 0;
        break;
      case 'New Applications':
        count = countData.newApplicationsCount || 0;
        break;
      default:
        count = countData.activeCount || 0;
    }
    setTotalItems(count);
    setTotalPages(Math.ceil(count / itemsPerPage));
  };

  const handleTableTitleChange = (title: string, nameType: string) => {
    setTableTitle(title);
    setDashboardNameType(nameType);
    setCurrentPage(1);
    setLicenseDashboardData([]);
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

  const handleRenewalRequest = (license: LicenseDashboardItem) => {
    setSelectedLicense(license);
    setShowRenewalModal(true);
  };

  const processRenewalRequest = async () => {
    if (!selectedLicense) return;

    try {
      setIsLoading(true);
      await licenseApiService.processLicenseRenewal(selectedLicense.id, 'approved');
      toast.success('License renewal processed successfully');
      setShowRenewalModal(false);
      setSelectedLicense(null);
      // Refresh data
      getLicenseDashboardData();
      getDashboardCountData();
    } catch (error) {
      console.error('Error processing renewal:', error);
      toast.error('Failed to process license renewal');
    } finally {
      setIsLoading(false);
    }
  };

  const renderDashboardCards = () => {
    if (!dashboardCountData) return null;

    const cards = [
      {
        title: 'Active Licenses',
        count: dashboardCountData.activeCount,
        icon: 'bx bx-check-shield',
        bgColor: 'bg-success',
        textColor: 'text-white',
        onClick: () => handleTableTitleChange('Active Licenses', 'Active')
      },
      {
        title: 'Expired Licenses',
        count: dashboardCountData.expiredCount,
        icon: 'bx bx-shield-x',
        bgColor: 'bg-danger',
        textColor: 'text-white',
        onClick: () => handleTableTitleChange('Expired Licenses', 'Expired')
      },
      {
        title: 'Renewal Pending',
        count: dashboardCountData.renewalPendingCount,
        icon: 'bx bx-time-five',
        bgColor: 'bg-warning',
        textColor: 'text-white',
        onClick: () => handleTableTitleChange('Renewal Pending', 'RenewalPending')
      },
      {
        title: 'New Applications',
        count: dashboardCountData.newApplicationsCount,
        icon: 'bx bx-plus-circle',
        bgColor: 'bg-info',
        textColor: 'text-white',
        onClick: () => handleTableTitleChange('New Applications', 'New')
      },
      {
        title: 'Total Licenses',
        count: dashboardCountData.totalLicensesCount,
        icon: 'bx bx-badge',
        bgColor: 'bg-primary',
        textColor: 'text-white',
        onClick: () => {}
      }
    ];

    return (
      <Row className="mb-4">
        {cards.map((card, index) => (
          <Col xl={2} lg={4} md={6} sm={12} key={index} className="mb-3">
            <Card 
              className={`${card.bgColor} ${card.textColor} h-100 cursor-pointer`}
              onClick={card.onClick}
            >
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h6 className="card-title mb-1">{card.title}</h6>
                    <h3 className="mb-0">{card.count || 0}</h3>
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
            placeholder="Search licenses..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </Form.Group>
      </Col>
      <Col md={6} className="text-end">
        <span className="text-muted">
          Showing {licenseDashboardData.length} of {totalItems} results
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

    if (licenseDashboardData.length === 0) {
      return (
        <div className="text-center py-5">
          <p className="text-muted">No data available for {tableTitle.toLowerCase()}</p>
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
                onClick={() => handleSort('licenseNumber')}
              >
                License Number
                {sortField === 'licenseNumber' && (
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
                onClick={() => handleSort('licenseType')}
              >
                License Type
                {sortField === 'licenseType' && (
                  <i className={`ms-1 bx bx-${sortDirection === 'asc' ? 'up' : 'down'}-arrow-alt`}></i>
                )}
              </th>
              <th 
                className="cursor-pointer"
                onClick={() => handleSort('expiryDate')}
              >
                Expiry Date
                {sortField === 'expiryDate' && (
                  <i className={`ms-1 bx bx-${sortDirection === 'asc' ? 'up' : 'down'}-arrow-alt`}></i>
                )}
              </th>
              <th>Status</th>
              <th>Renewal Required</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {licenseDashboardData.map((item, index) => (
              <tr key={item.id || index}>
                <td>{item.licenseNumber || 'N/A'}</td>
                <td>{item.applicantName}</td>
                <td>{item.licenseType}</td>
                <td>
                  <span className={getExpiryDateClass(item.expiryDate)}>
                    {new Date(item.expiryDate).toLocaleDateString()}
                  </span>
                </td>
                <td>
                  <Badge bg={getStatusBadgeClass(item.status)}>
                    {item.status}
                  </Badge>
                </td>
                <td>
                  {item.renewalRequired ? (
                    <Badge bg="warning" text="dark">Required</Badge>
                  ) : (
                    <Badge bg="success">Not Required</Badge>
                  )}
                </td>
                <td>
                  <div className="d-flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline-primary"
                      onClick={() => handleViewLicense(item)}
                    >
                      View
                    </Button>
                    {item.renewalRequired && (
                      <Button 
                        size="sm" 
                        variant="outline-warning"
                        onClick={() => handleRenewalRequest(item)}
                      >
                        Renew
                      </Button>
                    )}
                    {item.status === 'Pending' && (
                      <Button 
                        size="sm" 
                        variant="outline-success"
                        onClick={() => handleApproveLicense(item)}
                      >
                        Approve
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
      case 'active':
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'expired':
      case 'rejected':
        return 'danger';
      case 'suspended':
        return 'secondary';
      default:
        return 'info';
    }
  };

  const getExpiryDateClass = (expiryDate: string): string => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'text-danger fw-bold'; // Expired
    if (diffDays <= 30) return 'text-warning fw-bold'; // Expiring soon
    return 'text-success'; // Valid
  };

  const handleViewLicense = (item: LicenseDashboardItem) => {
    navigate(`/dashboard/license-dashboard/license/${item.id}`);
  };

  const handleApproveLicense = async (item: LicenseDashboardItem) => {
    try {
      setIsLoading(true);
      await licenseApiService.approveLicenseApplication(item.id);
      toast.success('License approved successfully');
      // Refresh data
      getLicenseDashboardData();
      getDashboardCountData();
    } catch (error) {
      console.error('Error approving license:', error);
      toast.error('Failed to approve license');
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasRole('LICS')) {
    return null;
  }

  return (
    <div className="container-fluid">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="page-title">License Dashboard</h2>
          <p className="text-muted mb-0">License Board Management System</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" size="sm">
            <i className="bx bx-download me-1"></i>
            Export
          </Button>
          <Button variant="outline-secondary" size="sm">
            <i className="bx bx-refresh me-1"></i>
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
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

      {/* Renewal Modal */}
      <Modal show={showRenewalModal} onHide={() => setShowRenewalModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Process License Renewal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLicense && (
            <div>
              <p><strong>License Number:</strong> {selectedLicense.licenseNumber}</p>
              <p><strong>Applicant:</strong> {selectedLicense.applicantName}</p>
              <p><strong>License Type:</strong> {selectedLicense.licenseType}</p>
              <p><strong>Expiry Date:</strong> {new Date(selectedLicense.expiryDate).toLocaleDateString()}</p>
              <hr />
              <p>Are you sure you want to approve this license renewal request?</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRenewalModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={processRenewalRequest} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Approve Renewal'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LicenseDashboard;