import React, { useState, useEffect, useCallback } from 'react';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { toast } from 'react-toastify';
import { Card, Row, Col, Table, Spinner, Form, Button, Pagination } from 'react-bootstrap';
import { useUserRole } from '../../hooks/useUserRole';
import { ProjectSiteDataMapper } from '../../lib/project-site-data-mapper';
import { AdminApiService } from '../../services/adminApiService';
import { CommonApiService } from '../../services/commonApiService';
import { AdminDashboardCards } from '../../components/DashboardCards';

interface DashboardCountData {
  pendingCount: number;
  procesedCount: number;
  rejectedCount: number;
  departmentCount: number;
  applicantCount: number;
  agendaCount: number;
}

interface AdminDashboardItem {
  id: string;
  applicationType: string;
  applicationDate: string;
  status: string;
  applicantName: string;
  projectName: string;
  location: string;
  // Add more fields based on your API response
}

interface AdminDashboardProps {
  // Add any props if needed
}

export const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  console.log('🏗️ [AdminDashboard] Component rendering...');
  
  const { navigateTo, routes } = useAppNavigation();
  const { roleName, getUserId, isAdmin, loading: roleLoading } = useUserRole();

  // Add cleanup effect
  useEffect(() => {
    console.log('🎯 [AdminDashboard] Component mounted');
    return () => {
      console.log('💀 [AdminDashboard] Component unmounting');
    };
  }, []);
  
  // State Management
  const [dashboardCountData, setDashboardCountData] = useState<DashboardCountData | null>(null);
  const [adminDashboardData, setAdminDashboardData] = useState<AdminDashboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Table Management
  const [tableTitle, setTableTitle] = useState<string>('Inbox');
  const [dashboardNameType, setDashboardNameType] = useState<string>('Pending');
  
  // Search, Sort, Pagination
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Services
  const adminApiService = new AdminApiService();
  const commonApiService = new CommonApiService();
  
  useEffect(() => {
    // Wait for role to load before checking permissions
    if (roleLoading) {
      console.log('🔐 [AdminDashboard] Role still loading, waiting...');
      return;
    }
    
    // Check if user has admin role (using roleName directly instead of isAdmin() function)
    if (roleName !== 'ADMN') {
      console.log('🔐 [AdminDashboard] Access denied - not admin role:', roleName);
      toast.error('Access denied. Admin privileges required.');
      navigateTo(routes.DASHBOARD);
      return;
    }
    
    console.log('✅ [AdminDashboard] Admin role confirmed:', roleName);
    initializeDashboard();
  }, [roleName, navigateTo, routes.DASHBOARD, roleLoading]);

  // This useEffect will be moved after function definitions

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

  const getDashboardCountData = useCallback(async () => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      console.log('🔄 [AdminDashboard] Calling getDashboardCountDataByRole API...');
      const response = await commonApiService.getDashboardCountDataByRole(userId, 'ADMN');
      
      if (response?.formModel) {
        setDashboardCountData(response.formModel);
        setTotalItemsCount(response.formModel);
        console.log('✅ [AdminDashboard] Dashboard count data loaded successfully');
      }
    } catch (error) {
      console.error('❌ [AdminDashboard] Error fetching dashboard count:', error);
      throw error;
    }
  }, []); // Empty dependency array - this should only run when explicitly called

  const getAdminDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        dashboardNameType,
        pageNumber: currentPage,
        pageSize: itemsPerPage,
        searchTerm: searchTerm || '',
        sortField: sortField || '',
        sortDirection: sortDirection || 'asc'
      };

      const response = await adminApiService.getAdminDashboardDetails(params);
      
      if (response?.formModel) {
        const mappedData = response.formModel.map((item: any) => 
          ProjectSiteDataMapper.mapAdminDashboardItem(item)
        );
        setAdminDashboardData(mappedData);
      }
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [dashboardNameType, currentPage, itemsPerPage, searchTerm, sortField, sortDirection]);

  // useEffect for loading data when dependencies change - placed after function definitions
  useEffect(() => {
    // Wait for role loading and only proceed if user is admin
    if (roleLoading) {
      console.log('🔐 [AdminDashboard] Role still loading, skipping data fetch');
      return;
    }
    
    if (roleName === 'ADMN') {
      console.log('🔄 [AdminDashboard] Loading dashboard data due to dependency change');
      getAdminDashboardData();
    }
  }, [roleName, roleLoading, getAdminDashboardData]);

  const setTotalItemsCount = (countData: DashboardCountData) => {
    let count = 0;
    switch (tableTitle) {
      case 'Inbox':
        count = countData.pendingCount || 0;
        break;
      case 'Closed':
        count = countData.procesedCount || 0;
        break;
      case 'Rejected':
        count = countData.rejectedCount || 0;
        break;
      default:
        count = countData.pendingCount || 0;
    }
    setTotalItems(count);
    setTotalPages(Math.ceil(count / itemsPerPage));
  };

  const handleTableTitleChange = (title: string, nameType: string) => {
    setTableTitle(title);
    setDashboardNameType(nameType);
    setCurrentPage(1);
    setAdminDashboardData([]);
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

  const renderDashboardCards = () => {
    return (
      <AdminDashboardCards 
        dashboardCountData={dashboardCountData}
        tableTitle={tableTitle}
        onCardClick={handleTableTitleChange}
        loading={isLoading}
      />
    );
  };

  const renderSearchAndFilters = () => (
    <Row className="mb-3">
      <Col md={6}>
        <Form.Group>
          <Form.Control
            type="text"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </Form.Group>
      </Col>
      <Col md={6} className="text-end">
        <span className="text-muted">
          Showing {adminDashboardData.length} of {totalItems} results
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

    if (adminDashboardData.length === 0) {
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
                onClick={() => handleSort('applicationType')}
              >
                Application Type
                {sortField === 'applicationType' && (
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
                onClick={() => handleSort('applicationDate')}
              >
                Application Date
                {sortField === 'applicationDate' && (
                  <i className={`ms-1 bx bx-${sortDirection === 'asc' ? 'up' : 'down'}-arrow-alt`}></i>
                )}
              </th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {adminDashboardData.map((item, index) => (
              <tr key={item.id || index}>
                <td>{item.applicationType}</td>
                <td>{item.applicantName}</td>
                <td>{new Date(item.applicationDate).toLocaleDateString()}</td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <Button 
                    size="sm" 
                    variant="outline-primary"
                    onClick={() => handleViewApplication(item)}
                  >
                    View
                  </Button>
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
        return 'bg-warning text-dark';
      case 'processed':
      case 'approved':
        return 'bg-success';
      case 'rejected':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const handleViewApplication = (item: AdminDashboardItem) => {
    // Navigate to application details or open modal
    navigateTo(`/dashboard/admin-dashboard/application/${item.id}` as any);
  };

  if (!isAdmin()) {
    return null;
  }

  return (
    <div className="container-fluid">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title">Admin Dashboard</h2>
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
    </div>
  );
};

export default AdminDashboard;