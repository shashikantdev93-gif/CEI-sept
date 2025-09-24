import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useEnhancedFormValidation } from '../../hooks/useEnhancedFormValidation';
import { FormValidators } from '../../utils/validators';
import { axiosInterceptor } from '../../lib/interceptor';

// User details form data interface
interface UserDetailsFormData {
  selectionType: 'email' | 'mobile';
  email: string;
  mobile: string;
}

// User details response interface
interface UserDetailsResponse {
  formModel: {
    firstName: string;
    middleName?: string;
    lastName: string;
    fatherName: string;
    mobileNo: string;
    alternateMobileNo?: string;
    email: string;
    alternateEmail?: string;
    dateOfBirth: string;
    faxNo?: string;
    commuAddress1: string;
    commuAddress2?: string;
    commuVillageOrTown: string;
    commuDistrict: string;
    commuTehsil: string;
    commuPinCode: string;
    userProfileMapping: {
      users: {
        userName: string;
      };
    };
  };
}

const UserDetails: React.FC = () => {
  // Form state
  const [formData, setFormData] = useState<UserDetailsFormData>({
    selectionType: 'email',
    email: '',
    mobile: '',
  });

  // User details state
  const [userDetails, setUserDetails] = useState<UserDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Enhanced form validation
  const { validateForm, handleFieldChange, handleFieldBlur, validationState } = useEnhancedFormValidation<UserDetailsFormData>({
    validationRules: {
      email: [
        { 
          validator: FormValidators.required,
          when: (formData) => formData.selectionType === 'email'
        },
        { 
          validator: FormValidators.email,
          when: (formData) => formData.selectionType === 'email' && formData.email.length > 0
        }
      ],
      mobile: [
        { 
          validator: FormValidators.required,
          when: (formData) => formData.selectionType === 'mobile'
        },
        { 
          validator: (value: string) => {
            const mobilePattern = /^[0-9]{10}$/;
            if (!mobilePattern.test(value)) {
              return { isValid: false, error: 'Please enter a valid 10-digit mobile number' };
            }
            return { isValid: true };
          },
          when: (formData) => formData.selectionType === 'mobile' && formData.mobile.length > 0
        }
      ],
    },
    mode: 'onChange'
  });

  // Handle input mode change (email/mobile)
  const handleInputModeChange = (selectionType: 'email' | 'mobile') => {
    const newFormData = {
      ...formData,
      selectionType,
      // Clear the other field when switching modes
      ...(selectionType === 'email' ? { mobile: '' } : { email: '' })
    };
    setFormData(newFormData);
    setError(null);
    setUserDetails(null); // Clear previous results
  };

  // Handle form field changes
  const handleInputChange = (fieldName: keyof UserDetailsFormData, value: string) => {
    const newFormData = { ...formData, [fieldName]: value };
    setFormData(newFormData);
    handleFieldChange(fieldName, value, newFormData);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationResult = validateForm(formData);
    if (!validationResult.isValid) {
      console.log('❌ [USER-DETAILS] Form validation failed:', validationResult.errors);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 [USER-DETAILS] Fetching user details:', {
        selectionType: formData.selectionType,
        email: formData.selectionType === 'email' ? formData.email : undefined,
        mobile: formData.selectionType === 'mobile' ? formData.mobile : undefined,
      });

      const response = await axiosInterceptor.get<UserDetailsResponse>('/UserDetails/getUserDetails_ByEmailPhone', {
        params: {
          email: formData.selectionType === 'email' ? formData.email : '',
          phoneNo: formData.selectionType === 'mobile' ? formData.mobile : '',
        }
      });

      if (response.success && response.data) {
        setUserDetails(response.data);
        console.log('✅ [USER-DETAILS] User details retrieved successfully');
      } else {
        setError('No user data found for the provided information');
        console.log('ℹ️ [USER-DETAILS] No user data found');
      }
    } catch (err: any) {
      console.error('❌ [USER-DETAILS] Error fetching user details:', err);
      setError(err.message || 'Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
    } catch {
      return dateString;
    }
  };

  return (
    <Container className="mt-5">
      <Card className="shadow-sm">
        <Card.Body className="shadow-lg">
          <h6 className="text-center mb-4" style={{ fontSize: '1.2rem' }}>
            User Details
          </h6>

          {/* Search Form */}
          <div className="p-3 shadow-sm rounded mb-4">
            <Form onSubmit={handleSubmit}>
              <Row>
                {/* Radio Button Selection */}
                <Row className="mb-3">
                  <Col md={12}>
                    <div className="form-check form-check-inline">
                      <input
                        type="radio"
                        id="emailRadio"
                        className="form-check-input"
                        checked={formData.selectionType === 'email'}
                        onChange={() => handleInputModeChange('email')}
                      />
                      <label className="form-check-label" htmlFor="emailRadio">
                        Email Address
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        type="radio"
                        id="mobileRadio"
                        className="form-check-input"
                        checked={formData.selectionType === 'mobile'}
                        onChange={() => handleInputModeChange('mobile')}
                      />
                      <label className="form-check-label" htmlFor="mobileRadio">
                        Mobile Number
                      </label>
                    </div>
                  </Col>
                </Row>

                {/* Email Input */}
                {formData.selectionType === 'email' && (
                  <Col md={5}>
                    <Form.Label className="required">Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      onBlur={() => handleFieldBlur('email', formData.email, formData)}
                      isInvalid={!!validationState.errors.email}
                      placeholder="Enter email address"
                      style={{ fontSize: '0.8rem', fontWeight: 400 }}
                    />
                    {validationState.errors.email && (
                      <Form.Control.Feedback type="invalid">
                        {validationState.errors.email}
                      </Form.Control.Feedback>
                    )}
                  </Col>
                )}

                {/* Mobile Input */}
                {formData.selectionType === 'mobile' && (
                  <Col md={5}>
                    <Form.Label className="required">Mobile Number</Form.Label>
                    <Form.Control
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => handleInputChange('mobile', e.target.value)}
                      onBlur={() => handleFieldBlur('mobile', formData.mobile, formData)}
                      isInvalid={!!validationState.errors.mobile}
                      placeholder="Enter 10-digit mobile number"
                      style={{ fontSize: '0.8rem', fontWeight: 400 }}
                    />
                    {validationState.errors.mobile && (
                      <Form.Control.Feedback type="invalid">
                        {validationState.errors.mobile}
                      </Form.Control.Feedback>
                    )}
                  </Col>
                )}

                {/* Submit Button */}
                <Col md={2} className="mt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="mt-1"
                    style={{ borderRadius: '0px', fontSize: '12px' }}
                  >
                    {loading ? 'Loading...' : 'Get User Details'}
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* User Details Display */}
          {userDetails?.formModel ? (
            <Card className="shadow-sm mb-3 p-3">
              <Card.Body>
                <Card.Title>
                  <i className="fa-solid fa-user"></i>{' '}
                  {`${userDetails.formModel.firstName} ${userDetails.formModel.middleName || ''} ${userDetails.formModel.lastName}`.trim()}
                </Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {userDetails.formModel.userProfileMapping?.users?.userName}
                </Card.Subtitle>

                <ul className="list-group list-group-flush p-2">
                  <li className="list-group-item">
                    <strong>Father Name:</strong> {userDetails.formModel.fatherName}
                  </li>
                  <li className="list-group-item">
                    <strong>Mobile Number:</strong> {userDetails.formModel.mobileNo}
                  </li>
                  <li className="list-group-item">
                    <strong>Alternate Mobile No:</strong>{' '}
                    <span className={userDetails.formModel.alternateMobileNo ? '' : 'text-muted'}>
                      {userDetails.formModel.alternateMobileNo || 'N/A'}
                    </span>
                  </li>
                  <li className="list-group-item">
                    <strong>Email:</strong> {userDetails.formModel.email}
                  </li>
                  <li className="list-group-item">
                    <strong>Alternate Email:</strong> {userDetails.formModel.alternateEmail || 'N/A'}
                  </li>
                  <li className="list-group-item">
                    <strong>Date of Birth:</strong> {formatDate(userDetails.formModel.dateOfBirth)}
                  </li>
                  <li className="list-group-item">
                    <strong>FAX Number:</strong> {userDetails.formModel.faxNo || 'N/A'}
                  </li>
                  <li className="list-group-item">
                    <strong>Communication Address:</strong>
                    {userDetails.formModel.commuAddress1 && userDetails.formModel.commuVillageOrTown ? (
                      <div className="mt-1">
                        {[
                          userDetails.formModel.commuAddress1,
                          userDetails.formModel.commuAddress2,
                          userDetails.formModel.commuVillageOrTown,
                          userDetails.formModel.commuDistrict ? `District: ${userDetails.formModel.commuDistrict}` : null,
                          userDetails.formModel.commuTehsil ? `Tehsil: ${userDetails.formModel.commuTehsil}` : null,
                          userDetails.formModel.commuPinCode ? `Pin Code: ${userDetails.formModel.commuPinCode}` : null,
                        ].filter(Boolean).join(', ')}
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </li>
                </ul>
              </Card.Body>
            </Card>
          ) : (
            !loading && !error && (
              <div className="text-center p-3 text-muted">
                No User Data Available
              </div>
            )
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserDetails;