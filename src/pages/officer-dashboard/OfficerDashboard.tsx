import React, { useState, useEffect } from 'react';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { toast } from 'react-toastify';
import { Card, Row, Col, Table, Spinner, Form, Button, Pagination, Tabs, Tab, Badge } from 'react-bootstrap';
import { useUserRole } from '../../hooks/useUserRole';
import { ProjectSiteDataMapper } from '../../lib/project-site-data-mapper';
import { officerApiService } from '../../services/officerApiService';
import { commonApiService } from '../../services/commonApiService';

interface DashboardCountData {
  pendingCount: number;
  procesedCount: number;
  rejectedCount: number;
  departmentCount: number;
  applicantCount: number;
  agendaCount: number;
}

interface OfficerDashboardItem {
  id: string;
  applicationType: string;
  applicationDate: string;
  status: string;
  applicantName: string;
  projectName: string;
  location: string;
  priority: 'high' | 'medium' | 'low';
  assignedTo?: string;
  daysRemaining?: number;
}

interface OfficerDashboardProps {
  // Add any props if needed
}

export const OfficerDashboard: React.FC<OfficerDashboardProps> = () => {
  const { navigateTo, navigateToPath, routes } = useAppNavigation();
  const { roleName, getUserId, isOfficer } = useUserRole();
  
  // State Management
  const [dashboardCountData, setDashboardCountData] = useState<DashboardCountData | null>(null);
  const [officerDashboardData, setOfficerDashboardData] = useState<OfficerDashboardItem[]>([]);
  const [agendaData, setAgendaData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Tab Management
  const [activeTab, setActiveTab] = useState<string>('applications');
  
  // Table Management
  const [tableTitle, setTableTitle] = useState<string>('Inbox');
  const [dashboardNameType, setDashboardNameType] = useState<string>('Pending');
  
  // Search, Sort, Pagination - Main Tab
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Search, Sort, Pagination - Second Tab (Agenda)
  const [searchTermSecond, setSearchTermSecond] = useState<string>('');
  const [sortFieldSecond, setSortFieldSecond] = useState<string>('');
  const [sortDirectionSecond, setSortDirectionSecond] = useState<'asc' | 'desc'>('asc');
  const [currentPageSecond, setCurrentPageSecond] = useState<number>(1);
  const [totalItemsSecond, setTotalItemsSecond] = useState<number>(0);
  const [totalPagesSecond, setTotalPagesSecond] = useState<number>(0);

  // Services (using singletons)
  
  useEffect(() => {
    // Check if user has officer role
    if (!isOfficer()) {
      toast.error('Access denied. Officer privileges required.');
      navigateTo(routes.DASHBOARD);
      return;
    }
    
    initializeDashboard();
  }, [roleName]);

  useEffect(() => {
    if (isOfficer()) {
      getOfficerDashboardData();
    }
  }, [currentPage, dashboardNameType, searchTerm, sortField, sortDirection]);

  useEffect(() => {
    if (isOfficer() && activeTab === 'agenda') {
      getAgendaData();
    }
  }, [currentPageSecond, searchTermSecond, sortFieldSecond, sortDirectionSecond, activeTab]);

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
      const response = await commonApiService.getDashboardCountDataByRole(userId, roleName || '');
      
      if (response?.formModel) {
        setDashboardCountData(response.formModel);
        setTotalItemsCount(response.formModel);
      }
    } catch (error) {
      console.error('Error fetching dashboard count:', error);
      throw error;
    }
  };

  const getOfficerDashboardData = async () => {
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

      const response = await officerApiService.getOfficerDashboardData(params);
      
      if (response?.formModel) {
        const mappedData = response.formModel.map((item: any) => 
          ProjectSiteDataMapper.mapOfficerDashboardItem(item)
        );
        setOfficerDashboardData(mappedData);
      }
    } catch (error) {
      console.error('Error fetching officer dashboard data:', error);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getAgendaData = async () => {
    try {
      setIsLoading(true);
      const userId = getUserId();
      if (!userId) {
        throw new Error('User ID not found');
      }

      const params = {
        userId,
        pageNumber: currentPageSecond,
        pageSize: itemsPerPage,
        searchTerm: searchTermSecond || '',
        sortField: sortFieldSecond || '',
        sortDirection: sortDirectionSecond || 'asc'
      };

      const response = await officerApiService.getAgendaData(params);
      
      if (response?.formModel) {
        setAgendaData(response.formModel);
        setTotalItemsSecond(response.totalCount || 0);
        setTotalPagesSecond(Math.ceil((response.totalCount || 0) / itemsPerPage));
      }
    } catch (error) {
      console.error('Error fetching agenda data:', error);
      toast.error('Failed to load agenda data');
    } finally {
      setIsLoading(false);
    }
  };

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
    setOfficerDashboardData([]);
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

  // Second tab handlers
  const handleSearchSecond = (term: string) => {
    setSearchTermSecond(term);
    setCurrentPageSecond(1);
  };

  const handleSortSecond = (field: string) => {
    if (sortFieldSecond === field) {
      setSortDirectionSecond(sortDirectionSecond === 'asc' ? 'desc' : 'asc');
    } else {
      setSortFieldSecond(field);
      setSortDirectionSecond('asc');
    }
    setCurrentPageSecond(1);
  };

  const handlePageChangeSecond = (page: number) => {
    setCurrentPageSecond(page);
  };

  const renderDashboardCards = () => {
    if (!dashboardCountData) return null;

    const cards = [
      {
        title: 'Pending Applications',
        count: dashboardCountData.pendingCount,
        icon: 'bx bx-time-five',
        bgColor: 'bg-warning',
        textColor: 'text-white',
        onClick: () => handleTableTitleChange('Inbox', 'Pending')
      },
      {
        title: 'Processed Applications',
        count: dashboardCountData.procesedCount,
        icon: 'bx bx-check-circle',
        bgColor: 'bg-success',
        textColor: 'text-white',
        onClick: () => handleTableTitleChange('Closed', 'Processed')
      },
      {
        title: 'Rejected Applications',
        count: dashboardCountData.rejectedCount,
        icon: 'bx bx-x-circle',
        bgColor: 'bg-danger',
        textColor: 'text-white',
        onClick: () => handleTableTitleChange('Rejected', 'Rejected')
      },
      {
        title: 'Agenda Items',
        count: dashboardCountData.agendaCount,
        icon: 'bx bx-calendar',
        bgColor: 'bg-info',
        textColor: 'text-white',
        onClick: () => {
          setActiveTab('agenda');
        }
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

  const renderSearchAndFilters = (isSecondTab = false) => {
    const searchValue = isSecondTab ? searchTermSecond : searchTerm;
    const dataLength = isSecondTab ? agendaData.length : officerDashboardData.length;
    const totalCount = isSecondTab ? totalItemsSecond : totalItems;
    const searchHandler = isSecondTab ? handleSearchSecond : handleSearch;

    return (
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder={`Search ${isSecondTab ? 'agenda items' : 'applications'}...`}
              value={searchValue}
              onChange={(e) => searchHandler(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6} className="text-end">
          <span className="text-muted">
            Showing {dataLength} of {totalCount} results
          </span>
        </Col>
      </Row>
    );
  };

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

    if (officerDashboardData.length === 0) {
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
              <th>Priority</th>
              <th>Status</th>
              <th>Days Remaining</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {officerDashboardData.map((item, index) => (
              <tr key={item.id || index}>
                <td>{item.applicationType}</td>
                <td>{item.applicantName}</td>
                <td>{new Date(item.applicationDate).toLocaleDateString()}</td>
                <td>
                  <Badge bg={getPriorityBadgeClass(item.priority)}>
                    {item.priority?.toUpperCase() || 'MEDIUM'}
                  </Badge>
                </td>
                <td>
                  <Badge bg={getStatusBadgeClass(item.status)}>
                    {item.status}
                  </Badge>
                </td>
                <td>
                  <span className={getDaysRemainingClass(item.daysRemaining)}>
                    {item.daysRemaining !== undefined ? `${item.daysRemaining} days` : 'N/A'}
                  </span>
                </td>
                <td>
                  <div className="d-flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline-primary"
                      onClick={() => handleViewApplication(item)}
                    >
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline-success"
                      onClick={() => handleProcessApplication(item)}
                    >
                      Process
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  };

  const renderAgendaTable = () => {
    if (isLoading) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      );
    }

    if (agendaData.length === 0) {
      return (
        <div className="text-center py-5">
          <p className="text-muted">No agenda items available</p>
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
                onClick={() => handleSortSecond('agendaTitle')}
              >
                Agenda Title
                {sortFieldSecond === 'agendaTitle' && (
                  <i className={`ms-1 bx bx-${sortDirectionSecond === 'asc' ? 'up' : 'down'}-arrow-alt`}></i>
                )}
              </th>
              <th 
                className="cursor-pointer"
                onClick={() => handleSortSecond('meetingDate')}
              >
                Meeting Date
                {sortFieldSecond === 'meetingDate' && (
                  <i className={`ms-1 bx bx-${sortDirectionSecond === 'asc' ? 'up' : 'down'}-arrow-alt`}></i>
                )}
              </th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agendaData.map((item, index) => (
              <tr key={item.id || index}>
                <td>{item.agendaTitle}</td>
                <td>{new Date(item.meetingDate).toLocaleDateString()}</td>
                <td>
                  <Badge bg={getStatusBadgeClass(item.status)}>
                    {item.status}
                  </Badge>
                </td>
                <td>
                  <Button 
                    size="sm" 
                    variant="outline-primary"
                    onClick={() => handleViewAgenda(item)}
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

  const renderPagination = (isSecondTab = false) => {
    const currentPageValue = isSecondTab ? currentPageSecond : currentPage;
    const totalPagesValue = isSecondTab ? totalPagesSecond : totalPages;
    const handlePageChangeValue = isSecondTab ? handlePageChangeSecond : handlePageChange;

    if (totalPagesValue <= 1) return null;

    const items = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPageValue - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPagesValue, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === currentPageValue}
          onClick={() => handlePageChangeValue(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    return (
      <div className="d-flex justify-content-center mt-4">
        <Pagination>
          <Pagination.First 
            disabled={currentPageValue === 1}
            onClick={() => handlePageChangeValue(1)}
          />
          <Pagination.Prev 
            disabled={currentPageValue === 1}
            onClick={() => handlePageChangeValue(currentPageValue - 1)}
          />
          {items}
          <Pagination.Next 
            disabled={currentPageValue === totalPagesValue}
            onClick={() => handlePageChangeValue(currentPageValue + 1)}
          />
          <Pagination.Last 
            disabled={currentPageValue === totalPagesValue}
            onClick={() => handlePageChangeValue(totalPagesValue)}
          />
        </Pagination>
      </div>
    );
  };

  const getPriorityBadgeClass = (priority: string): string => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeClass = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'processed':
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'in-review':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const getDaysRemainingClass = (days?: number): string => {
    if (days === undefined) return '';
    if (days <= 2) return 'text-danger fw-bold';
    if (days <= 5) return 'text-warning fw-bold';
    return 'text-success';
  };

  const handleViewApplication = (item: OfficerDashboardItem) => {
    navigateToPath(`/dashboard/officer-dashboard/application/${item.id}`);
  };

  const handleProcessApplication = (item: OfficerDashboardItem) => {
    navigateToPath(`/dashboard/officer-dashboard/process/${item.id}`);
  };

  const handleViewAgenda = (item: any) => {
    navigateToPath(`/dashboard/officer-dashboard/agenda/${item.id}`);
  };

  if (!isOfficer()) {
    return null;
  }

  return (
    <div className="container-fluid">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="page-title">Officer Dashboard</h2>
          <p className="text-muted mb-0">Role: {roleName}</p>
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

      {/* Tabs Section */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k || 'applications')}
        className="mb-3"
      >
        <Tab eventKey="applications" title="Applications">
          <Card>
            <Card.Header>
              <h5 className="card-title mb-0">{tableTitle}</h5>
            </Card.Header>
            <Card.Body>
              {renderSearchAndFilters(false)}
              {renderDataTable()}
              {renderPagination(false)}
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="agenda" title="Agenda">
          <Card>
            <Card.Header>
              <h5 className="card-title mb-0">Agenda Items</h5>
            </Card.Header>
            <Card.Body>
              {renderSearchAndFilters(true)}
              {renderAgendaTable()}
              {renderPagination(true)}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

export default OfficerDashboard;