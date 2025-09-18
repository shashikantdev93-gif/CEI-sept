import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/main.css";
import Footer from "../../components/Footer/Footer";
import React from 'react';
import { Form, Row, Col, Button, Spinner } from 'react-bootstrap';
import FileUpload from '../../components/FileUpload';
import { useProjectSiteBusinessLogic } from '../../modules/project-site';

const CommonApplicationFormEstablished: React.FC = () => {
  // All business logic is now handled by the useProjectSiteBusinessLogic hook
  const {
    // Form State
    projectSiteApplicationType,
    applicantPanNumber,
    address1,
    address2,
    villageOrTown,
    pinCode,
    state,
    district,
    tehsil,
    isSubmitting,
    panPreviewUrl,
    
    // Form State Setters
    setProjectSiteApplicationType,
    setApplicantPanNumber,
    setAddress1,
    setAddress2,
    setVillageOrTown,
    setState,
    setTehsil,
    
    // Form Validation
    errors,
    
    // Location Management
    districts,
    tehsils,
    locationLoading,
    pincodeValidation,
    
    // Business Logic Functions
    handleSubmit,
    handleFileUploaded,
    handleDistrictChange,
    handlePincodeChange
  } = useProjectSiteBusinessLogic();

  // All business logic is now handled by the useProjectSiteBusinessLogic hook

  return (
    <div className="registeration-bg min-vh-100" style={{ padding: "5px", backgroundColor: "#f8f9fa", marginTop: "80px" }}>
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-10">
            <div className="w-100 d-flex justify-content-center align-items-center" style={{ marginTop: '20px', marginBottom: '10px' }}>
              <h4 className="mb-0 fw-bold text-center" style={{ color: '#0c3064' }}>Common Application Form (Established)</h4>
            </div>

            {/* Progress Bar - Updated for Project Site */}
            <div className="d-flex justify-content-center" style={{ width: "100%" }}>
              <div className="w-90 d-flex align-items-center" style={{ minHeight: "40px", width: "40%" }}>
                {/* Left checkpoint - User (completed) */}
                <div className="d-flex flex-column align-items-center" style={{ width: "40px" }}>
                  <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: "28px", height: "28px" }}>
                    <i className="bi bi-check"></i>
                  </div>
                  <span className="small fw-semibold mt-1" style={{ fontSize: "0.85em" }}>User</span>
                </div>

                {/* Progress line with center checkpoint */}
                <div className="flex-grow-1 position-relative mx-2" style={{ height: "8px" }}>
                  <div style={{
                    position: "absolute",
                    top: "50%",
                    left: 0,
                    right: 0,
                    height: "4px",
                    backgroundColor: "#007bff",
                    transform: "translateY(-50%)",
                    borderRadius: "2px"
                  }}></div>
                </div>

                {/* Right checkpoint - Project Site (current) */}
                <div className="d-flex flex-column align-items-center" style={{ width: "40px" }}>
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: "28px", height: "28px" }}>
                    <i className="bi bi-building"></i>
                  </div>
                  <span className="small fw-semibold mt-1" style={{ fontSize: "0.85em" }}>Project</span>
                </div>
              </div>
            </div>

            <div className="card mt-4" style={{ borderRadius: '15px', border: '1px solid #e0e0e0' }}>
              <div className="card-body p-4">
                <Form onSubmit={handleSubmit}>
                  
                  {/* Section 3: Purpose */}
                  <div className="mb-4">
                    <h5 className="text-primary mb-3">
                      <i className="bi bi-bullseye me-2"></i>
                      3. Purpose
                    </h5>
                    
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            Purpose of Applicant <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Select
                            value={projectSiteApplicationType}
                            onChange={(e) => setProjectSiteApplicationType(e.target.value)}
                            isInvalid={!!errors.projectSiteApplicationType}
                            disabled={isSubmitting}
                          >
                            <option value="">-select-</option>
                            <option value="2">Contractor/Supervisor/Other</option>
                            <option value="1">Wireman License</option>
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            {errors.projectSiteApplicationType}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      
                      <Col md={4} className="mb-1">
                        <Form.Group>
                          <Form.Label className="form-label fw-semibold small">
                            Applicant PAN Number <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            className="form-control-sm"
                            maxLength={10}
                            value={applicantPanNumber}
                            onChange={(e) => setApplicantPanNumber(e.target.value.toUpperCase())}
                            isInvalid={!!errors.applicantPanNumber}
                            placeholder="Enter PAN Number"
                          />
                          {errors.applicantPanNumber && (
                            <div className="text-danger" style={{ fontSize: '12px' }}>
                              {errors.applicantPanNumber}
                            </div>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={4} className="mb-1">
                        <Form.Group>
                          <Form.Label className="form-label fw-semibold small">
                            Applicant PAN Image{" "}
                            <span className="text-muted">(in 'jpg' format less than 1MB)</span>{" "}
                            <span className="text-danger">*</span>
                          </Form.Label>
                          <FileUpload
                            name={"panAttachment" as any}
                            allowedFileTypes=".jpg,.jpeg"
                            onFileUploaded={handleFileUploaded}
                            error={errors.applicantPanAttachment}
                          />
                          {panPreviewUrl && (
                            <div className="mt-2">
                              <img 
                                src={panPreviewUrl}
                                alt="PAN Card Preview"
                                style={{ 
                                  height: '100px', 
                                  maxWidth: '100%',
                                  objectFit: 'contain',
                                  border: '1px solid #ddd',
                                  borderRadius: '4px',
                                  padding: '5px'
                                }}
                              />
                            </div>
                          )}
                          {errors.applicantPanAttachment && (
                            <div className="text-danger" style={{ fontSize: '12px' }}>
                              {errors.applicantPanAttachment}
                            </div>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>

                  {/* Section 4: Office Address */}
                  <div className="mb-4">
                    <h5 className="text-primary mb-3">
                      <i className="bi bi-building me-2"></i>
                      4. Office Address
                    </h5>
                    
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            Address line1 <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter address line1"
                            value={address1}
                            onChange={(e) => setAddress1(e.target.value)}
                            isInvalid={!!errors.address1}
                            disabled={isSubmitting}
                            maxLength={150}
                          />
                          <div className="text-muted small mt-1">
                            Count: {address1.length} / 150
                          </div>
                          <Form.Control.Feedback type="invalid">
                            {errors.address1}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Address line2</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter address line2"
                            value={address2}
                            onChange={(e) => setAddress2(e.target.value)}
                            disabled={isSubmitting}
                            maxLength={150}
                          />
                          <div className="text-muted small mt-1">
                            Count: {address2.length} / 150
                          </div>
                        </Form.Group>
                      </Col>
                      
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Name of village/Town</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter village/town name"
                            value={villageOrTown}
                            onChange={(e) => setVillageOrTown(e.target.value)}
                            disabled={isSubmitting}
                            maxLength={150}
                          />
                          <div className="text-muted small mt-1">
                            Count: {villageOrTown.length} / 150
                          </div>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">State</Form.Label>
                          <Form.Select
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            disabled={true} // Always Punjab
                          >
                            <option value="3">Punjab</option>
                          </Form.Select>
                          <div className="d-flex align-items-center mt-1">
                            <div className="text-danger" style={{ fontSize: '12px' }}>
                              {errors.state}
                            </div>
                          </div>
                        </Form.Group>
                      </Col>
                      
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            District <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Select
                            value={district}
                            onChange={handleDistrictChange}
                            isInvalid={!!errors.district}
                            disabled={isSubmitting || locationLoading}
                          >
                            <option value="">-select-</option>
                            {districts.map((districtItem: any) => (
                              <option key={districtItem.districtCode || districtItem.id} value={districtItem.districtCode || districtItem.id}>
                                {districtItem.districtName || districtItem.name}
                              </option>
                            ))}
                          </Form.Select>
                          <div className="d-flex align-items-center mt-1">
                            {locationLoading && (
                              <Spinner animation="border" size="sm" className="me-2" />
                            )}
                            <div className="text-danger" style={{ fontSize: '12px' }}>
                              {errors.district}
                            </div>
                          </div>
                        </Form.Group>
                      </Col>
                      
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            Tehsil <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Select
                            value={tehsil}
                            onChange={(e) => setTehsil(e.target.value)}
                            isInvalid={!!errors.tehsil}
                            disabled={isSubmitting || locationLoading || !district}
                          >
                            <option value="">-select-</option>
                            {tehsils.map((tehsilItem: any) => (
                              <option key={tehsilItem.tehsilId || tehsilItem.id} value={tehsilItem.tehsilId || tehsilItem.id}>
                                {tehsilItem.tehsilName || tehsilItem.name}
                              </option>
                            ))}
                          </Form.Select>
                          <div className="d-flex align-items-center mt-1">
                            {locationLoading && (
                              <Spinner animation="border" size="sm" className="me-2" />
                            )}
                            <div className="text-danger" style={{ fontSize: '12px' }}>
                              {errors.tehsil}
                            </div>
                          </div>
                        </Form.Group>
                      </Col>
                      
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            Pin Code <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter 6-digit pincode"
                            value={pinCode}
                            onChange={handlePincodeChange}
                            isInvalid={!!errors.pinCode}
                            disabled={isSubmitting}
                            maxLength={6}
                          />
                          <div className="text-muted small mt-1">
                            Count: {pinCode.length} / 6
                          </div>
                          <Form.Control.Feedback type="invalid">
                            {errors.pinCode}
                          </Form.Control.Feedback>
                          {pincodeValidation.isValid && pinCode.length === 6 && (
                            <div className="text-success small mt-1">
                              <i className="bi bi-check-circle me-1"></i>
                              Valid pincode
                            </div>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>

                  {/* Submit Button */}
                  <div className="d-flex justify-content-center mt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={isSubmitting}
                      style={{
                        borderRadius: '25px',
                        padding: '12px 50px',
                        fontSize: '16px',
                        fontWeight: '600',
                        minWidth: '200px'
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Submit
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CommonApplicationFormEstablished;