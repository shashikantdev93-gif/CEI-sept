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