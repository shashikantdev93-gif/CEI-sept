# Contractor Applicant Details - Technical Documentation

## Overview
The Contractor Applicant Details form is a multi-section React component that allows users to register as electrical contractors by providing their personal details, working areas, instruments, and partner information. The form integrates with a backend API for data validation and storage.

## Architecture

### Component Structure
```
ContractorApplicantDetails.tsx (Main Component)
├── useContractorForm.ts (Custom Hook)
├── userDetailsService.ts (API Service)
├── contractor.constants.ts (Constants)
├── contractor.types.ts (TypeScript Types)
└── contractorUtils.ts (Utility Functions)
```

## Page Load Flow

### 1. Initial Component Mount
When the component first loads, the following sequence occurs:

```typescript
ContractorApplicantDetails Component Mounts
    ↓
useContractorForm Hook Initialization
    ↓
Auto-fetch Project Site Data
    ↓
Load Districts for Punjab (ID: 3)
    ↓
Auto-fill Form Fields
    ↓
Set isInitialLoad to false
```

### 2. Data Loading Process

#### Step 1: Project Site Data Fetching
```javascript
// useContractorForm.ts - useEffect on mount
useEffect(() => {
    const loadInitialData = async () => {
        try {
            // Call API to get user profile data
            const response = await userDetailsService.getProjectSiteData();
            
            if (response.data?.users?.userProfileMapping?.userProfile) {
                const userProfile = response.data.users.userProfileMapping.userProfile;
                
                // Auto-fill form fields using ProjectSiteDataMapper
                setName(ProjectSiteDataMapper.getApplicantName(userProfile));
                setAddress(ProjectSiteDataMapper.getCommunicationAddress(userProfile));
                setPanNumber(response.data.applicantPanNumber || "");
            }
            
            setIsInitialLoad(false);
        } catch (error) {
            console.error('Failed to load initial data:', error);
            setIsInitialLoad(false);
        }
    };

    loadInitialData();
    loadDistricts(3); // Load districts for Punjab (ID: 3)
}, []);
```

#### Step 2: Districts Loading
```javascript
// useLocation hook automatically loads districts
loadDistricts(3) → API Call → Populate districts dropdown
```

## Form Sections & Functionality

### Section 1: Applicant Details

#### Fields:
- **Name** (Auto-filled, Read-only)
- **Address** (Auto-filled, Read-only)
- **PAN Number** (Auto-filled, Read-only)
- **Contractor Type** (Dropdown selection)
- **Current Working Voltage** (Dropdown selection)
- **Signee Name** (Conditional - shows only for non-Individual contractors)
- **Business Entity** (Conditional)
- **Business Entity Address** (Conditional)

#### Key Functions:

##### Contractor Type Change
```javascript
const handleContractorTypeChange = (value: string) => {
    setContractorType(value);
    
    // Determines if business entity fields should be shown
    const isIndividual = value === "Individual";
    
    // Controls visibility of Partner/Shareholder section
    const showPartnerSection = ['Private Limited', 'Public Limited', 'Partnership', 'Proprietorship'].includes(value);
};
```

##### Working Voltage Change
```javascript
const handleCurrentWorkingVoltageChange = (value: string) => {
    setCurrentWorkingVoltage(value);
    
    // Updates available instruments based on voltage selection
    let newInstrumentList = [];
    
    switch (value) {
        case "Low/Medium Voltage":
            newInstrumentList = INSTRUMENT_LISTS.lowMediumVoltage;
            break;
        case "High Voltage":
            newInstrumentList = INSTRUMENT_LISTS.highVoltage;
            break;
        case "Extra High Voltage":
            newInstrumentList = INSTRUMENT_LISTS.extraHighVoltage;
            break;
    }
    
    setSelectedInstrumentList(newInstrumentList);
    
    // Clear previous instrument selection
    if (instrument) setInstrument("");
};
```

### Section 2: Working Areas

#### Fields:
- **Working On District** (Dropdown)
- **Working On Tehsil** (Dropdown - dependent on district)

#### Workflow:

##### District Selection
```javascript
const handleWorkingDistrictChange = (e) => {
    const districtCode = Number(e.target.value);
    
    setWorkingOnDistrict(districtCode);
    setWorkingOnTehsil(""); // Clear tehsil selection
    resetTehsils(); // Clear tehsil list
    
    if (districtCode) {
        loadTehsils(districtCode); // Load tehsils for selected district
    }
};
```

