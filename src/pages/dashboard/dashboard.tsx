import React, { useState, useEffect } from "react";
import { Card, Form, Container, Row, Col } from 'react-bootstrap';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import DataTable from '../../components/shared-component/DataTable';
import CardDisplay from '../../components/shared-component/cardDisplay';
import { useProjectSiteAPI } from '../../hooks/useProjectSiteAPI';
import { ProjectSiteDataMapper } from '../../utils/projectSiteDataMapper';

const DashboardPage: React.FC = () => {
  const { navigateTo, routes } = useAppNavigation();
  type Category = 'Project Site Applied' | 'Rejected' | 'Inbox' | 'Closed';
  const [selectedDropdownValue, setSelectedDropdownValue] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Project Site Applied');
  const [isMobileView, setIsMobileView] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track initial load
  
  // Use the universal API hook with dashboard configuration
  const {
    projectSiteData,
    dashboardCounts,
    loading,
    error,
    loadProjectSiteDetails,
    getCountForCategory
  } = useProjectSiteAPI({
    pageType: 'dashboard',
    enableCounts: true,
    autoLoad: true,
    onDataLoaded: (data) => {
      console.log('🎯 [Dashboard]: Data loaded callback:', data);
      setIsInitialLoad(false); // Mark initial load as complete
    },
    onError: (error) => {
      console.error('🎯 [Dashboard]: Error callback:', error);
      setIsInitialLoad(false); // Mark initial load as complete even on error
    }
  });

  // Handle resize - memoized to prevent recreation
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 475);
    };

    handleResize(); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Create stats array with real counts
  const stats: Array<{
  title: Category; // ← Add proper typing
  count: number;
  iconClass: string;
  bgColor: string;
  textColor: string;
  iconColor: string;
}> = [
  {
    title: 'Project Site Applied' as Category, // ← Explicit typing
    count: dashboardCounts.projectSiteApplied,
    iconClass: 'bi bi-person-check-fill',
    bgColor: '#edf3fd',
    textColor: '#0d6efd',
    iconColor: '#0d6efd',
  },
  {
    title: 'Rejected' as Category,
    count: dashboardCounts.rejected,
    iconClass: 'bi bi-x-square-fill',
    bgColor: '#fae6e6',
    textColor: '#dc3545',
    iconColor: '#dc3545',
  },
  {
    title: 'Inbox' as Category,
    count: dashboardCounts.inbox,
    iconClass: 'bi bi-inbox-fill',
    bgColor: '#fff3e0',
    textColor: '#ff6f00',
    iconColor: '#ff6f00',
  },
  {
    title: 'Closed' as Category,
    count: dashboardCounts.closed,
    iconClass: 'bi bi-check2-circle',
    bgColor: '#eaf6ec',
    textColor: '#198754',
    iconColor: '#198754',
  },
];

