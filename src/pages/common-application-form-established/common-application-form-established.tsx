import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/main.css";
import Footer from "../../components/Footer/Footer";
import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Spinner } from 'react-bootstrap';
import { useLocation } from '../../hooks/useLocation';
import encryptionService from '../../lib/encryptionService';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../../components/FileUpload';
import { axiosInterceptor } from '../../lib/interceptor'; // Add this import
import DateTimeUtils from '../../utils/dateTimeUtils'; // Add this import

const CommonApplicationFormEstablished: React.FC = () => {
  // Form state for Common Application Form (Established)
  const [projectSiteApplicationType, setProjectSiteApplicationType] = useState("");
  const [applicantPanNumber, setApplicantPanNumber] = useState("");
  const [applicantPanAttachment, setApplicantPanAttachment] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [villageOrTown, setVillageOrTown] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [state, setState] = useState<string>("3"); // Default to Punjab
  const [district, setDistrict] = useState<number | "">("");
  const [tehsil, setTehsil] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [panPreviewUrl, setPanPreviewUrl] = useState(""); 
  
  let navigate = useNavigate();

  const handleFileUploaded = (info: { formControlName: string; serverResponse: any }) => {
    console.log('📁 [ESTABLISHED-FORM] File upload callback:', info);
    const { formControlName, serverResponse } = info;
    
    const fileName = serverResponse.generatedFileNames.replace(/^,/, "");
    const fileUrl = `${import.meta.env.VITE_UPLOAD_URL}Uploads/Documents/TempFiles/${fileName.trim()}`;
    
    console.log('📁 [ESTABLISHED-FORM] Generated file name:', fileName);
    console.log('📁 [ESTABLISHED-FORM] Preview URL:', fileUrl);

    if (formControlName === 'panAttachment') {
      setApplicantPanAttachment(fileName);
      setPanPreviewUrl(fileUrl);
      console.log('📁 [ESTABLISHED-FORM] PAN attachment updated:', fileName);
    }
  };

  // Location hook for dynamic dropdowns (reusing from register)
  const {
    districts,
    tehsils,
    loading,
    errors: locationErrors,
    pincodeValidation,
    loadDistricts,
    loadTehsils,
    validatePincode,
    resetTehsils
  } = useLocation();

  // Form validation errors
  const [errors, setErrors] = useState({
    projectSiteApplicationType: "",
    applicantPanNumber: "",
    applicantPanAttachment: "",
    address1: "",
    state: "",
    district: "",
    tehsil: "",
    pinCode: "",
  });

  useEffect(() => {
    // Load districts for Punjab automatically on mount (like register.tsx)
    console.log('🏢 [COMMON-APP-ESTABLISHED] Component mounted, loading districts for Punjab (ID: 3)');
    loadDistricts(3);
  }, [loadDistricts]);

  // Handle district change (reusing logic from register)
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtCode = Number(e.target.value);
    console.log('🏢 [COMMON-APP-ESTABLISHED] District changed:', districtCode);
    
    setDistrict(districtCode);
    setTehsil("");
    resetTehsils();

    if (districtCode) {
      console.log('🏢 [COMMON-APP-ESTABLISHED] Loading tehsils for district:', districtCode);
      loadTehsils(districtCode);
    } else {
      console.log('🏢 [COMMON-APP-ESTABLISHED] District cleared or invalid, not loading tehsils');
    }
  };

  // Handle pincode change with validation (reusing from register)
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

  // Handle PAN number change (format validation)
  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    // PAN format: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)
    if (/^[A-Z]{0,5}[0-9]{0,4}[A-Z]?$/.test(value) && value.length <= 10) {
      setApplicantPanNumber(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🏢 [COMMON-APP-ESTABLISHED] === FORM SUBMISSION STARTED ===');
    setIsSubmitting(true);

    const newErrors: any = {};

    // Basic validation
    if (!projectSiteApplicationType.trim()) newErrors.projectSiteApplicationType = "Application Type is required";
    if (!applicantPanNumber.trim()) newErrors.applicantPanNumber = "PAN Number is required";
    if (!applicantPanAttachment.trim()) newErrors.applicantPanAttachment = "PAN Attachment is required";
    if (!address1.trim()) newErrors.address1 = "Address Line 1 is required";
    if (!state) newErrors.state = "State is required";
    if (!district) newErrors.district = "District is required";
    if (!tehsil) newErrors.tehsil = "Tehsil is required";
    
    // PAN validation
    if (applicantPanNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(applicantPanNumber)) {
      newErrors.applicantPanNumber = "Invalid PAN format (e.g., ABCDE1234F)";
    }
    
    // Pincode validation
    if (!pinCode.trim()) {
      newErrors.pinCode = "Pincode is required";
    } else if (!pincodeValidation.isValid) {
      newErrors.pinCode = pincodeValidation.error || "Invalid pincode";
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      console.log('✅ [ESTABLISHED-SUBMIT] Form validation passed');
      console.log('✅ [ESTABLISHED-SUBMIT] Calling save...');
      await save();
    } else {
      console.log('❌ [ESTABLISHED-SUBMIT] Form validation failed:', newErrors);
      setIsSubmitting(false);
    }
  };

  // Updated save function using axiosInterceptor (like UserDetails form)
  const save = async () => {
  try {
    console.log('💾 [ESTABLISHED-SAVE] Starting project site submission');
    console.log('💾 [ESTABLISHED-SAVE] Timestamp:', new Date().toISOString());

    // Step 1: Check for duplicate PAN using axiosInterceptor
    console.log('🔍 [ESTABLISHED-SAVE] Checking duplicate PAN...');
    try {
      const panCheckResponse = await axiosInterceptor.get<any>(
        `/ProjectSites/getProjectSitesPanDetails?panno=${applicantPanNumber}`
      );
      
      console.log('🔍 [ESTABLISHED-SAVE] PAN check result:', panCheckResponse);
      
      if (panCheckResponse.success && panCheckResponse.data?.formModel !== null) {
        alert('PAN Number already exists, please try different PAN Number');
        setIsSubmitting(false);
        return;
      }
    } catch (panError) {
      console.log('🔍 [ESTABLISHED-SAVE] PAN check failed, continuing anyway:', panError);
      // Continue with save if PAN check fails
    }

    // Step 2: Get client IP from stored clientId
    let clientIP = "::1"; // default
    try {
      const clientIdData = localStorage.getItem('clientId');
      if (clientIdData) {
        const parsed = JSON.parse(clientIdData);
        clientIP = parsed.ip || clientIP;
      }
    } catch (e) {
      console.log('📱 [ESTABLISHED-SAVE] Using default client IP');
    }

    // Step 3: Prepare form data - FIX THE STRUCTURE
    const token = JSON.parse(localStorage.getItem('token') || '{}');
    
    if (!token.userId) {
      throw new Error('No userId found in token');
    }
    
    const userRefId = parseInt(encryptionService.get(token.userId));
    const projectSiteId = token.projectSiteId ? parseInt(encryptionService.get(token.projectSiteId)) : 0;
    
    console.log('🔑 [ESTABLISHED-SAVE] Decrypted userRefId:', userRefId);
    console.log('🔑 [ESTABLISHED-SAVE] Decrypted projectSiteId:', projectSiteId);
    
    // FIX: Use the exact same structure as Angular version
    const formData = {
      ProjectSiteApplicationType: parseInt(projectSiteApplicationType), // PascalCase
      ApplicantPanNumber: applicantPanNumber, // PascalCase
      ApplicantPanAttachment: applicantPanAttachment, // PascalCase
      Address1: address1, // PascalCase
      Address2: address2 || '', // PascalCase
      VillageOrTown: villageOrTown || '', // PascalCase
      PinCode: parseInt(pinCode), // PascalCase
      State: parseInt(state), // PascalCase
      DistrictRefId: parseInt(district.toString()), // PascalCase
      TehsilRefId: parseInt(tehsil), // PascalCase
      IsActive: true, // PascalCase
      IsDelete: false, // PascalCase
      CreatedOnDate: new Date().toISOString(), // Use standard ISO string
      LastModifiedOnDate: new Date().toISOString(), // PascalCase
      UserRefId: userRefId, // PascalCase
      ProjectSiteId: projectSiteId, // PascalCase
      ClientIPAddress: clientIP // PascalCase
    };

    // Format all DateTime fields for PostgreSQL compatibility
    console.log('📦 [ESTABLISHED-SAVE] Clean form data (no duplicates):', formData);

    // Step 4: FIX THE API ENDPOINT - Use singular form
    const response = await axiosInterceptor.post<any>(
      '/ProjectSites/addUpdate_ProjectSites',
      formData
    );

    console.log('✅ [ESTABLISHED-SAVE-RESPONSE] === API RESPONSE RECEIVED ===');
    console.log('✅ [ESTABLISHED-SAVE-RESPONSE] Raw response:', response);
    
    if (response.success) {
      // FIX: Check the actual response structure and update token properly
      console.log('✅ [ESTABLISHED-SAVE] Response data structure:', response.data);
      
      // Update token with new projectSiteId - check different possible response structures
      let newProjectSiteId = null;
      
      if (response.data?.applicationInitiateResponse?.projectSiteId) {
        newProjectSiteId = response.data.applicationInitiateResponse.projectSiteId;
      } else if (response.data?.projectSiteId) {
        newProjectSiteId = response.data.projectSiteId;
      } else if (response.data?.data?.projectSiteId) {
        newProjectSiteId = response.data.data.projectSiteId;
      } else if (response.data?.formModel?.projectSiteId) {
        newProjectSiteId = response.data.formModel.projectSiteId;
      }
      
      console.log('✅ [ESTABLISHED-SAVE] Extracted projectSiteId:', newProjectSiteId);
      
      if (newProjectSiteId) {
        const token = JSON.parse(localStorage.getItem('token') || '{}');
        token.projectSiteId = encryptionService.set(newProjectSiteId.toString());
        localStorage.setItem('token', JSON.stringify(token));
        console.log('✅ [ESTABLISHED-SAVE] Token updated with projectSiteId:', newProjectSiteId);
        
        // Force a slight delay before navigation to ensure token is updated
        setTimeout(() => {
          console.log('✅ [ESTABLISHED-SAVE] Navigating to dashboard...');
          navigate('/dashboard');
        }, 100);
      } else {
        console.log('⚠️ [ESTABLISHED-SAVE] No projectSiteId found in response, navigating anyway');
        navigate('/dashboard');
      }
    } else {
      throw new Error(response.error || 'Failed to save project site');
    }
  } catch (error) {
    console.error('❌ [ESTABLISHED-SAVE] Error:', error);
    
    // Enhanced error handling to show exact error
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      console.error('❌ [ESTABLISHED-SAVE] Axios error response:', axiosError.response?.data);
      console.error('❌ [ESTABLISHED-SAVE] Axios error status:', axiosError.response?.status);
      console.error('❌ [ESTABLISHED-SAVE] Axios error headers:', axiosError.response?.headers);
      
      // Show more specific error message
      const errorMessage = axiosError.response?.data?.message || 
                          axiosError.response?.data?.error || 
                          axiosError.message || 
                          'Unknown error occurred';
      alert(`Failed to save project site details: ${errorMessage}`);
    } else {
      alert(`Failed to save project site details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  } finally {
    console.log('🏁 [ESTABLISHED-SAVE] Setting isSubmitting to false');
    setIsSubmitting(false);
  }
};

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
                            {loading.states && (
                              <Spinner animation="border" size="sm" className="me-2" />
                            )}
                            <div className="text-danger" style={{ fontSize: '12px' }}>
                              {errors.state || locationErrors.states}
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
                            disabled={isSubmitting || loading.districts}
                          >
                            <option value="">-select-</option>
                            {districts.map((district) => (
                              <option key={district.districtCode} value={district.districtCode}>
                                {district.districtName}
                              </option>
                            ))}
                          </Form.Select>
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
                      
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            Tehsil <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Select
                            value={tehsil}
                            onChange={(e) => setTehsil(e.target.value)}
                            isInvalid={!!errors.tehsil}
                            disabled={isSubmitting || loading.tehsils || !district}
                          >
                            <option value="">-select-</option>
                            {tehsils.map((tehsil) => (
                              <option key={tehsil.tehsilId} value={tehsil.tehsilId}>
                                {tehsil.tehsilName}
                              </option>
                            ))}
                          </Form.Select>
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