##### Adding Working Area
```javascript
const handleAddWorkingArea = async () => {
    // Validation
    if (!workingOnDistrict || !workingOnTehsil || !applicationId) {
        setSaveError('Please fill all required fields');
        return;
    }

    try {
        // Check for duplicates
        const selectedDistrict = districts.find(d => d.districtCode === workingOnDistrict);
        const selectedTehsil = tehsils.find(t => t.tehsilId === workingOnTehsil);

        const exists = workingAreas.some(area => 
            area.district === selectedDistrict?.districtName && 
            area.tehsil === selectedTehsil?.tehsilName
        );

        if (exists) {
            setSaveError('This working area is already added');
            return;
        }

        // Add to local state
        const newWorkingArea = {
            id: Date.now(),
            district: selectedDistrict?.districtName,
            tehsil: selectedTehsil?.tehsilName,
            action: 'Delete'
        };

        setWorkingAreas([...workingAreas, newWorkingArea]);
        
        // Clear form
        setWorkingOnDistrict("");
        setWorkingOnTehsil("");
        resetTehsils();
        
        setSaveSuccess('Working area added successfully!');
    } catch (error) {
        setSaveError(error?.message || 'Failed to add working area');
    }
};
```

### Section 3: Instrument Details

#### Fields:
- **Instrument** (Dropdown - dependent on working voltage)
- **Instrument Serial No**
- **Instrument Make**
- **Instrument Range (From/To/Unit)**
- **District/Tehsil** (Separate from working area)

#### Workflow:

##### Instrument Addition Process
```javascript
const handleAddInstrument = async () => {
    // Step 1: Form validation
    if (!instrument || !instrumentSerialNo || !instrumentMake || !district || !tehsil || !applicationId) {
        setSaveError('Please fill all required fields');
        return;
    }

    try {
        // Step 2: Check for duplicate serial number
        const serialNumberToCheck = instrumentSerialNo.toUpperCase();
        const duplicateCheckResponse = await userDetailsService.validateInstrumentSerialNumber(serialNumberToCheck);
        
        if (duplicateCheckResponse.data?.formModel && duplicateCheckResponse.data.formModel.length > 0) {
            setSaveError('This Instrument Serial Number Already Exists');
            return;
        }

        // Step 3: Check for duplicate instrument in same working area
        const selectedDistrict = districts.find(d => d.districtCode === district);
        const selectedTehsil = tehsils.find(t => t.tehsilId === tehsil);
        
        const exists = instruments.some((existingInstrument) =>
            existingInstrument.instrumentType === instrument &&
            existingInstrument.district === selectedDistrict?.districtName &&
            existingInstrument.tehsil === selectedTehsil?.tehsilName
        );
        
        if (exists) {
            setSaveError('This instrument is already added for the selected working area');
            return;
        }

        // Step 4: Prepare API payload
        const selectedInstrumentValue = selectedInstrumentList.find(item => item.name === instrument)?.value;
        
        const instrumentPayload = {
            contactInstrumentId: 0,
            appRefId: applicationId,
            applicationInstrumentsType: selectedInstrumentValue || 1,
            instrumentSerialNo: instrumentSerialNo.toUpperCase(),
            instrumentMakeBy: instrumentMake,
            instrumentStartRange: instrumentRangeFrom,
            instrumentEndRange: instrumentRangeTo,
            applicationInstrumentRange: 1,
            isActive: true,
            isDeleted: false,
            createdOnDate: new Date().toISOString(),
            lastModifiedOnDate: new Date().toISOString(),
            districtRefId: district,
            districtName: selectedDistrict?.districtName || '',
            tehsilRefId: tehsil,
            tehsilName: selectedTehsil?.tehsilName || ''
        };

        // Step 5: API call
        const result = await userDetailsService.addInstrument(instrumentPayload);

        if (result?.success) {
            // Step 6: Update local state
            const newInstrument = {
                id: Date.now(),
                instrumentType: instrument,
                instrumentSerialNo,
                instrumentMake,
                instrumentRange: `${instrumentRangeFrom}-${instrumentRangeTo} ${instrumentRangeUnit}`,
                district: selectedDistrict?.districtName || district.toString(),
                tehsil: selectedTehsil?.tehsilName || tehsil.toString(),
                action: 'Delete'
            };
            
            setInstruments([...instruments, newInstrument]);
            clearInstrumentForm();
            setSaveSuccess('Instrument added successfully!');
        }
    } catch (error) {
        setSaveError(error?.message || 'Failed to add instrument');
    }
};
```

