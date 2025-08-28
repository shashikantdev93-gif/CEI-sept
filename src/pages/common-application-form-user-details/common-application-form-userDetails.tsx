import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/main.css";
import { axiosInterceptor } from '../../lib/interceptor';
import Footer from "../../components/Footer/Footer";
import React, { useState, useEffect } from "react";
import { Form, Row, Col, Button, Spinner } from 'react-bootstrap';
import { useLocation } from '../../hooks/useLocation';
import OTPModal from '../../components/modals/OTPModal';
import FileUpload from '../../components/FileUpload';
import encryptionService from '../../lib/encryptionService';
import { useNavigate } from 'react-router-dom';
import DateTimeUtils from '../../utils/dateTimeUtils';



const CommonApplicationFormUserDetails: React.FC = () => {
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
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState("");
  const [signaturePreviewUrl, setSignaturePreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [isMobileNumberVerified, setIsMobileNumberVerified] = useState(false);
  let navigate = useNavigate();

  const handleFileUploaded = (info: { formControlName: string; serverResponse: any }) => {
    console.log('📁 [USER-DETAILS] File upload callback:', info);
    const { formControlName, serverResponse } = info;
    
    const fileName = serverResponse.generatedFileNames.replace(/^,/, "");
    const fileUrl = `${import.meta.env.VITE_UPLOAD_URL}Uploads/Documents/TempFiles/${fileName.trim()}`;
    
    console.log('📁 [USER-DETAILS] Generated file name:', fileName);
    console.log('📁 [USER-DETAILS] Preview URL:', fileUrl);

    if (formControlName === 'profilePhoto') {
      setPhoto(fileName);
      setPhotoPreviewUrl(fileUrl);
    } else {
      setSignature(fileName);
      setSignaturePreviewUrl(fileUrl);
    }
  };


  // Location hook for dynamic dropdowns
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
  // Create token with encrypted values like Angular expects
  const initializeToken = () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('⚠️ [COMMON-APP-USER] No token found, creating initial token...');
      
      // Create token with ALL encrypted values like Angular
      const initialToken = {
        userId: encryptionService.set('1'), 
        token: encryptionService.set('guest_registration_token'), // MUST BE ENCRYPTED!
        userProfileId: encryptionService.set('0'), 
        projectSiteId: encryptionService.set('0'), 
        roleCode: encryptionService.set('GUEST'),
        userName: encryptionService.set('Guest User')
      };
      
      localStorage.setItem('token', JSON.stringify(initialToken));
      
      // IMPORTANT: Also set loginTime and actionTime separately like Angular does
      localStorage.setItem('loginTime', encryptionService.set(new Date().toISOString()));
      localStorage.setItem('actionTime', encryptionService.set(new Date().toISOString()));
      
      console.log('✅ [COMMON-APP-USER] Initial token created with ALL encrypted values');
    } else {
      try {
        const parsedToken = JSON.parse(token);
        console.log('✅ [COMMON-APP-USER] Token exists, checking encryption:', {
          hasUserId: !!parsedToken.userId,
          hasToken: !!parsedToken.token,
          userIdEncrypted: parsedToken.userId?.includes('==') || parsedToken.userId?.includes('+') || parsedToken.userId?.includes('/'),
          tokenEncrypted: parsedToken.token?.includes('==') || parsedToken.token?.includes('+') || parsedToken.token?.includes('/')
        });
        
        // CRITICAL: Check if token.token is encrypted (should contain Base64 characters)
        if (parsedToken.token && !(parsedToken.token.includes('==') || parsedToken.token.includes('+') || parsedToken.token.includes('/'))) {
          console.log('⚠️ [COMMON-APP-USER] Token value not encrypted, encrypting now...');
          console.log('⚠️ [COMMON-APP-USER] Original token value:', parsedToken.token);
          
          // Encrypt the token value
          const encryptedToken = encryptionService.set(parsedToken.token);
          console.log('⚠️ [COMMON-APP-USER] Encrypted token value:', encryptedToken);
          
          parsedToken.token = encryptedToken;
          localStorage.setItem('token', JSON.stringify(parsedToken));
        }
        
        // Ensure loginTime and actionTime exist
        if (!localStorage.getItem('loginTime')) {
          localStorage.setItem('loginTime', encryptionService.set(new Date().toISOString()));
        }
        if (!localStorage.getItem('actionTime')) {
          localStorage.setItem('actionTime', encryptionService.set(new Date().toISOString()));
        }
      } catch (e) {
        console.error('❌ [COMMON-APP-USER] Invalid token format:', e);
        
        // Create new token with all encrypted values
        const newToken = {
          userId: encryptionService.set('1'),
          token: encryptionService.set('guest_registration_token'), // ENCRYPTED!
          userProfileId: encryptionService.set('0'),
          projectSiteId: encryptionService.set('0'),
          roleCode: encryptionService.set('GUEST'),
          userName: encryptionService.set('Guest User')
        };
        
        localStorage.setItem('token', JSON.stringify(newToken));
        localStorage.setItem('loginTime', encryptionService.set(new Date().toISOString()));
        localStorage.setItem('actionTime', encryptionService.set(new Date().toISOString()));
      }
    }
  };

  initializeToken();
}, []);

  useEffect(() => {
    // Load districts for Punjab automatically on mount (like Angular ngAfterViewInit)
    console.log('🏘️ [COMMON-APP-USER-FORM] Component mounted, loading districts for Punjab (ID: 3)');
    loadDistricts(3);
  }, [loadDistricts]);

  // Handle district change
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtCode = Number(e.target.value); // Convert to number like Angular
    console.log('🏘️ [COMMON-APP-USER-FORM] District changed:', districtCode);
    
    setDistrict(districtCode);
    setTehsil("");
    resetTehsils();

    if (districtCode) {
      console.log('🏘️ [COMMON-APP-USER-FORM] Loading tehsils for district:', districtCode);
      loadTehsils(districtCode); // Pass districtCode directly
    } else {
      console.log('🏘️ [COMMON-APP-USER-FORM] District cleared or invalid, not loading tehsils');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔥 [REACT-SUBMIT] === SUBMIT BUTTON CLICKED ===');
    console.log('🔥 [REACT-SUBMIT] Timestamp:', new Date().toISOString());

    const newErrors: any = {};

    // Basic validation matching Angular form validation
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
    
    if (Object.keys(newErrors).length > 0) {
      console.log('❌ [REACT-SUBMIT] Form is invalid, stopping execution');
      console.log('❌ [REACT-SUBMIT] Form errors:', newErrors);
      return;
    }
    
    console.log('✅ [REACT-SUBMIT] Form validation passed');
    
    // Log form values like Angular
    console.log('📋 [REACT-SUBMIT] Form values:', {
      firstName, lastName, fatherName, mobileNo, email, address1, dob, state, district, tehsil
    });
    console.log('📋 [REACT-SUBMIT] Mobile Number:', mobileNo);
    
    // Call Angular's verifyMobileNumber equivalent
    await verifyMobileNumber();
  };

    const verifyMobileNumber = async () => {
  console.log('🔄 [OTP-GEN] Starting OTP generation process');
  
  try {
    const token = JSON.parse(localStorage.getItem('token') || '{}');
    console.log('🔑 [OTP-GEN] Token found:', !!token);

    if (!token.userId) {
      throw new Error('No userId found in token');
    }

    const userId = encryptionService.get(token.userId);
    console.log('👤 [OTP-GEN] Decrypted userId:', userId);

    const payload = {
      mobileNumber: mobileNo,
      userId: parseInt(userId)
    };
    
    console.log('📦 [OTP-GEN] Preparing payload:', payload);

    const response = await axiosInterceptor.post<any>(
      '/ProjectSites/generateOtp',
      payload
    );

    console.log('📦 [OTP-GEN] Raw response:', response);

    // The response.data.data contains the encrypted OTP
    if (response.success && response.data?.data) {
      console.log('🔐 [OTP-GEN] Encrypted data received:', response.data.data);
      
      // Decrypt the response data
      const decryptedData = encryptionService.get(response.data.data);
      console.log('🔓 [OTP-GEN] Decrypted data:', decryptedData);

      try {
        // Parse the decrypted JSON
        const parsedData = JSON.parse(decryptedData);
        console.log('✅ [OTP-GEN] Parsed data:', parsedData);

        if (parsedData.success) {
          console.log('🎉 [OTP-GEN] OTP generated successfully');
          setGeneratedOTP(parsedData.result);
          setShowOTPModal(true);
        } else {
          console.log('❌ [OTP-GEN] Server indicated failure:', parsedData);
          alert(parsedData.message || 'Failed to generate OTP');
        }
      } catch (parseError) {
        console.log('🔑 [OTP-GEN] Using decrypted data directly as OTP');
        // If parsing fails, the decrypted data might be the OTP directly
        setGeneratedOTP(decryptedData);
        setShowOTPModal(true);
      }
    } else {
      console.log('❌ [OTP-GEN] Invalid response structure:', response);
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('❌ [OTP-GEN] Error:', error);
    alert(`Failed to send OTP: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    setIsSubmitting(false);
  }
};

    // Add this function to get client ID (missing from React implementation)
    const getClientId = async () => {
      console.log('🔍 [REACT-FLOW] Getting client ID...');
      
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5143/api';
        const url = `${baseUrl}/CommonApis/getClientId`;
        
        console.log('🌐 [GET-CLIENT-ID] Making request to:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        console.log('🌐 [GET-CLIENT-ID] Response status:', response.status);
        console.log('🌐 [GET-CLIENT-ID] Response ok:', response.ok);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ [GET-CLIENT-ID] Error response:', errorText);
          throw new Error(`Failed to get client ID: ${response.status} - ${errorText}`);
        }

        const clientId = await response.text(); // It seems to return a plain string based on Angular
        console.log('✅ [REACT-FLOW] Client ID received:', clientId);
        console.log('✅ [REACT-FLOW] Client ID type:', typeof clientId);
        console.log('✅ [REACT-FLOW] Client ID length:', clientId.length);
        
        // Store client ID for later use
        localStorage.setItem('clientId', clientId);
        console.log('💾 [REACT-FLOW] Client ID stored in localStorage');
        
        return clientId;
      } catch (error) {
        console.error('❌ [REACT-FLOW] Failed to get client ID:', error);
        throw error;
      }
    };

    // Handle OTP verification success (matches Angular's modal onHidden behavior)
    const handleOTPVerified = async () => {
      console.log('🪟 [REACT-MODAL] Modal hidden/closed');
      console.log('🪟 [REACT-MODAL] Mobile number verified:', true);
      console.log('✅ [REACT-MODAL] Mobile verification successful, calling getClientId then save()...');
      
      setShowOTPModal(false);
      setIsMobileNumberVerified(true);
      
      try {
        // Get client ID first (as seen in Angular flow)
        console.log('🔍 [REACT-FLOW] Step 1: Getting client ID before save...');
        const clientId = await getClientId();
        console.log('🔑 [REACT-FLOW] Step 2: Got client ID, proceeding with save...');
        
        // Call save() after getting client ID like Angular does
        await save();
      } catch (error) {
        console.error('❌ [REACT-FLOW] Failed in handleOTPVerified:', error);
        alert('Failed to process verification. Please try again.');
        setIsSubmitting(false);
      }
    };

    const debugTokenFormat = () => {
  const token = localStorage.getItem('token');
  if (token) {
    const parsed = JSON.parse(token);
    console.log('🔍 [DEBUG-TOKEN] Full token object:', parsed);
    console.log('🔍 [DEBUG-TOKEN] Token encryption check:', {
      userId: {
        value: parsed.userId,
        length: parsed.userId?.length,
        isEncrypted: parsed.userId?.includes('==') || parsed.userId?.includes('+') || parsed.userId?.includes('/')
      },
      token: {
        value: parsed.token?.substring(0, 50) + '...',
        length: parsed.token?.length,
        isEncrypted: parsed.token?.includes('==') || parsed.token?.includes('+') || parsed.token?.includes('/')
      }
    });
  }
  
  console.log('🔍 [DEBUG-TOKEN] LoginTime:', localStorage.getItem('loginTime'));
  console.log('🔍 [DEBUG-TOKEN] ActionTime:', localStorage.getItem('actionTime'));
};

    // saving userDetails 
  const save = async () => {
  try {
    console.log('💾 [SAVE] Starting user details submission');
    debugTokenFormat();
    setIsSubmitting(true);

    // Get client IP from stored clientId (like Angular does)
    let clientIP = "::1"; // default
    try {
      const clientIdData = localStorage.getItem('clientId');
      if (clientIdData) {
        const parsed = JSON.parse(clientIdData);
        clientIP = parsed.ip || clientIP;
      }
    } catch (e) {
      console.log('📱 [SAVE] Using default client IP');
    }

    const formData = {
      firstName,
      middleName: middleName || '',
      lastName,
      fatherName,
      mobileNo,
      faxNo: faxNo || '',
      email,
      alternateEmail: altEmail || '',
      dateofbirth: DateTimeUtils.convertLocalDateToUtc(dob), // Use DateTimeUtils for proper UTC conversion
      profilePhoto: photo,
      signature,
      commuAddress1: address1,
      commuAddress2: address2 || '',
      commuVillageOrTown: villageTown || '',
      commuState: parseInt(state),
      commuDistrictRefId: parseInt(district.toString()),
      commuTehsilRefId: parseInt(tehsil),
      commuPinCode: parseInt(pinCode),
      applicationCategoryUserType: 1,
      isActive: true,
      isDelete: false,
      createdOnDate: DateTimeUtils.getCurrentUtcIsoString(), // Use DateTimeUtils for UTC timestamp
      lastModifiedOnDate: DateTimeUtils.getCurrentUtcIsoString(), // Use DateTimeUtils for UTC timestamp
      userRefId: parseInt(encryptionService.get(JSON.parse(localStorage.getItem('token') || '{}').userId)),
      clientIPAddress: clientIP
    };

    // Format all DateTime fields for PostgreSQL compatibility
    const pgFormattedData = DateTimeUtils.formatFormDataForPostgreSQL(formData);

    console.log('📦 [SAVE] Form data prepared (unwrapped):', pgFormattedData);

    // IMPORTANT: Send pgFormattedData with proper UTC timestamps, let interceptor handle wrapping + encryption
    const response = await axiosInterceptor.post<any>(
      '/UserDetails/addUpdate_UserDetails',
      pgFormattedData  // Use PostgreSQL-formatted data with UTC timestamps
    );

    if (response.success) {
      if (response.data?.applicationInitiateResponse?.userProfileId) {
        const updatedToken = JSON.parse(localStorage.getItem('token') || '{}');
        updatedToken.userProfileId = encryptionService.set(
          response.data.applicationInitiateResponse.userProfileId.toString()
        );
        localStorage.setItem('token', JSON.stringify(updatedToken));
      }

      console.log('✅ [SAVE] User details saved successfully');
      navigate('/dashboard/caf/projectSite');
    } else {
      throw new Error(response.error || 'Failed to save user details');
    }
  } catch (error) {
    console.error('❌ [SAVE] Error:', error);
    alert(`Failed to save user details: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    setIsSubmitting(false);
  }
};


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
                            {loading.states && (
                              <Spinner animation="border" size="sm" className="me-2" />
                            )}
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
                            disabled={loading.districts || !state}
                          >
                            <option value="">-Select District-</option>
                            {districts.map((districtItem, idx) => (
                              <option key={`${districtItem.districtCode}-${idx}`} value={districtItem.districtCode}>
                                {districtItem.districtName}
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