// Get table data using universal mapper - add fallback
const getTableData = () => {
  if (selectedCategory === 'Project Site Applied' && projectSiteData) {
    const mappedData = ProjectSiteDataMapper.mapForPage(projectSiteData, 'dashboard');
    return mappedData.tableRows || []; // ← Add fallback
  }
  
  const count = getCountForCategory(selectedCategory);
  if (count === 0 || !projectSiteData) {
    return []; // ← Return empty array instead of undefined
  }

  const mappedData = ProjectSiteDataMapper.mapForPage(projectSiteData, 'dashboard');
  return mappedData.tableRows || []; // ← Add fallback
};

  const handleDetailsClick = () => {
    console.log('Details button clicked, navigating to /ProjectDetails');
    sessionStorage.setItem('allowProjectDetailsNavigation', 'true');
    console.log('Dashboard - Set allowProjectDetailsNavigation flag');
    navigateTo(routes.PROJECT_DETAILS);
  };

  // Handle category change - manually load data for different categories
  const handleCategoryChange = (newCategory: Category) => {
    console.log('🔄 [Dashboard]: Category changed to:', newCategory);
    setSelectedCategory(newCategory);
    
    if (isMobileView) {
      setSelectedDropdownValue(newCategory);
    }
    
    // Only load data if it's not the default category (which auto-loads)
    if (newCategory !== 'Project Site Applied') {
      loadProjectSiteDetails(newCategory);
    }
  };

  // Show initial loading screen only for the very first load
  if (isInitialLoad && loading) {
    return (
      <div className="min-vh-100 bg-light d-flex justify-content-center align-items-center" style={{ paddingTop: '80px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light" style={{ paddingTop: '80px' }}>
      <Container fluid className="px-0" style={{ maxWidth: '1500px' }}>  
        
        <div className="bg-white rounded shadow-sm mx-auto" style={{ width: '90%', maxWidth: '1500px', padding: '32px' }}>
          
          <div className="p-1 mb-1">
            
            {/* Mobile Category Dropdown */}
            <Row className="d-block d-md-none">
              <Col className="d-flex justify-content-end mb-3">
                <Form.Select
                  aria-label="Select category"
                  className="w-auto small"
                  value={selectedDropdownValue}
                  onChange={(e) => {
                    const newCategory = e.target.value as Category;
                    handleCategoryChange(newCategory);
                  }}
                  style={{ fontSize: '12px' }}
                >
                  <option value="" disabled hidden>Select Category</option>
                  {stats.map((item) => (
                    <option key={item.title} value={item.title}>
                      {item.title}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            <CardDisplay
              stats={stats}
              selectedCategory={selectedCategory}
              setSelectedCategory={handleCategoryChange}
              isMobileView={isMobileView}
            />
            
          </div>

          {/* Data Table Section - Fixed height container to prevent layout shifts */}
          <div className="mt-4 p-1">
            <Card className="border-1 shadow-dark">
              <Card.Body className="p-4">
                
                {/* Fixed height container to prevent layout shifts */}
                <div className="table-container" style={{ minHeight: '300px', position: 'relative' }}>
                  
                  {/* Show inline loading state for category switches */}
                  {loading && !isInitialLoad && (
                    <div className="loading-overlay">
                      <div className="text-center">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 mb-0 small">Loading {selectedCategory.toLowerCase()} data...</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Error state */}
                  {error && !loading ? (
                    <div className="text-center py-4 text-danger">
                      <i className="bi bi-exclamation-triangle fs-1"></i>
                      <p className="mt-2">Error loading data: {error}</p>
                      <button 
                        className="btn btn-outline-primary"
                        onClick={() => loadProjectSiteDetails(selectedCategory)}
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                    /* Table content with fade effect during loading */
                    <div className={`table-content ${loading && !isInitialLoad ? 'loading-fade' : ''}`}>
                      <DataTable
                        title={selectedCategory}
                        isMobileView={isMobileView}
                        columns={[
                          "S.No.",
                          "PIN",
                          "Application No",
                          "Site Address",
                          "Applicant Name",
                          "Mobile",
                          "Communication Address",
                          "Project Purpose",
                          "Action"
                        ]}
                        rows={getTableData()}
                        onActionClick={(rowData) => {
                          console.log('🔄 [Dashboard]: Action clicked for row:', rowData);
                          handleDetailsClick();
                        }}
                      />
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </Container>

      <style>
        {`
        /* Your existing CSS styles here */
        * {
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        }

        .small {
          font-size: 12px !important;
          font-weight: 500;
          line-height: 1.4;
        }
        
        .text-primary {
          color: #034078 !important;
        }

        .text-secondary-custom {
          color: #6c757d !important;
        }

        /* Enhanced Dashboard Background */
        .min-vh-100 {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
          min-height: 100vh;
        }

        /* Main Container Styling */
        .bg-white.rounded.shadow-sm {
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
          border-radius: 20px !important;
        }

        /* Fixed height container to prevent layout shifts */
        .table-container {
          min-height: 300px;
          position: relative;
          transition: all 0.3s ease;
        }

        /* Loading overlay for smooth transitions */
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          backdrop-filter: blur(2px);
          border-radius: 8px;
        }

        /* Fade effect for table content during loading */
        .table-content {
          transition: opacity 0.3s ease;
        }

        .table-content.loading-fade {
          opacity: 0.6;
          pointer-events: none;
        }

        /* Loading States */
        .spinner-border {
          width: 3rem;
          height: 3rem;
        }

        .spinner-border-sm {
          width: 1.5rem;
          height: 1.5rem;
        }

        /* Error States */
        .text-danger {
          color: #dc3545 !important;
        }

        /* Retry Button */
        .btn-outline-primary {
          border-color: #034078;
          color: #034078;
          transition: all 0.3s ease;
        }

        .btn-outline-primary:hover {
          background-color: #034078;
          border-color: #034078;
          color: white;
        }

        /* Smooth transitions for all elements */
        .card-body {
          transition: all 0.3s ease;
        }

        /* Prevent layout shifts */
        .container-fluid {
          contain: layout;
        }

        /* Card hover effects with smooth transitions */
        .card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Smooth state transitions */
        .fade-in {
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Add all your existing CSS styles here... */
        `}
      </style>
    </div>
  );
};

export default DashboardPage;