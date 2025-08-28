import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/main.css";
import Footer from "../../components/Footer/Footer";
import { useState } from "react";

const Login = () => {
  const [toasts, setToasts] = useState<Record<string, boolean>>({});

  const handleInputChange = (fieldName: string, value: string, maxLength: number) => {
    if (value.length >= maxLength) {
      setToasts(prev => ({ ...prev, [fieldName]: true }));
      setTimeout(() => {
        setToasts(prev => ({ ...prev, [fieldName]: false }));
      }, 3000);
    } else {
      setToasts(prev => ({ ...prev, [fieldName]: false }));
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
            <div className="card border-0 shadow-sm mb-2">
              <div className="card-body p-3">
                {/* Section 1: Applicant Details */}
                <h6 className="mb-1 fw-bold" style={{ color: '#0c3064' }}>
                  <i className="bi bi-person-circle me-2"></i>1. Applicant Details
                </h6>
                <div className="row g-2 mb-2">
                  <div className="col-md-3" style={{ position: 'relative' }}>
                    <label className="form-label fw-semibold small">First Name *</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      maxLength={25}
                      onChange={(e) => handleInputChange('firstName', e.target.value, 25)}
                    />
                    {renderToast('firstName', 25)}
                  </div>
                  <div className="col-md-3" style={{ position: 'relative' }}>
                    <label className="form-label fw-semibold small">Middle Name</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      maxLength={25}
                      onChange={(e) => handleInputChange('middleName', e.target.value, 25)}
                    />
                    {renderToast('middleName', 25)}
                  </div>
                  <div className="col-md-3" style={{ position: 'relative' }}>
                    <label className="form-label fw-semibold small">Last Name *</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      maxLength={25}
                      onChange={(e) => handleInputChange('lastName', e.target.value, 25)}
                    />
                    {renderToast('lastName', 25)}
                  </div>
                  <div className="col-md-3" style={{ position: 'relative' }}>
                    <label className="form-label fw-semibold small">Father's Name of Applicant *</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      maxLength={50}
                      onChange={(e) => handleInputChange('fatherName', e.target.value, 50)}
                    />
                    {renderToast('fatherName', 50)}
                  </div>
                </div>
                
                <div className="row g-2 mb-2 mt-1">
                  <div className="col-md-3" style={{ position: 'relative' }}>
                    <label className="form-label fw-semibold small">Mobile No *</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      maxLength={10}
                      onChange={(e) => handleInputChange('mobile', e.target.value, 10)}
                    />
                    {renderToast('mobile', 10)}
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold small">Fax No</label>
                    <input type="text" className="form-control form-control-sm" />
                  </div>
                  <div className="col-md-3" style={{ position: 'relative' }}>
                    <label className="form-label fw-semibold small">Email Address *</label>
                    <input 
                      type="email" 
                      className="form-control form-control-sm" 
                      maxLength={50}
                      onChange={(e) => handleInputChange('email', e.target.value, 50)}
                    />
                    {renderToast('email', 50)}
                  </div>
                  <div className="col-md-3" style={{ position: 'relative' }}>
                    <label className="form-label fw-semibold small">Alternate Email Address</label>
                    <input 
                      type="email" 
                      className="form-control form-control-sm" 
                      maxLength={50}
                      onChange={(e) => handleInputChange('altEmail', e.target.value, 50)}
                    />
                    {renderToast('altEmail', 50)}
                  </div>
                </div>
                
                <div className="row g-2 mb-3 mt-1">
                  <div className="col-md-3">
                    <label className="form-label fw-semibold small">Date Of Birth *</label>
                    <input type="date" className="form-control form-control-sm" placeholder="mm/dd/yyyy" />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold small">Applicant's Photo <span className="text-muted">(in 'jpg' format less than 1MB)</span> *</label>
                    <input type="file" className="form-control form-control-sm" accept=".jpg,.jpeg" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">
                      Applicant's Signature
                      <span className="text-muted"> (in 'jpg' format less than 1MB)</span> *
                    </label>
                    <input type="file" className="form-control form-control-sm" accept=".jpg,.jpeg" />
                  </div>
                </div>
                
                {/* Section 2: Communication Address */}
                <h6 className="mb-1 mt-2 fw-bold" style={{ color: '#0c3064' }}>
                  <i className="bi bi-geo-alt me-2"></i>2. Communication Address
                </h6>
                <div className="row g-2 mb-3">
                  <div className="col-md-4" style={{ position: 'relative' }}>
                    <label className="form-label fw-semibold small">Address line 1 *</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      maxLength={150}
                      onChange={(e) => handleInputChange('address1', e.target.value, 150)}
                    />
                    {renderToast('address1', 150)}
                  </div>
                  <div className="col-md-4" style={{ position: 'relative' }}>
                    <label className="form-label fw-semibold small">Address line 2</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      maxLength={150}
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
                      onChange={(e) => handleInputChange('village', e.target.value, 150)}
                    />
                    {renderToast('village', 150)}
                  </div>
                </div>
                
                <div className="row g-2 mb-3">
                  <div className="col-md-3">
                    <label className="form-label fw-semibold small">State *</label>
                    <select className="form-select form-select-sm">
                      <option value="Punjab">Punjab</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold small">District *</label>
                    <select className="form-select form-select-sm">
                      <option value="">-Select District-</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold small">Tehsil *</label>
                    <select className="form-select form-select-sm">
                      <option value="">-Select Tehsil-</option>
                    </select>
                  </div>
                  <div className="col-md-3" style={{ position: 'relative' }}>
                    <label className="form-label fw-semibold small">Pin Code *</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      placeholder="Enter 6-digit pincode" 
                      maxLength={6}
                      onChange={(e) => handleInputChange('pincode', e.target.value, 6)}
                    />
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
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;