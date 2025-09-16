// Enhanced test script for debugging Date of Birth prefilling
// Run this in browser console before navigating to supervisor-registration page

console.log('🧪 [DOB-DEBUG] Setting up enhanced test with debugging...');

// Set draft navigation flags
sessionStorage.setItem('allowDraftNavigation', 'true');

// Set supervisor draft application data with detailed debug info
const draftData = {
  applicationType: 7,  // Supervisor application type
  appId: 12345        // Test application ID
};

sessionStorage.setItem('draftApplicationData', JSON.stringify(draftData));

console.log('✅ [DOB-DEBUG] Draft data set up:');
console.log('allowDraftNavigation:', sessionStorage.getItem('allowDraftNavigation'));
console.log('draftApplicationData:', sessionStorage.getItem('draftApplicationData'));

// Mock API response for testing (if API is not available)
window.mockAPIResponse = {
  users: {
    userProfileMapping: {
      userProfile: {
        firstName: "Test",
        lastName: "User", 
        fatherName: "Test Father",
        mobileNo: "1234567890",
        email: "test@example.com",
        dateOfBirth: "19900315",  // Test DOB in YYYYMMDD format
        // Alternative formats to test:
        // dateOfBirth: "1990-03-15",  // ISO format
        // dob: "19900315",           // Alternative property name
      }
    }
  },
  address1: "Test Address Line 1",
  address2: "Test Address Line 2",
  applicantPanNumber: "ABCDE1234F",
  applications: [{
    applicationType: 7,
    appId: 12345,
    supervisorLicence_GeneralDetails: {
      doYouHoldSupervisorLicence: false,
      practicleExperianceType: 3
    }
  }]
};

console.log('🎯 [DOB-DEBUG] Mock API response prepared:', window.mockAPIResponse);

console.log('🔍 [DOB-DEBUG] Now navigate to supervisor-registration page');
console.log('📋 [DOB-DEBUG] Check console for these specific logs:');
console.log('  1. "Raw dateOfBirth from API:" - should show the DOB value');
console.log('  2. "Date of birth auto-filled (mm/dd/yyyy):" - should show formatted date');
console.log('  3. "User profile keys:" - should show all available properties');
console.log('  4. "Found alternative date field" - if dateOfBirth is not in expected location');

// Function to manually test date formatting
window.testDateFormatting = (dobValue) => {
  console.log('🧪 [DOB-TEST] Testing date formatting for:', dobValue);
  
  let formattedDate = '';
  const dobString = dobValue.toString();
  
  if (dobString.length === 8 && /^\d{8}$/.test(dobString)) {
    const year = dobString.substring(0,4);
    const month = dobString.substring(4,6);
    const day = dobString.substring(6,8);
    formattedDate = `${month}/${day}/${year}`;
    console.log('✅ [DOB-TEST] YYYYMMDD format result:', formattedDate);
  } else if (dobString.includes('-') && dobString.length === 10) {
    const [year, month, day] = dobString.split('-');
    formattedDate = `${month}/${day}/${year}`;
    console.log('✅ [DOB-TEST] ISO format result:', formattedDate);
  } else {
    console.log('⚠️ [DOB-TEST] Unrecognized format');
  }
  
  return formattedDate;
};

console.log('🛠️ [DOB-DEBUG] Use window.testDateFormatting("19900315") to test date formatting manually');

// Optional: Set up navigation flag
sessionStorage.setItem('allowSupervisorRegistrationNavigation', 'true');