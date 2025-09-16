// Test script to simulate supervisor draft mode
// Run this in browser console before navigating to supervisor-registration page

console.log('🧪 [TEST] Setting up supervisor draft test data...');

// Set draft navigation flags
sessionStorage.setItem('allowDraftNavigation', 'true');

// Set supervisor draft application data
const draftData = {
  applicationType: 7,  // Supervisor application type
  appId: 12345        // Test application ID
};

sessionStorage.setItem('draftApplicationData', JSON.stringify(draftData));

console.log('✅ [TEST] Draft data set up:');
console.log('allowDraftNavigation:', sessionStorage.getItem('allowDraftNavigation'));
console.log('draftApplicationData:', sessionStorage.getItem('draftApplicationData'));

console.log('🎯 [TEST] Now navigate to supervisor-registration page to test draft mode');
console.log('🔍 [TEST] Check console for detailed logs and verify:');
console.log('  1. FormMode should be "draft"');
console.log('  2. Fields should be disabled except certificate dropdown and experience radio buttons');
console.log('  3. API should be called to populate form data');

// Optional: Also set up some test session data for project navigation
sessionStorage.setItem('allowSupervisorRegistrationNavigation', 'true');