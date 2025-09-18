import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/main.css";
import Footer from "../../components/Footer/Footer";
import React from "react";
import { Form, Row, Col, Button, Spinner } from 'react-bootstrap';
import OTPModal from '../../components/modals/OTPModal';
import FileUpload from '../../components/FileUpload';
import { useUserDetailsBusinessLogic } from '../../modules/user-details';



const CommonApplicationFormUserDetails: React.FC = () => {
  const {
    // Form State
    firstName, setFirstName,
    middleName, setMiddleName,
    lastName, setLastName,
    fatherName, setFatherName,
    mobileNo, setMobileNo,
    faxNo, setFaxNo,
    email, setEmail,
    altEmail, setAltEmail,
    address1, setAddress1,
    address2, setAddress2,
    villageTown, setVillageTown,
  pinCode,
  dob, setDob,
  state, setState,
  district,
  tehsil, setTehsil,
    photoPreviewUrl,
    signaturePreviewUrl,
    isSubmitting,
    showOTPModal, setShowOTPModal,
    generatedOTP,
    // Form Validation
    errors,
    // Business Logic Functions
    handleSubmit,
    handleFileUploaded,
    handleDistrictChange,
    handlePincodeChange,
    handleOTPVerified,
    // Location data
    districts,
    tehsils,
    loading,
    locationErrors,
    pincodeValidation
  } = useUserDetailsBusinessLogic();

  return (
    <div className="registeration-bg min-vh-100" style={{ padding: "5px", backgroundColor: "#f8f9fa", marginTop: "80px" }}>
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-10">
            <div className="w-100 d-flex justify-content-center align-items-center" style={{ marginTop: '20px', marginBottom: '10px' }}>
              <h4 className="mb-0 fw-bold text-center" style={{ color: '#0c3064' }}>Common Application Form (User Details)</h4>
            </div>

            {/* Progress Bar */}
            <div className="d-flex justify-content-center" style={{ width: "100%" }}>
              <div className="w-90 d-flex align-items-center" style={{ minHeight: "40px", width: "40%" }}>
                {/* Left checkpoint */}
                <div className="d-flex flex-column align-items-center" style={{ width: "40px" }}>
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: "28px", height: "28px" }}>
                    <i className="bi bi-person-fill"></i>
                  </div>
                  <span className="small fw-semibold mt-1" style={{ fontSize: "0.85em" }}>User</span>
                </div>

                {/* Progress line with center checkpoint */}
                <div className="flex-grow-1 position-relative mx-2" style={{ height: "8px" }}>
                  {/* Line */}
                  <div style={{
                    position: "absolute",
                    top: "50%",
                    left: 0,
                    right: 0,
                    height: "4px",
                    background: "#0c3064",
                    transform: "translateY(-50%)"
                  }} />

                  {/* Fill left side till center checkpoint */}
                  <div style={{
                    position: "absolute",
                    top: "50%",
                    left: 0,
                    width: "50%",
                    height: "4px",
                    background: "linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)",
                    borderRadius: "2px",
                    transform: "translateY(-50%)"
                  }} />

                  {/* Center checkpoint */}
                  <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)"
                  }}>
                    <div className="bg-white border border-primary rounded-circle" style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ width: "10px", height: "10px", background: "#0c3064", borderRadius: "50%", display: "block" }}></span>
                    </div>
                  </div>
                </div>
                
                {/* Right checkpoint */}
                <div className="d-flex flex-column align-items-center" style={{ width: "40px" }}>
                  <div className="bg-light border border-primary text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: "28px", height: "28px" }}>
                    <i className="bi bi-file-earmark-text"></i>
                  </div>
                  <span className="small fw-semibold mt-1" style={{ fontSize: "0.85em" }}>Form</span>
                </div>
              </div>
            </div>

            {/* Form Section*/}
            <div className="card border-0 shadow-sm mb-1">
              <div className="card-body p-1">
                <Form onSubmit={handleSubmit}>
                  {/* Applicant Details Section */}
                  <div className="mb-1">
                    <h6 className="mb-1 fw-bold" style={{ color: '#0c3064' }}>
                      <i className="bi bi-person-circle me-2"></i>1. Applicant Details
                    </h6>
                    
                    {/* First Row */}
                    <Row className="g-2 mb-1">
                      <Col md={3} className="mb-1">
                        <Form.Group>
                          <Form.Label className="form-label fw-semibold small">
                            First Name <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            className="form-control-sm"
                            maxLength={25}
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            isInvalid={!!errors.firstName}
                          />
                          {errors.firstName && <div className="text-danger" style={{ fontSize: '12px' }}>{errors.firstName}</div>}
                        </Form.Group>
                      </Col>
                      
                      <Col md={3} className="mb-1">
                        <Form.Group>
                          <Form.Label className="form-label fw-semibold small">
                            Middle Name
                          </Form.Label>
                          <Form.Control
                            type="text"
                            className="form-control-sm"
                            maxLength={25}
                            value={middleName}
                            onChange={(e) => setMiddleName(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      
                      <Col md={3} className="mb-1">
                        <Form.Group>
                          <Form.Label className="form-label fw-semibold small">
                            Last Name <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            className="form-control-sm"
                            maxLength={25}
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            isInvalid={!!errors.lastName}
                          />
                          {errors.lastName && <div className="text-danger" style={{ fontSize: '12px' }}>{errors.lastName}</div>}
                        </Form.Group>
                      </Col>
                      
                      <Col md={3} className="mb-1">
                        <Form.Group>
                          <Form.Label className="form-label fw-semibold small">
                            Father's Name of Applicant <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            className="form-control-sm"
                            maxLength={50}
                            value={fatherName}
                            onChange={(e) => setFatherName(e.target.value)}
                            isInvalid={!!errors.fatherName}
                          />
                          {errors.fatherName && <div className="text-danger" style={{ fontSize: '12px' }}>{errors.fatherName}</div>}
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Second Row */}
                    <Row className="g-2 mb-2 mt-1">
                      <Col md={3} className="mb-1">
                        <Form.Group>
                          <Form.Label className="form-label fw-semibold small">
                            Mobile No <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            className="form-control-sm"
                            maxLength={10}
                            value={mobileNo}
                            onChange={(e) => setMobileNo(e.target.value)}
                            isInvalid={!!errors.mobileNo}
                          />
                          {errors.mobileNo && <div className="text-danger" style={{ fontSize: '12px' }}>{errors.mobileNo}</div>}
                        </Form.Group>
                      </Col>
                      
                      <Col md={3} className="mb-1">
                        <Form.Group>
                          <Form.Label className="form-label fw-semibold small">
                            Fax No
                          </Form.Label>
                          <Form.Control
                            type="text"
                            className="form-control-sm"
                            maxLength={20}
                            value={faxNo}
                            onChange={(e) => setFaxNo(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      
                      <Col md={3} className="mb-1">
                        <Form.Group>
                          <Form.Label className="form-label fw-semibold small">
                            Email Address <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="email"
                            className="form-control-sm"
                            maxLength={50}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            isInvalid={!!errors.email}
                          />
                          {errors.email && <div className="text-danger" style={{ fontSize: '12px' }}>{errors.email}</div>}
                        </Form.Group>
                      </Col>
                      
                      <Col md={3} className="mb-1">
                        <Form.Group>
                          <Form.Label className="form-label fw-semibold small">
                            Alternate Email Address
                          </Form.Label>
                          <Form.Control
                            type="email"
                            className="form-control-sm"
                            maxLength={50}
                            value={altEmail}
                            onChange={(e) => setAltEmail(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Third Row */}
                    <Row className="g-2 mb-3 mt-1">
                      <Col md={3} className="mb-1">
                        <Form.Group>
                          <Form.Label className="form-label fw-semibold small">
                            Date Of Birth <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="date"
                            className="form-control-sm"
                            placeholder="mm/dd/yyyy"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            isInvalid={!!errors.dob}
                          />
                          {errors.dob && <div className="text-danger" style={{ fontSize: '12px' }}>{errors.dob}</div>}
                        </Form.Group>
                      </Col>
                      
                      <Col md={4} className="mb-1">
                        <Form.Group>
                          <Form.Label className="form-label fw-semibold small">
                            Applicant's Photo{" "}
                            <span className="text-muted">(in 'jpg' format less than 1MB)</span>{" "}
                            <span className="text-danger">*</span>
                          </Form.Label>
                          <FileUpload
                            name="profilePhoto"
                            allowedFileTypes=".jpg,.jpeg"
                            onFileUploaded={handleFileUploaded}
                            error={errors.photo}
                          />
                          {photoPreviewUrl && (
                            <img 
                              src={photoPreviewUrl}
                              alt="Profile Preview"
                              style={{ height: '100px', marginTop: '10px' }}
                            />
                          )}
                        </Form.Group>

                      </Col>
                      <Col md={5} className="mb-1">
                        <Form.Group>
                          <Form.Label className="form-label fw-semibold small">
                            Applicant's Signature{" "}
                            <span className="text-muted">(in 'jpg' format less than 1MB)</span>{" "}
                            <span className="text-danger">*</span>
                          </Form.Label>
                          <FileUpload
                            name="signature"
                            allowedFileTypes=".jpg,.jpeg"
                            onFileUploaded={handleFileUploaded}
                            error={errors.signature}
                          />
                          {signaturePreviewUrl && (
                            <img 
                              src={signaturePreviewUrl}
                              alt="Signature Preview"
                              style={{ height: '50px', marginTop: '10px' }}
                            />
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                  
                  {/* Communication Address Section */}
                  <div className="mb-1">
                    <h6 className="mb-1 mt-4 fw-bold" style={{ color: '#0c3064' }}>
                      <i className="bi bi-geo-alt me-2"></i>2. Communication Address
                    </h6>
                    
                    {/* First Row of Address */}
                    <Row className="g-2 mb-3">
                      <Col md={4} className="mb-1">
                        <Form.Group>
                          <Form.Label className="form-label fw-semibold small">
                            Address line 1 <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            className="form-control-sm"
                            maxLength={150}
                            value={address1}
                            onChange={(e) => setAddress1(e.target.value)}
                            isInvalid={!!errors.address1}
                          />
                          {errors.address1 && <div className="text-danger" style={{ fontSize: '12px' }}>{errors.address1}</div>}
                        </Form.Group>
                      </Col>
                      
                      <Col md={4} className="mb-1">
                        <Form.Group>
                          <Form.Label className="form-label fw-semibold small">
                            Address line 2
                          </Form.Label>
                          <Form.Control
                            type="text"
                            className="form-control-sm"
                            maxLength={150}
                            value={address2}
                            onChange={(e) => setAddress2(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      
                      <Col md={4} className="mb-1">
                        <Form.Group>
                          <Form.Label className="form-label fw-semibold small">
                            Name of village/Town
                          </Form.Label>
                          <Form.Control
                            type="text"
                            className="form-control-sm"
                            maxLength={150}
                            value={villageTown}
                            onChange={(e) => setVillageTown(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Second Row of Address */}
                    <Row className="g-2 mb-3">
                      <Col md={3} className="mb-1">
                        <Form.Group>
                          <Form.Label className="form-label fw-semibold small">
                            State <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Select
                            className="form-select-sm"
                            value={state}
                            onChange={e => setState(e.target.value)}
                            isInvalid={!!errors.state}
                            disabled={false}
                          >
                            <option value="3">Punjab</option>
                          </Form.Select>
                          <div className="d-flex align-items-center mt-1">
                            {loading && <Spinner animation="border" size="sm" className="me-2" />}
                            <div className="text-danger" style={{ fontSize: '12px' }}>
                              {errors.state || locationErrors.states}
                            </div>
                          </div>
                        </Form.Group>
                      </Col>
                      
                      <Col md={3} className="mb-1">
                        <Form.Group>
                          <Form.Label className="form-label fw-semibold small">
                            District <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Select
                            className="form-select-sm"
                            value={district}
                            onChange={handleDistrictChange}
                            isInvalid={!!errors.district}
                            disabled={loading || !state}
                          >
                            <option value="">-Select District-</option>
                            {districts.map((districtItem, idx) => (
                              <option key={`${districtItem.districtCode}-${idx}`} value={districtItem.districtCode}>
                                {districtItem.districtName}
                              </option>
                            ))}
                          </Form.Select>
                          <div className="d-flex align-items-center mt-1">
                            {loading && <Spinner animation="border" size="sm" className="me-2" />}
                            <div className="text-danger" style={{ fontSize: '12px' }}>
                              {errors.district || locationErrors.districts}
                            </div>
                          </div>
                        </Form.Group>
                      </Col>
                      
                      <Col md={3} className="mb-1">
                        <Form.Group>
                          <Form.Label className="form-label fw-semibold small">
                            Tehsil <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Select
                            className="form-select-sm"
                            value={tehsil}
                            onChange={(e) => setTehsil(e.target.value)}
                            isInvalid={!!errors.tehsil}
                            disabled={loading || !district}
                          >
                            <option value="">-Select Tehsil-</option>
                            {!loading && tehsils.length === 0 && district && (
                              <option value="" disabled>
                                No tehsils found for this district
                              </option>
                            )}
                            {tehsils.map((tehsilItem, idx) => (
                              <option key={`${tehsilItem.tehsilId}-${idx}`} value={tehsilItem.tehsilId}>
                                {tehsilItem.tehsilName}
                              </option>
                            ))}
                          </Form.Select>
                          <div className="d-flex align-items-center mt-1">
                            {loading && <Spinner animation="border" size="sm" className="me-2" />}
                            <div className="text-danger" style={{ fontSize: '12px' }}>
                              {errors.tehsil || locationErrors.tehsils}
                            </div>
                          </div>
                        </Form.Group>
                      </Col>
                      
                      <Col md={3} className="mb-1">
                        <Form.Group>
                          <Form.Label className="form-label fw-semibold small">
                            Pin Code <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            className="form-control-sm"
                            maxLength={6}
                            value={pinCode}
                            onChange={handlePincodeChange}
                            isInvalid={!!errors.pinCode || (pinCode.length === 6 && !pincodeValidation.isValid)}
                            placeholder="Enter 6-digit pincode"
                          />
                          <div className="d-flex justify-content-between align-items-start mt-1">
                            <div className="d-flex align-items-center">
                              {/* If you want to show a spinner for pincode validation, add a flag to the hook's return type */}
                              <div className="text-danger" style={{ fontSize: '12px' }}>
                                {errors.pinCode || (pinCode.length === 6 && pincodeValidation.error)}
                              </div>
                              {pinCode.length === 6 && pincodeValidation.isValid && (
                                <small className="text-success ms-2">✓ Valid</small>
                              )}
                            </div>
                          </div>
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Submit Button */}
                    <Row>
                      <Col className="d-grid gap-2">
                        <Button
                          type="submit"
                          variant="primary"
                          disabled={isSubmitting}
                          style={{ backgroundColor: '#007bff', border: 'none' }}
                        >
                          {isSubmitting ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              {showOTPModal ? 'Processing...' : 'Submitting...'}
                            </>
                          ) : (
                            'Submit'
                          )}
                        </Button>
                      </Col>
                    </Row>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* OTP Modal*/}
        <OTPModal
                show={showOTPModal}
                onHide={() => setShowOTPModal(false)}
                mobileNumber={mobileNo}
                sentFrom="Verify Mobile Number"
                generatedOtp={generatedOTP}
                onVerificationSuccess={handleOTPVerified} // Just call save, no OTP param
              />
            </div>
  );
};

export default CommonApplicationFormUserDetails;
