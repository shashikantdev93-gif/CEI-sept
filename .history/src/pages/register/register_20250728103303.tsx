"use client";

import React, { useState, useEffect } from "react";

import { Container, Row, Col, Card, Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import { useLocation } from '../../hooks/useLocation';


const RegisterationForm: React.FC = () => {
  // Form state
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [faxNo, setFaxNo] = useState("");
  const [email, setEmail] = useState("");
  const [altEmail, setAltEmail] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [villageTown, setVillageTown] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [dob, setDob] = useState("");
  const [state, setState] = useState<string>("3"); // Default to Punjab
  const [district, setDistrict] = useState<number | "">("");
  const [tehsil, setTehsil] = useState<string>("");
  const [photo, setPhoto] = useState("");
  const [signature, setSignature] = useState("");

  // Location hook for dynamic dropdowns
  const {
    states,
    districts,
    tehsils,
    loading,
    errors: locationErrors,
    pincodeValidation,
    loadDistricts,
    loadTehsils,
    validatePincode,
    resetSubLocations,
    resetTehsils
  } = useLocation();

  // Form validation errors
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    fatherName: "",
    mobileNo: "",
    email: "",
    dob: "",
    photo: "",
    signature: "",
    address1: "",
    state:"",
    district: "",
    tehsil: "",
    pinCode: "",
  });

 useEffect(() => {
  // Load districts for Punjab automatically on mount (like Angular ngAfterViewInit)
  console.log('🏘️ [REGISTRATION-FORM] Component mounted, loading districts for Punjab (ID: 3)');
  loadDistricts(3);
}, [loadDistricts]);

  // Handle district change
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtCode = Number(e.target.value); // Convert to number like Angular
    console.log('🏘️ [REGISTRATION-FORM] District changed:', districtCode);
    
    setDistrict(districtCode);
    setTehsil("");
    resetTehsils();

    if (districtCode) {
      console.log('🏘️ [REGISTRATION-FORM] Loading tehsils for district:', districtCode);
      loadTehsils(districtCode); // Pass districtCode directly
    } else {
      console.log('🏘️ [REGISTRATION-FORM] District cleared or invalid, not loading tehsils');
    }
  };

  // Handle pincode change with validation
  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits and limit to 6 characters
    if (/^\d{0,6}$/.test(value)) {
      setPinCode(value);
      
      // Validate when 6 digits are entered
      if (value.length === 6) {
        validatePincode(value);
      }
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: any = {};
    
    // Basic validation
    if (!firstName.trim()) newErrors.firstName = "First Name is required";
    if (!lastName.trim()) newErrors.lastName = "Last Name is required";
    if (!fatherName.trim()) newErrors.fatherName = "Father's Name is required";
    if (!mobileNo.trim()) newErrors.mobileNo = "Mobile No is required";
    if (!email.trim()) newErrors.email = "Email Address is required";
    if (!address1.trim()) newErrors.address1 = "Communication Address Line1 is required";
    if (!dob) newErrors.dob = "Date of Birth is required";
    if (!state) newErrors.state = "State is required";
    if (!district) newErrors.district = "District is required";
    if (!tehsil) newErrors.tehsil = "Tehsil is required";
    if (!photo) newErrors.photo = "Photo is required";
    if (!signature) newErrors.signature = "Signature is required";
    
    // Pincode validation
    if (!pinCode.trim()) {
      newErrors.pinCode = "Pincode is required";
    } else if (!pincodeValidation.isValid) {
      newErrors.pinCode = pincodeValidation.error || "Invalid pincode";
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      // All validations passed
      console.log("Form submitted!");
      console.log({
        firstName,
        middleName,
        lastName,
        fatherName,
        mobileNo,
        faxNo,
        email,
        altEmail,
        address1,
        address2,
        villageTown,
        pinCode,
        dob,
        state,
        district,
        tehsil,
        photo,
        signature
      });
      // TODO: Implement API submission
    }
  };
  return (
    <Container fluid className="min-vh-100 bg-light d-flex align-items-start justify-content-center py-4">
      <Card className="shadow-sm border-0" style={{ width: '80%', maxWidth: '1200px' }}>
        <Card.Body className="p-4">
          {/* Title Section */}
          <div className="text-center mb-4">
            <h5 className="mb-3" style={{ fontSize: '1.25rem', fontWeight: '400', letterSpacing: '0.5px', color: '#000' }}>
              Common Application Form (User Details)
            </h5>
            <div className="d-flex align-items-center justify-content-center mb-4">
              <div className="d-flex align-items-center justify-content-center rounded-circle border border-primary bg-white" 
                   style={{ width: '40px', height: '40px' }}>
                <i className="bi bi-people-fill text-primary" style={{ fontSize: '1.5rem' }}></i>
              </div>
              <div className="flex-grow-1 mx-3" style={{ height: '2px', backgroundColor: '#333' }}></div>
              <div className="d-flex align-items-center justify-content-center rounded-circle border border-primary bg-white" 
                   style={{ width: '40px', height: '40px' }}>
                <i className="bi bi-file-earmark-text text-primary" style={{ fontSize: '1.5rem' }}></i>
              </div>
            </div>
          </div>

          <Form onSubmit={handleSubmit}>
            {/* Applicant Details Section */}
            <div className="mb-4">
              <h5 className="mb-3" style={{ fontSize: '1.25rem', fontWeight: '500', color: 'darkcyan' }}>
                1. Applicant Details
              </h5>
              
              {/* First Row */}
              <Row className="mb-3">
                <Col lg={3} md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: '0.875rem', fontWeight: '400', color: '#000' }}>
                      First Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      maxLength={25}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      isInvalid={!!errors.firstName}
                      style={{ fontSize: '14px', padding: '8px' }}
                    />
                    <div className="d-flex justify-content-between align-items-start mt-1">
                      <div className="text-danger" style={{ fontSize: '12px' }}>
                        {errors.firstName}
                      </div>
                      <small className="text-muted" style={{ fontSize: '12px' }}>
                        Count: {firstName.length} / 25
                      </small>
                    </div>
                  </Form.Group>
                </Col>
                
                <Col lg={3} md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: '0.875rem', fontWeight: '400', color: '#000' }}>
                      Middle Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      maxLength={25}
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                      style={{ fontSize: '14px', padding: '8px' }}
                    />
                    <div className="text-end mt-1">
                      <small className="text-muted" style={{ fontSize: '12px' }}>
                        Count: {middleName.length} / 25
                      </small>
                    </div>
                  </Form.Group>
                </Col>
                
                <Col lg={3} md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: '0.875rem', fontWeight: '400', color: '#000' }}>
                      Last Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      maxLength={25}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      isInvalid={!!errors.lastName}
                      style={{ fontSize: '14px', padding: '8px' }}
                    />
                    <div className="d-flex justify-content-between align-items-start mt-1">
                      <div className="text-danger" style={{ fontSize: '12px' }}>
                        {errors.lastName}
                      </div>
                      <small className="text-muted" style={{ fontSize: '12px' }}>
                        Count: {lastName.length} / 25
                      </small>
                    </div>
                  </Form.Group>
                </Col>
                
                <Col lg={3} md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: '0.875rem', fontWeight: '400', color: '#000' }}>
                      Father's Name of Applicant <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      maxLength={50}
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      isInvalid={!!errors.fatherName}
                      style={{ fontSize: '14px', padding: '8px' }}
                    />
                    <div className="d-flex justify-content-between align-items-start mt-1">
                      <div className="text-danger" style={{ fontSize: '12px' }}>
                        {errors.fatherName}
                      </div>
                      <small className="text-muted" style={{ fontSize: '12px' }}>
                        Count: {fatherName.length} / 50
                      </small>
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              {/* Second Row */}
              <Row className="mb-3">
                <Col lg={3} md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: '0.875rem', fontWeight: '400', color: '#000' }}>
                      Mobile No <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      maxLength={10}
                      value={mobileNo}
                      onChange={(e) => setMobileNo(e.target.value)}
                      isInvalid={!!errors.mobileNo}
                      style={{ fontSize: '14px', padding: '8px' }}
                    />
                    <div className="d-flex justify-content-between align-items-start mt-1">
                      <div className="text-danger" style={{ fontSize: '12px' }}>
                        {errors.mobileNo}
                      </div>
                      <small className="text-muted" style={{ fontSize: '12px' }}>
                        Count: {mobileNo.length} / 10
                      </small>
                    </div>
                  </Form.Group>
                </Col>
                
                <Col lg={3} md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: '0.875rem', fontWeight: '400', color: '#000' }}>
                      Fax No
                    </Form.Label>
                    <Form.Control
                      type="text"
                      maxLength={20}
                      value={faxNo}
                      onChange={(e) => setFaxNo(e.target.value)}
                      style={{ fontSize: '14px', padding: '8px' }}
                    />
                  </Form.Group>
                </Col>
                
                <Col lg={3} md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: '0.875rem', fontWeight: '400', color: '#000' }}>
                      Email Address <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="email"
                      maxLength={50}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      isInvalid={!!errors.email}
                      style={{ fontSize: '14px', padding: '8px' }}
                    />
                    <div className="d-flex justify-content-between align-items-start mt-1">
                      <div className="text-danger" style={{ fontSize: '12px' }}>
                        {errors.email}
                      </div>
                      <small className="text-muted" style={{ fontSize: '12px' }}>
                        Count: {email.length} / 50
                      </small>
                    </div>
                  </Form.Group>
                </Col>
                
                <Col lg={3} md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: '0.875rem', fontWeight: '400', color: '#000' }}>
                      Alternate Email Address
                    </Form.Label>
                    <Form.Control
                      type="email"
                      maxLength={50}
                      value={altEmail}
                      onChange={(e) => setAltEmail(e.target.value)}
                      style={{ fontSize: '14px', padding: '8px' }}
                    />
                    <div className="text-end mt-1">
                      <small className="text-muted" style={{ fontSize: '12px' }}>
                        Count: {altEmail.length} / 50
                      </small>
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              {/* Third Row */}
              <Row className="mb-3">
                <Col lg={3} md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: '0.875rem', fontWeight: '400', color: '#000' }}>
                      Date Of Birth <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      isInvalid={!!errors.dob}
                      style={{ fontSize: '14px', padding: '8px' }}
                    />
                    <div className="text-danger" style={{ fontSize: '12px' }}>
                      {errors.dob}
                    </div>
                  </Form.Group>
                </Col>
                
                <Col lg={4} md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: '0.875rem', fontWeight: '400', color: '#000' }}>
                      Photo of Applicant{" "}
                      <small style={{ fontStyle: 'italic' }}>(in '.jpg' format less than 1MB)</small>{" "}
                      <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="file"
                      accept=".jpg"
                      onChange={(e) => setPhoto(e.target.value)}
                      isInvalid={!!errors.photo}
                      style={{ fontSize: '14px', padding: '8px' }}
                    />
                    <div className="text-danger" style={{ fontSize: '12px' }}>
                      {errors.photo}
                    </div>
                  </Form.Group>
                </Col>
                
                <Col lg={5} md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: '0.875rem', fontWeight: '400', color: '#000' }}>
                      Signature of Applicant{" "}
                      <small style={{ fontStyle: 'italic' }}>(in '.jpg' format less than 1MB)</small>{" "}
                      <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="file"
                      accept=".jpg"
                      onChange={(e) => setSignature(e.target.value)}
                      isInvalid={!!errors.signature}
                      style={{ fontSize: '14px', padding: '8px' }}
                    />
                    <div className="text-danger" style={{ fontSize: '12px' }}>
                      {errors.signature}
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Communication Address Section */}
            <div className="mb-4">
              <h5 className="mb-3" style={{ fontSize: '1.25rem', fontWeight: '500', color: 'darkcyan' }}>
                2. Communication Address
              </h5>
              
              {/* First Row of Address */}
              <Row className="mb-3">
                <Col lg={4} md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: '0.875rem', fontWeight: '400', color: '#000' }}>
                      Address line 1 <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      maxLength={150}
                      value={address1}
                      onChange={(e) => setAddress1(e.target.value)}
                      isInvalid={!!errors.address1}
                      style={{ fontSize: '14px', padding: '8px' }}
                    />
                    <div className="d-flex justify-content-between align-items-start mt-1">
                      <div className="text-danger" style={{ fontSize: '12px' }}>
                        {errors.address1}
                      </div>
                      <small className="text-muted" style={{ fontSize: '12px' }}>
                        Count: {address1.length} / 150
                      </small>
                    </div>
                  </Form.Group>
                </Col>
                
                <Col lg={4} md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: '0.875rem', fontWeight: '400', color: '#000' }}>
                      Address line 2
                    </Form.Label>
                    <Form.Control
                      type="text"
                      maxLength={150}
                      value={address2}
                      onChange={(e) => setAddress2(e.target.value)}
                      style={{ fontSize: '14px', padding: '8px' }}
                    />
                    <div className="text-end mt-1">
                      <small className="text-muted" style={{ fontSize: '12px' }}>
                        Count: {address2.length} / 150
                      </small>
                    </div>
                  </Form.Group>
                </Col>
                
                <Col lg={4} md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: '0.875rem', fontWeight: '400', color: '#000' }}>
                      Name of village/Town
                    </Form.Label>
                    <Form.Control
                      type="text"
                      maxLength={150}
                      value={villageTown}
                      onChange={(e) => setVillageTown(e.target.value)}
                      style={{ fontSize: '14px', padding: '8px' }}
                    />
                    <div className="text-end mt-1">
                      <small className="text-muted" style={{ fontSize: '12px' }}>
                        Count: {villageTown.length} / 150
                      </small>
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              {/* Second Row of Address */}
              <Row className="mb-4">
                <Col lg={3} md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: '0.875rem', fontWeight: '400', color: '#000' }}>
                      State <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      value={state}
                      onChange={e => setState(e.target.value)}
                      isInvalid={!!errors.state}
                      style={{ fontSize: '14px', padding: '8px' }}
                      disabled={false}
                    >
                      <option value="3">Punjab</option>
                    </Form.Select>
                    <div className="d-flex align-items-center mt-1">
                      {loading.states && (
                        <Spinner animation="border" size="sm" className="me-2" />
                      )}
                      <div className="text-danger" style={{ fontSize: '12px' }}>
                        {errors.state || locationErrors.states}
                      </div>
                    </div>
                  </Form.Group>
                </Col>
                
                <Col lg={3} md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: '0.875rem', fontWeight: '400', color: '#000' }}>
                      District <span className="text-danger">*</span>
                    </Form.Label>
                    
                    <Form.Select
                      value={district}
                      onChange={handleDistrictChange}
                      isInvalid={!!errors.district}
                      style={{ fontSize: '14px', padding: '8px' }}
                      disabled={loading.districts || !state}
                    >
                      <option value="">-Select District-</option>
                      {districts.map((districtItem, idx) => (
                        <option key={`${districtItem.districtCode}-${idx}`} value={districtItem.districtCode}>
                          {districtItem.districtName}
                        </option>
                      ))}
                    </Form.Select>
                    {/* Debug info */}
                    {state && (
                      <div style={{ fontSize: '11px', color: '#888' }}>
                        <strong>Debug:</strong> districts.length={districts.length}, loading.districts={String(loading.districts)}
                      </div>
                    )}
                    <div className="d-flex align-items-center mt-1">
                      {loading.districts && (
                        <Spinner animation="border" size="sm" className="me-2" />
                      )}
                      <div className="text-danger" style={{ fontSize: '12px' }}>
                        {errors.district || locationErrors.districts}
                      </div>
                    </div>
                  </Form.Group>
                </Col>
                
                <Col lg={3} md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: '0.875rem', fontWeight: '400', color: '#000' }}>
                      Tehsil <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      value={tehsil}
                      onChange={(e) => setTehsil(e.target.value)}
                      isInvalid={!!errors.tehsil}
                      style={{ fontSize: '14px', padding: '8px' }}
                      disabled={loading.tehsils || !district}
                    >
                      <option value="">-Select Tehsil-</option>
                      {!loading.tehsils && tehsils.length === 0 && district && (
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
                    {/* Debug info */}
                    {district && (
                      <div style={{ fontSize: '11px', color: '#888' }}>
                        <strong>Debug:</strong> tehsils.length={tehsils.length}, loading.tehsils={String(loading.tehsils)}
                      </div>
                    )}
                    <div className="d-flex align-items-center mt-1">
                      {loading.tehsils && (
                        <Spinner animation="border" size="sm" className="me-2" />
                      )}
                      <div className="text-danger" style={{ fontSize: '12px' }}>
                        {errors.tehsil || locationErrors.tehsils}
                      </div>
                    </div>
                  </Form.Group>
                </Col>
                
                <Col lg={3} md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: '0.875rem', fontWeight: '400', color: '#000' }}>
                      Pin Code <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      maxLength={6}
                      value={pinCode}
                      onChange={handlePincodeChange}
                      isInvalid={!!errors.pinCode || (pinCode.length === 6 && !pincodeValidation.isValid)}
                      style={{ fontSize: '14px', padding: '8px' }}
                      placeholder="Enter 6-digit pincode"
                    />
                    <div className="d-flex justify-content-between align-items-start mt-1">
                      <div className="d-flex align-items-center">
                        {pincodeValidation.isValidating && (
                          <Spinner animation="border" size="sm" className="me-2" />
                        )}
                        <div className="text-danger" style={{ fontSize: '12px' }}>
                          {errors.pinCode || (pinCode.length === 6 && pincodeValidation.error)}
                        </div>
                        {pinCode.length === 6 && pincodeValidation.isValid && (
                          <small className="text-success ms-2">✓ Valid</small>
                        )}
                      </div>
                      <small className="text-muted" style={{ fontSize: '12px' }}>
                        Count: {pinCode.length} / 6
                      </small>
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              {/* Submit Button */}
              <Row>
                <Col className="d-flex justify-content-end">
                  <Button
                    type="submit"
                    variant="primary"
                    style={{ 
                      padding: '8px 16px',
                      fontSize: '14px',
                      borderRadius: '4px'
                    }}
                  >
                    Submit
                  </Button>
                </Col>
              </Row>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};
export default RegisterationForm;
