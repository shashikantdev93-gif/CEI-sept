import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/main.css";
import Footer from "../../components/Footer/Footer";
import React, { useState, useEffect } from "react";
import { useLocation } from '../../hooks/useLocation';

const RegisterationForm: React.FC = () => {
  const [toasts, setToasts] = useState<Record<string, boolean>>({});
  
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

  // Handle input changes with toast functionality
  const handleInputChange = (fieldName: string, value: string, maxLength: number) => {
    // Update the corresponding state based on field name
    switch(fieldName) {
      case 'firstName':
        setFirstName(value);
        break;
      case 'middleName':
        setMiddleName(value);
        break;
      case 'lastName':
        setLastName(value);
        break;
      case 'fatherName':
        setFatherName(value);
        break;
      case 'mobile':
        setMobileNo(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'altEmail':
        setAltEmail(value);
        break;
      case 'address1':
        setAddress1(value);
        break;
      case 'address2':
        setAddress2(value);
        break;
      case 'village':
        setVillageTown(value);
        break;
      case 'pincode':
        setPinCode(value);
        break;
      default:
        break;
    }

    // Handle character limit toast
    if (value.length >= maxLength) {
      setToasts(prev => ({ ...prev, [fieldName]: true }));
      setTimeout(() => {
        setToasts(prev => ({ ...prev, [fieldName]: false }));
      }, 2000);
    } else {
      setToasts(prev => ({ ...prev, [fieldName]: false }));
    }
  };

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
  const renderToast = (fieldName: string, maxLength: number) => {
    return toasts[fieldName] ? (
      <div 
        className="alert alert-sm mt-1 py-1 px-2" 
        style={{ 
          fontSize: '1em',
          position: 'absolute',
          zIndex: 1000,
          width: '70%',
          top: '100%',
          left: 0,
          backgroundColor: '#e20000',
          color: 'white',
          border: 'none',
        }}
      >
        Maximum {maxLength} characters allowed
      </div>
    ) : null;
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

            {/* Form Section */}
            <form onSubmit={handleSubmit}>
              <div className="card border-0 shadow-sm mb-1">
                <div className="card-body p-1">
                  {/* Section 1: Applicant Details */}
                  <h6 className="mb-1 fw-bold" style={{ color: '#0c3064' }}>
                    <i className="bi bi-person-circle me-2"></i>1. Applicant Details
                  </h6>
                  <div className="row g-2 mb-1">
                    <div className="col-md-3" style={{ position: 'relative' }}>
                      <label className="form-label fw-semibold small">First Name *</label>
                      <input 
                        type="text" 
                        className={`form-control form-control-sm ${errors.firstName ? 'is-invalid' : ''}`}
                        maxLength={25}
                        value={firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value, 25)}
                      />
                      {renderToast('firstName', 25)}
                      {errors.firstName && <div className="text-danger" style={{ fontSize: '12px' }}>{errors.firstName}</div>}
                    </div>
                    <div className="col-md-3" style={{ position: 'relative' }}>
                      <label className="form-label fw-semibold small">Middle Name</label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm" 
                        maxLength={25}
                        value={middleName}
                        onChange={(e) => handleInputChange('middleName', e.target.value, 25)}
                      />
                      {renderToast('middleName', 25)}
                    </div>
                    <div className="col-md-3" style={{ position: 'relative' }}>
                      <label className="form-label fw-semibold small">Last Name *</label>
                      <input 
                        type="text" 
                        className={`form-control form-control-sm ${errors.lastName ? 'is-invalid' : ''}`}
                        maxLength={25}
                        value={lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value, 25)}
                      />
                      {renderToast('lastName', 25)}
                      {errors.lastName && <div className="text-danger" style={{ fontSize: '12px' }}>{errors.lastName}</div>}
                    </div>
                    <div className="col-md-3" style={{ position: 'relative' }}>
                      <label className="form-label fw-semibold small">Father's Name of Applicant *</label>
                      <input 
                        type="text" 
                        className={`form-control form-control-sm ${errors.fatherName ? 'is-invalid' : ''}`}
                        maxLength={50}
                        value={fatherName}
                        onChange={(e) => handleInputChange('fatherName', e.target.value, 50)}
                      />
                      {renderToast('fatherName', 50)}
                      {errors.fatherName && <div className="text-danger" style={{ fontSize: '12px' }}>{errors.fatherName}</div>}
                    </div>
                  </div>
                  
                  <div className="row g-2 mb-2 mt-1">
                    <div className="col-md-3" style={{ position: 'relative' }}>
                      <label className="form-label fw-semibold small">Mobile No *</label>
                      <input 
                        type="text" 
                        className={`form-control form-control-sm ${errors.mobileNo ? 'is-invalid' : ''}`}
                        maxLength={10}
                        value={mobileNo}
                        onChange={(e) => handleInputChange('mobile', e.target.value, 10)}
                      />
                      {renderToast('mobile', 10)}
                      {errors.mobileNo && <div className="text-danger" style={{ fontSize: '12px' }}>{errors.mobileNo}</div>}
                    </div>
                    <div className="col-md-3">
                      <label className="form-label fw-semibold small">Fax No</label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm"
                        value={faxNo}
                        onChange={(e) => setFaxNo(e.target.value)}
                      />
                    </div>
                    <div className="col-md-3" style={{ position: 'relative' }}>
                      <label className="form-label fw-semibold small">Email Address *</label>
                      <input 
                        type="email" 
                        className={`form-control form-control-sm ${errors.email ? 'is-invalid' : ''}`}
                        maxLength={50}
                        value={email}
                        onChange={(e) => handleInputChange('email', e.target.value, 50)}
                      />
                      {renderToast('email', 50)}
                      {errors.email && <div className="text-danger" style={{ fontSize: '12px' }}>{errors.email}</div>}
                    </div>
                    <div className="col-md-3" style={{ position: 'relative' }}>
                      <label className="form-label fw-semibold small">Alternate Email Address</label>
                      <input 
                        type="email" 
                        className="form-control form-control-sm" 
                        maxLength={50}
                        value={altEmail}
                        onChange={(e) => handleInputChange('altEmail', e.target.value, 50)}
                      />
                      {renderToast('altEmail', 50)}
                    </div>
                  </div>
                  
                  <div className="row g-2 mb-3 mt-1">
                    <div className="col-md-3">
                      <label className="form-label fw-semibold small">Date Of Birth *</label>
                      <input 
                        type="date" 
                        className={`form-control form-control-sm ${errors.dob ? 'is-invalid' : ''}`}
                        placeholder="mm/dd/yyyy"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                      />
                      {errors.dob && <div className="text-danger" style={{ fontSize: '12px' }}>{errors.dob}</div>}
                    </div>
                    <div className="col-md-3">
                      <label className="form-label fw-semibold small">Applicant's Photo <span className="text-muted">(in 'jpg' format less than 1MB)</span> *</label>
                      <input 
                        type="file" 
                        className={`form-control form-control-sm ${errors.photo ? 'is-invalid' : ''}`}
                        accept=".jpg,.jpeg"
                        onChange={(e) => setPhoto(e.target.value)}
                      />
                      {errors.photo && <div className="text-danger" style={{ fontSize: '12px' }}>{errors.photo}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">
                        Applicant's Signature
                        <span className="text-muted"> (in 'jpg' format less than 1MB)</span> *
                      </label>
                      <input 
                        type="file" 
                        className={`form-control form-control-sm ${errors.signature ? 'is-invalid' : ''}`}
                        accept=".jpg,.jpeg"
                        onChange={(e) => setSignature(e.target.value)}
                      />
                      {errors.signature && <div className="text-danger" style={{ fontSize: '12px' }}>{errors.signature}</div>}
                    </div>
                  </div>
                  
                  {/* Section 2: Communication Address */}
                  <h6 className="mb-1 mt-4 fw-bold" style={{ color: '#0c3064' }}>
                    <i className="bi bi-geo-alt me-2"></i>2. Communication Address
                  </h6>
                  <div className="row g-2 mb-3">
                    <div className="col-md-4" style={{ position: 'relative' }}>
                      <label className="form-label fw-semibold small">Address line 1 *</label>
                      <input 
                        type="text" 
                        className={`form-control form-control-sm ${errors.address1 ? 'is-invalid' : ''}`}
                        maxLength={150}
                        value={address1}
                        onChange={(e) => handleInputChange('address1', e.target.value, 150)}
                      />
                      {renderToast('address1', 150)}
                      {errors.address1 && <div className="text-danger" style={{ fontSize: '12px' }}>{errors.address1}</div>}
                    </div>
                    <div className="col-md-4" style={{ position: 'relative' }}>
                      <label className="form-label fw-semibold small">Address line 2</label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm" 
                        maxLength={150}
                        value={address2}
                        onChange={(e) => handleInputChange('address2', e.target.value, 150)}
                      />
                      {renderToast('address2', 150)}
                    </div>
                    <div className="col-md-4" style={{ position: 'relative' }}>
                      <label className="form-label fw-semibold small">Name of village/Town</label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm" 
                        maxLength={150}
                        value={villageTown}
                        onChange={(e) => handleInputChange('village', e.target.value, 150)}
                      />
                      {renderToast('village', 150)}
                    </div>
                  </div>
                  
                  <div className="row g-2 mb-3">
                    <div className="col-md-3">
                      <label className="form-label fw-semibold small">State *</label>
                      <select 
                        className={`form-select form-select-sm ${errors.state ? 'is-invalid' : ''}`}
                        value={state}
                        onChange={e => setState(e.target.value)}
                        disabled={false}
                      >
                        <option value="3">Punjab</option>
                      </select>
                      <div className="d-flex align-items-center mt-1">
                        {loading.states && (
                          <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                        )}
                        <div className="text-danger" style={{ fontSize: '12px' }}>
                          {errors.state || locationErrors.states}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label fw-semibold small">District *</label>
                      <select 
                        className={`form-select form-select-sm ${errors.district ? 'is-invalid' : ''}`}
                        value={district}
                        onChange={handleDistrictChange}
                        disabled={loading.districts || !state}
                      >
                        <option value="">-Select District-</option>
                        {districts.map((districtItem, idx) => (
                          <option key={`${districtItem.districtCode}-${idx}`} value={districtItem.districtCode}>
                            {districtItem.districtName}
                          </option>
                        ))}
                      </select>
                      <div className="d-flex align-items-center mt-1">
                        {loading.districts && (
                          <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                        )}
                        <div className="text-danger" style={{ fontSize: '12px' }}>
                          {errors.district || locationErrors.districts}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label fw-semibold small">Tehsil *</label>
                      <select 
                        className={`form-select form-select-sm ${errors.tehsil ? 'is-invalid' : ''}`}
                        value={tehsil}
                        onChange={(e) => setTehsil(e.target.value)}
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
                      </select>
                      <div className="d-flex align-items-center mt-1">
                        {loading.tehsils && (
                          <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                        )}
                        <div className="text-danger" style={{ fontSize: '12px' }}>
                          {errors.tehsil || locationErrors.tehsils}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3" style={{ position: 'relative' }}>
                      <label className="form-label fw-semibold small">Pin Code *</label>
                      <input 
                        type="text" 
                        className={`form-control form-control-sm ${errors.pinCode || (pinCode.length === 6 && !pincodeValidation.isValid) ? 'is-invalid' : ''}`}
                        placeholder="Enter 6-digit pincode" 
                        maxLength={6}
                        value={pinCode}
                        onChange={handlePincodeChange}
                      />
                      <div className="d-flex justify-content-between align-items-start mt-1">
                        <div className="d-flex align-items-center">
                          {pincodeValidation.isValidating && (
                            <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                          )}
                          <div className="text-danger" style={{ fontSize: '12px' }}>
                            {errors.pinCode || (pinCode.length === 6 && pincodeValidation.error)}
                          </div>
                          {pinCode.length === 6 && pincodeValidation.isValid && (
                            <small className="text-success ms-2">✓ Valid</small>
                          )}
                        </div>
                      </div>
                      {renderToast('pincode', 6)}
                    </div>
                  </div>
                  
                  <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#007bff', border: 'none' }}>
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RegisterationForm;