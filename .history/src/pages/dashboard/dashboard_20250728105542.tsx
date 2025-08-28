'use client';
import React, { useState, useEffect } from "react";
import { Card, Table, Button, Form, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  type Category = 'Project Site Applied' | 'Rejected' | 'Inbox' | 'Closed';
  const [selectedDropdownValue, setSelectedDropdownValue] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Project Site Applied');
  const [isMobileView, setIsMobileView] = useState(false);

useEffect(() => {
  const handleResize = () => {
    setIsMobileView(window.innerWidth <= 475);
  };

  handleResize(); 

  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

const userData: Record<Category, {
    pin: string;
    applicationNo: string;
    siteAddress: string;
    name: string;
    mobile: string;
    address: string;
    purpose: string;
  }[]> = {
    'Project Site Applied': [
      {
        pin: '485',
        applicationNo: 'N/A',
        siteAddress: 'Ghasola, Sector 33',
        name: 'Rahul Gupta',
        mobile: '7317314242',
        address: 'Sector 33',
        purpose: 'Contractor / Supervisor'
      }
    ],
    Rejected: [],
    Inbox: [],
    Closed: [],
  };

const stats = [
    {
      title: 'Project Site Applied',
      count: 1,
      iconClass: 'bi bi-person-check-fill',
      bgColor: '#edf3fd',
      textColor: '#0d6efd',
      iconColor: '#0d6efd',
    },
    {
      title: 'Rejected',
      count: 0,
      iconClass: 'bi bi-x-square-fill',
      bgColor: '#fae6e6',
      textColor: '#dc3545',
      iconColor: '#dc3545',
    },
    {
      title: 'Inbox',
      count: 0,
      iconClass: 'bi bi-inbox-fill',
      bgColor: '#fefcea',
      textColor: '#f0ad4e',
      iconColor: '#f0ad4e',
    },
    {
      title: 'Closed',
      count: 0,
      iconClass: 'bi bi-check2-circle',
      bgColor: '#eaf6ec',
      textColor: '#198754',
      iconColor: '#198754',
    },
  ];

  const handleDetailsClick = () => {
    navigate('/ProjectDetails');
  };

  return (
    <div className="min-vh-100 bg-light pt-4">
      <Container fluid className="px-0" style={{ maxWidth: '1500px' }}>
        <div className="bg-white rounded shadow-sm mx-auto" style={{ width: '90%', maxWidth: '1500px', padding: '32px' }}>
          
          {}
          <div className="p-1 mb-1">
            
            {}
            <Row className="d-block d-md-none">
              <Col className="d-flex justify-content-end mb-3">
                <Form.Select
                  aria-label="Select category"
                  className="w-auto small"
                  value={selectedDropdownValue}
                  onChange={(e) => {
                    const newCategory = e.target.value as Category;
                    setSelectedDropdownValue(newCategory);
                    setSelectedCategory(newCategory);
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

            {}
            <Row className="g-3 justify-content-between">
              {stats.map((item, index) => (
                <Col 
                  key={index} 
                  xs={12} 
                  md={6} 
                  lg={3} 
                  className={`d-flex flex-column align-items-center ${isMobileView && selectedCategory !== item.title ? 'd-none' : ''}`}
                >
                  <Card
                    onClick={!isMobileView ? () => setSelectedCategory(item.title as Category) : undefined}
                    className={`border-0 shadow-sm w-100 stat-card ${selectedCategory === item.title ? 'selected-card' : 'non-selected-card'}`}
                    style={{
                      maxWidth: '300px',
                      minHeight: '100px',
                      backgroundColor: selectedCategory === item.title ? item.textColor : item.bgColor,
                      borderRadius: '10px',
                      border: 'none',
                      borderBottom: selectedCategory === item.title ? `4px solid ${item.textColor}` : 'none',
                      transition: 'all 0.3s ease-in-out',
                      cursor: !isMobileView ? 'pointer' : 'default'
                    }}
                  >
                    <Card.Body className="d-flex align-items-center gap-3 p-3">
                      <i
                        className={item.iconClass}
                        style={{
                          fontSize: '30px',
                          color: selectedCategory === item.title ? '#ffffff' : item.iconColor,
                        }}
                      ></i>

                      <div>
                        <Card.Title
                          className="mb-1 small fw-medium"
                          style={{
                            fontSize: '14px',
                            color: selectedCategory === item.title ? '#ffffff' : item.textColor,
                          }}
                        >
                          {item.title}
                        </Card.Title>
                        <h4
                          className="mb-0 fw-bold"
                          style={{
                            color: selectedCategory === item.title ? '#ffffff' : item.textColor,
                          }}
                        >
                          {item.count}
                        </h4>
                      </div>
                    </Card.Body>
                  </Card>
                  {}
                  {!isMobileView && selectedCategory === item.title && (
                    <div 
                      style={{
                        width: '100%',
                        maxWidth: '260px',
                        height: '2px',
                        backgroundColor: item.textColor,
                        marginTop: '5px'
                      }}
                    />
                  )}
                </Col>
              ))}
            </Row>
          </div>

          {}
          <div className="mt-1 p-1">
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                
                {}
                {!isMobileView ? (
                  <Table borderless className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th colSpan={5} className="border-0 bg-light p-3">
                          <h5 className="mb-0 fw-medium" style={{ fontSize: '18px' }}>{selectedCategory}</h5>
                        </th>
                      </tr>
                      <tr className="table-light">
                        <th className="border-0 bg-light p-3 fw-bold small">S.No.</th>
                        <th className="border-0 bg-light p-3 fw-bold small">
                          <div className="lh-sm">
                            PIN<br />
                            Application No<br />
                            Site Address
                          </div>
                        </th>
                        <th className="border-0 bg-light p-3 fw-bold small">
                          <div className="lh-sm">
                            Applicant Name<br />
                            Mobile No<br />
                            Communication Address
                          </div>
                        </th>
                        <th className="border-0 bg-light p-3 fw-bold small">Project Purpose</th>
                        <th className="border-0 bg-light p-3 fw-bold small">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userData[selectedCategory]?.length > 0 ? (
                        userData[selectedCategory].map((item, idx) => (
                          <tr key={idx}>
                            <td className="border-0 bg-light p-3 small fw-normal">{idx + 1}</td>
                            <td className="border-0 bg-light p-3 small fw-normal">
                              <div className="lh-sm">{item.pin}<br />{item.applicationNo}<br />{item.siteAddress}</div>
                            </td>
                            <td className="border-0 bg-light p-3 small fw-normal">
                              <div className="lh-sm">{item.name}<br />{item.mobile}<br />{item.address}</div>
                            </td>
                            <td className="border-0 bg-light p-3 small fw-normal">{item.purpose}</td>
                            <td className="border-0 bg-light p-3">
                              <Button 
                                variant="primary" 
                                size="sm" 
                                className="d-flex align-items-center small"
                                onClick={handleDetailsClick}
                                style={{ fontSize: '14px' }}
                              >
                                <i className="bi bi-ticket-detailed me-2"></i>
                                Details
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center text-danger fw-medium border-0 bg-light p-3">
                            No Data Found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                ) : (
                  
                  <div>
                    {userData[selectedCategory]?.length > 0 ? (
                      userData[selectedCategory].map((item, idx) => (
                        <Card key={idx} className="mb-3 bg-light border-1 rounded-2">
                          <Card.Body className="p-3 small lh-base">
                            <div className="d-flex flex-column border-bottom pb-2 mb-3">
                              <div className="fw-bold text-dark small">S.No.:</div>
                              <div className="text-primary small">{idx + 1}</div>
                            </div>
                            <div className="d-flex flex-column border-bottom pb-2 mb-3">
                              <div className="fw-bold text-dark small">PIN:</div>
                              <div className="text-primary small">{item.pin}</div>
                            </div>
                            <div className="d-flex flex-column border-bottom pb-2 mb-3">
                              <div className="fw-bold text-dark small">Application No:</div>
                              <div className="text-primary small">{item.applicationNo}</div>
                            </div>
                            <div className="d-flex flex-column border-bottom pb-2 mb-3">
                              <div className="fw-bold text-dark small">Site Address:</div>
                              <div className="text-primary small">{item.siteAddress}</div>
                            </div>
                            <div className="d-flex flex-column border-bottom pb-2 mb-3">
                              <div className="fw-bold text-dark small">Applicant Name:</div>
                              <div className="text-primary small">{item.name}</div>
                            </div>
                            <div className="d-flex flex-column border-bottom pb-2 mb-3">
                              <div className="fw-bold text-dark small">Mobile No:</div>
                              <div className="text-primary small">{item.mobile}</div>
                            </div>
                            <div className="d-flex flex-column border-bottom pb-2 mb-3">
                              <div className="fw-bold text-dark small">Communication Address:</div>
                              <div className="text-primary small">{item.address}</div>
                            </div>
                            <div className="d-flex flex-column mb-3">
                              <div className="fw-bold text-dark small">Project Purpose:</div>
                              <div className="text-primary small">{item.purpose}</div>
                            </div>
                            <div className="mt-2">
                              <Button 
                                variant="primary" 
                                size="sm" 
                                className="d-flex align-items-center w-100 justify-content-center small"
                                onClick={handleDetailsClick}
                              >
                                <i className="bi bi-ticket-detailed me-2"></i>
                                Details
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      ))
                    ) : (
                      <Card className="mb-3 bg-light border-1">
                        <Card.Body className="p-3 text-center text-danger fw-semibold">
                          No Data Found
                        </Card.Body>
                      </Card>
                    )}
                  </div>
                )}  
              </Card.Body>
            </Card>
          </div>
        </div>
      </Container>

      <style jsx>{`
        
        .small {
          font-size: 11px !important;
        }
        
        .text-primary {
          color: #034078 !important;
        }

:global(.stat-card) {
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s cubic-bezier(0.4,0,0.2,1) !important;
          transform: scale(1);
        }
        
        :global(.stat-card:hover) {
          transform: scale(1.05) !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }
        
        :global(.stat-card.selected-card) {
          transform: scale(0.95) !important;
          box-shadow: 0 6px 20px rgba(0,0,0,0.12);
        }
        
        :global(.stat-card.selected-card:hover) {
          transform: scale(1.05) !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }

@media (max-width: 475px) {
          .container-fluid {
            padding: 0 !important;
          }
          
          .bg-white.rounded.shadow-sm {
            margin: 0 !important;
            border-radius: 0 !important;
            padding: 0.5rem !important;
            width: 100% !important;
          }
          
          :global(.stat-card:hover) {
            transform: scale(1.05) !important;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
          }
          
          .small {
            font-size: 11px !important;
          }
          
          .text-primary {
            color: #034078 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