### Section 4: Partner/Shareholder Details (Conditional)

#### Visibility Logic:
```javascript
const showPartnerSection = contractorType && contractorType !== "Individual";
```

#### Fields:
- **Partner Name**
- **Partner Email**
- **Partner Contact Number**
- **Partner Photo** (File upload)
- **PAN Document** (File upload)
- **PAN Number**

#### Workflow:

##### File Upload Process
```javascript
const handleFileUploaded = (info) => {
    const { formControlName, serverResponse } = info;
    const fileName = serverResponse.generatedFileNames.replace(/^,/, "");
    const fileUrl = `${import.meta.env.VITE_UPLOAD_URL}Uploads/Documents/TempFiles/${fileName.trim()}`;
    
    if (formControlName === 'partnerPhoto') {
        setPartnerPhoto(fileName);
        setPartnerPhotoPreviewUrl(fileUrl);
    } else if (formControlName === 'uploadPan') {
        setUploadPan(fileName);
        setUploadPanPreviewUrl(fileUrl);
    }
};
```

##### Partner Addition Process
```javascript
const handleAddPartner = async () => {
    // Step 1: Validation
    if (!partnerName || !partnerEmail || !partnerContactNumber || !panNo || !partnerPhoto || !uploadPan || !applicationId) {
        setSaveError('Please fill all required fields');
        return;
    }

    try {
        // Step 2: PAN number validation
        const panValidationResponse = await userDetailsService.validatePANNumber(panNo);
        
        if (panValidationResponse.data?.formModel !== null) {
            setSaveError('PAN Number already exists');
            return;
        }

        // Step 3: Prepare API payload
        const partnerPayload = {
            contactPartnershipId: 0,
            appRefId: applicationId,
            contrPartnerName: partnerName,
            contrPartnerEmail: partnerEmail,
            contrPartnerContactNo: partnerContactNumber,
            contrPartnerPhoto: partnerPhoto,
            panNoPhoto: uploadPan,
            panNo: panNo,
            isActive: true,
            isDeleted: false,
            createdOnDate: new Date().toISOString(),
            lastModifiedOnDate: new Date().toISOString()
        };

        // Step 4: API call
        const result = await userDetailsService.addPartner(partnerPayload);

        if (result?.success) {
            // Step 5: Update local state
            const newPartner = {
                id: Date.now(),
                name: partnerName,
                email: partnerEmail,
                mobileNumber: partnerContactNumber,
                photo: partnerPhoto,
                pan: uploadPan,
                panNo: panNo,
                action: 'Delete'
            };
            
            setPartners([...partners, newPartner]);
            clearPartnerForm();
            setSaveSuccess('Partner added successfully!');
        }
    } catch (error) {
        setSaveError(error?.message || 'Failed to add partner');
    }
};
```

## API Integration

### Service Methods:

#### 1. Initial Data Loading
```javascript
// userDetailsService.getProjectSiteData()
GET /api/ProjectSites/getProjectSitesData
→ Returns user profile data for auto-filling form
```

#### 2. Validation APIs
```javascript
// userDetailsService.validateInstrumentSerialNumber(serialNo)
GET /api/ContractorLicence/getContract_InstrumentDetails?instrumentSerialNo=${serialNo}
→ Checks if instrument serial number already exists

// userDetailsService.validatePANNumber(panNo)
GET /api/ProjectSites/getProjectSitesPanDetails?panno=${panNo}
→ Checks if PAN number already exists
```

#### 3. Data Submission APIs
```javascript
// userDetailsService.addInstrument(payload)
POST /api/ContractorLicence/addUpdateContract_InstrumentDetails
→ Adds new instrument to database

// userDetailsService.addPartner(payload)
POST /api/ContractorLicence/addUpdateContract_PartnerDetails
→ Adds new partner to database
```

## State Management

