import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const SupervisorRegistration: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
 
    console.log('SupervisorRegistration - Cleaning up navigation flags');
    sessionStorage.removeItem('allowSupervisorRegistrationNavigation');
    
    return () => {

      sessionStorage.removeItem('allowSupervisorRegistrationNavigation');
    };
  }, []);


  const [name, setName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [panNo, setPanNo] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [hasCertificateFromOtherState, setHasCertificateFromOtherState] = useState("No");
  const [selectedExperience, setSelectedExperience] = useState("");


  const handleBack = () => {
    navigate(-1);
  };


  const handleSaveAndNext = () => {

    console.log('Saving supervisor registration and proceeding to next step...');
    

    sessionStorage.setItem('allowUploadSupervisorDocumentNavigation', 'true');
    console.log('SupervisorRegistration - Set allowUploadSupervisorDocumentNavigation flag');
    

    navigate('/dashboard/ProjectDetails/applicationForm/supervisor-registration/upload-supervisor-document');
  };

  const steps = [
    { number: 1, icon: "bi-person", title: "Supervisor Information", active: true },
    
    { number: 2, icon: "bi-upload", title: "Upload", active: false }
  ];

  return (
    <div className="supervisor-form-container min-vh-100 bg-light" style={{ paddingTop: '80px' }}>
      <Container fluid className="px-0" style={{ maxWidth: '1200px' }}>
        
        {/* Header Card */}
        <Card className="border-0 shadow-sm mb-1 mx-auto" style={{ width: '95%' }}>
          <Card.Body className="p-1">
            <div className="d-flex align-items-center justify-content-between">
              <h5 className="mb-0 fw-semibold text-primary text-center w-100">Supervisor Information (New)</h5>
            </div>
            <div className="border-0 shadow-sm mb-1 mt-4 mx-auto" style={{ width: '65%' }}>
              <div className="p-1">
                <div className="d-flex justify-content-between align-items-center position-relative">
                  
                 
                  <div
                    className="position-absolute w-100"
                    style={{
                      height: '1px',
                      backgroundColor: '#000000',
                      top: '50%',
                      zIndex: 1,
                    }}
                  ></div>

               
                  <div
                    className="position-absolute"
                    style={{
                      height: '4px',
                      backgroundColor: '#007bff',
                      width: '0%',
                      top: '50%',
                      zIndex: 2,
                      transition: 'width 0.3s ease',
                    }}
                  ></div>

                
                  {steps.map((step) => (
                    <div
                      key={step.number}
                      className="d-flex flex-column align-items-center position-relative"
                      style={{ zIndex: 3 }}
                    >
                      <div
                        className={`rounded-circle d-flex align-items-center justify-content-center ${
                          step.active ? 'bg-primary text-white' : 'bg-light text-muted'
                        }`}
                        style={{
                          width: '40px',
                          height: '40px',
                          fontSize: '14px',
                          border: step.active ? 'none' : '1px solid #000000' 
                        }}
                      >
                        <i className={step.icon}></i>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </Card.Body>
        </Card>

 
        <Card className="border-0 shadow-sm mx-auto" style={{ width: '95%' }}>
          <Card.Body className="p-4">
            
            {/* Supervisor Information Section */}
            <div className="supervisor-details-section mb-4 p-4 bg-light border rounded">
              <div className="section-header mb-4 pb-2 border-bottom">
                <h6 className="text-primary fw-semibold mb-0">
                  <i className="bi bi-person me-2"></i>
                  Supervisor Information
                </h6>
              </div>

              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="form-label fw-semibold text-dark">Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter full name"
                      className="form-control border-2"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="form-label fw-semibold text-dark">Father Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      placeholder="Enter father's name"
                      className="form-control border-2"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-3 mt-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="form-label fw-semibold text-dark">PAN NO</Form.Label>
                    <Form.Control
                      type="text"
                      value={panNo}
                      onChange={(e) => setPanNo(e.target.value)}
                      placeholder="Enter PAN number"
                      className="form-control border-2"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="form-label fw-semibold text-dark">Date Of Birth</Form.Label>
                    <Form.Control
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="form-control border-2"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-3 mt-2">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="form-label fw-semibold text-dark">Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter complete address"
                      className="form-control border-2"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-3 mt-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="form-label fw-semibold text-dark">Mobile Number</Form.Label>
                    <Form.Control
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="Enter mobile number"
                      className="form-control border-2"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="form-label fw-semibold text-dark">Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="form-control border-2"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-3 mt-2">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="form-label fw-semibold text-dark">Do you hold Supervisor certificate from the other state</Form.Label>
                    <Form.Select
                      value={hasCertificateFromOtherState}
                      onChange={(e) => setHasCertificateFromOtherState(e.target.value)}
                      className="form-select border-2"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </div>

       
            <div className="experience-section mb-4 p-4 bg-light border rounded">
              <div className="section-header mb-4 pb-2 border-bottom">
                <h6 className="text-primary fw-semibold mb-0">
                  <i className="bi bi-briefcase me-2"></i>
                  Required Practical Experience in any of the given fields as given below
                </h6>
              </div>

              <div className="experience-content p-3 bg-white border rounded">
                <Form.Group>
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex align-items-start">
                      <Form.Check
                        type="radio"
                        name="experience"
                        id="experience1"
                        value="two_years_electrician"
                        checked={selectedExperience === "two_years_electrician"}
                        onChange={(e) => setSelectedExperience(e.target.value)}
                        className="me-3 mt-1"
                      />
                      <div className="d-flex align-items-start flex-grow-1">
                        <i className="me-2 mt-1"></i>
                        <span className="text-dark">
                          <strong>Two Years</strong> of working experience as an Electrician Incharge in factory having Electric Installation of aggregate capacity of not less than 50 KW.
                        </span>
                      </div>
                    </div>

                    <div className="d-flex align-items-start">
                      <Form.Check
                        type="radio"
                        name="experience"
                        id="experience2"
                        value="one_year_contractor"
                        checked={selectedExperience === "one_year_contractor"}
                        onChange={(e) => setSelectedExperience(e.target.value)}
                        className="me-3 mt-1"
                      />
                      <div className="d-flex align-items-start flex-grow-1">
                        <i className="me-2 mt-1"></i>
                        <span className="text-dark">
                          <strong>One year</strong> of working experience with 'A' Class Government approved Electrical Contractor for rectifying common defects in Electrical & Power Installations
                        </span>
                      </div>
                    </div>

                    <div className="d-flex align-items-start">
                      <Form.Check
                        type="radio"
                        name="experience"
                        id="experience3"
                        value="one_year_pwd"
                        checked={selectedExperience === "one_year_pwd"}
                        onChange={(e) => setSelectedExperience(e.target.value)}
                        className="me-3 mt-1"
                      />
                      <div className="d-flex align-items-start flex-grow-1">
                        <i className="me-2 mt-1"></i>
                        <span className="text-dark">
                          <strong>One year</strong> of working experience in Electrical branch of PWD or under the Punjab State Electricity Corporation Limited or Military Engineering service.
                        </span>
                      </div>
                    </div>

                    <div className="d-flex align-items-start">
                      <Form.Check
                        type="radio"
                        name="experience"
                        id="experience4"
                        value="one_year_instructor"
                        checked={selectedExperience === "one_year_instructor"}
                        onChange={(e) => setSelectedExperience(e.target.value)}
                        className="me-3 mt-1"
                      />
                      <div className="d-flex align-items-start flex-grow-1">
                        <i className="me-2 mt-1"></i>
                        <span className="text-dark">
                          <strong>One year</strong> as an instructor (in Electrical Engineering subjects) in an institution whose Diploma or Certificates recognised for exemption from appearing in the Supervisor Examination.
                        </span>
                      </div>
                    </div>

                    <div className="d-flex align-items-start">
                      <Form.Check
                        type="radio"
                        name="experience"
                        id="experience5"
                        value="one_year_administration"
                        checked={selectedExperience === "one_year_administration"}
                        onChange={(e) => setSelectedExperience(e.target.value)}
                        className="me-3 mt-1"
                      />
                      <div className="d-flex align-items-start flex-grow-1">
                        <i className="me-2 mt-1"></i>
                        <span className="text-dark">
                          <strong>One year</strong> in the administration of Electricity law in Electrical inspectorate of any State or Central Government.
                        </span>
                      </div>
                    </div>
                  </div>
                </Form.Group>
              </div>
            </div>

    
            <div className="d-flex justify-content-between mt-4">
              <Button 
                variant="outline-secondary" 
                onClick={handleBack}
                className="btn-outline-secondary fw-semibold"
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSaveAndNext}
                className="btn-primary fw-semibold"
              >
                Save & Next
                <i className="bi bi-arrow-right ms-2"></i>
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>

      <style>{`
        .supervisor-form-container {
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        /* Focus states for better accessibility */
        .form-control:focus,
        .form-select:focus {
          border-color: #0d6efd !important;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
        }

        /* Bold radio button borders */
        .form-check-input {
          border: 2px solid #6c757d !important;
          border-width: 2px !important;
        }

        .form-check-input:checked {
          background-color: #0d6efd !important;
          border-color: #0d6efd !important;
          border-width: 2px !important;
        }

        .form-check-input:focus {
          border-color: #0d6efd !important;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
          border-width: 2px !important;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .supervisor-form-container {
            padding-top: 60px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SupervisorRegistration;