### Hook Structure:
```javascript
useContractorForm() returns {
    // Form States
    name, address, panNumber, contractorType, currentWorkingVoltage,
    signeeNameOnBehalfOfCompany, businessEntity, businessEntityAddress,
    
    // Working Area States
    workingOnDistrict, workingOnTehsil, workingAreas,
    
    // Instrument States
    instrument, instrumentSerialNo, instrumentMake, instrumentRangeFrom,
    instrumentRangeTo, instrumentRangeUnit, district, tehsil, instruments,
    selectedInstrumentList,
    
    // Partner States
    partnerName, partnerEmail, partnerContactNumber, partnerPhoto,
    uploadPan, panNo, partners, partnerPhotoPreviewUrl, uploadPanPreviewUrl,
    
    // Application States
    isInitialLoad, saveSuccess, saveError,
    
    // Location States
    districts, tehsils, loading, locationErrors,
    
    // Handler Functions
    handleWorkingDistrictChange, handleInstrumentDistrictChange,
    handleContractorTypeChange, handleCurrentWorkingVoltageChange,
    handleAddWorkingArea, handleAddInstrument, handleAddPartner,
    handleDeleteWorkingArea, handleDeleteInstrument, handleDeletePartner,
    handleFileUploaded
}
```

## Error Handling

### Validation Levels:
1. **Client-side validation** - Required field checks
2. **Server-side validation** - Duplicate checks via API
3. **Business logic validation** - Duplicate entries within form

### Error Display:
```javascript
// Success/Error notifications
{(saveSuccess || saveError) && (
    <div className={`alert ${saveSuccess ? 'alert-success' : 'alert-danger'}`}>
        <i className={`bi ${saveSuccess ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
        {saveSuccess || saveError}
        <Button onClick={() => { setSaveSuccess(null); setSaveError(null); }}>
            <i className="bi bi-x"></i>
        </Button>
    </div>
)}
```

## UI Components

### Progress Steps:
- Visual indicator showing current step (Step 1: Applicant Details)
- 5 total steps planned

### Data Tables:
- Working Areas table with delete functionality
- Instruments table with delete functionality  
- Partners table with delete functionality

### Form Controls:
- Responsive Bootstrap components
- Conditional field visibility
- File upload with preview
- Dropdown dependencies (District → Tehsil)

## Key Features

### 1. Auto-fill Functionality
- Name, Address, PAN Number auto-filled from user profile
- Read-only fields to prevent manual changes

### 2. Dynamic Dropdowns
- Tehsil dropdown updates based on district selection
- Instrument dropdown updates based on voltage selection

### 3. Conditional Sections
- Business entity fields show/hide based on contractor type
- Partner section shows/hide based on contractor type

### 4. File Upload
- Partner photo and PAN document upload
- File preview functionality
- File type and size validation

### 5. Duplicate Prevention
- Server-side validation for instrument serial numbers
- Server-side validation for PAN numbers
- Client-side validation for duplicate entries within form

### 6. Real-time Feedback
- Loading spinners during API calls
- Success/error notifications
- Form validation messages

## Navigation

### Session Management:
```javascript
// Clean up navigation flags on mount and unmount
useEffect(() => {
    sessionStorage.removeItem('allowContractorDetailsNavigation');
    return () => {
        sessionStorage.removeItem('allowContractorDetailsNavigation');
    };
}, []);
```

### Navigation Buttons:
- **Back Button** - Navigate to previous page
- **Save & Next Button** - Save current data and proceed to next step

## Performance Considerations

### 1. Lazy Loading
- Districts loaded on component mount
- Tehsils loaded only when district is selected

### 2. Debouncing
- Could be implemented for API calls to prevent excessive requests

### 3. Caching
- District/Tehsil data could be cached to avoid repeated API calls

### 4. Optimistic Updates
- Local state updated immediately for better UX
- API calls happen in background

## Future Enhancements

### 1. Form Persistence
- Save form data to localStorage
- Restore data on page reload

### 2. Validation Enhancements
- Real-time field validation
- Custom validation rules

### 3. Accessibility
- ARIA labels and descriptions
- Keyboard navigation support

### 4. Mobile Optimization
- Touch-friendly controls
- Responsive table layouts

## Conclusion

The Contractor Applicant Details form is a comprehensive, multi-section form that handles complex business logic, API integrations, and user interactions. The separation of concerns through custom hooks, service layers, and utility functions makes the codebase maintainable and scalable.
