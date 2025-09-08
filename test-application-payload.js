// Test snippet for Application Details Payload Builder
// You can run this in browser console to test the payload building

import { ApplicationPayloadBuilder } from './src/utils/applicationUtils';

// Test 1: New application (matches Angular's 'new' mode)
console.log('=== Test 1: New Application ===');
const newPayload = ApplicationPayloadBuilder.createApplicationDetailsPayload('new', null);
console.log('New Application Payload:', newPayload);

// Test 2: Renewal application (matches Angular's 'renew' mode)
console.log('\n=== Test 2: Renewal Application ===');
const existingApp = {
  appId: 123,
  iterationCount: 1,
  isLocked: false,
  isAllowEdit: true,
  applicationLifeCycleStatusType: 2
};
const renewPayload = ApplicationPayloadBuilder.createApplicationDetailsPayload('renew', existingApp);
console.log('Renewal Application Payload:', renewPayload);

// Test 3: ApplicationAction payload
console.log('\n=== Test 3: ApplicationAction Payload ===');
const actionPayload = ApplicationPayloadBuilder.createApplicationActionPayload(123, existingApp);
console.log('ApplicationAction Payload:', actionPayload);

// Test 4: Verify payload structure matches Angular
console.log('\n=== Test 4: Payload Structure Verification ===');
const requiredFields = [
  'appId', 'applicationType', 'applicationPurposeType', 'iterationCount',
  'createdOnDate', 'lastModifiedOnDate', 'isEnabled', 'isDeleted',
  'isLocked', 'isAllowEdit', 'isFeeApplicable', 'isOnline',
  'applicationLifeCycleStatusType', 'applicationLifeCycleLastStatusOn',
  'isLegacyData', 'projectSiteRefId', 'publicAppRefNum'
];

const missingFields = requiredFields.filter(field => !(field in newPayload));
if (missingFields.length === 0) {
  console.log('✅ All required fields present');
} else {
  console.log('❌ Missing fields:', missingFields);
}

// Test 5: Verify Angular-React mapping
console.log('\n=== Test 5: Angular-React Field Mapping ===');
console.table({
  'Application Type': { Angular: 6, React: newPayload.applicationType, Match: newPayload.applicationType === 6 },
  'Purpose Type (New)': { Angular: 1, React: newPayload.applicationPurposeType, Match: newPayload.applicationPurposeType === 1 },
  'Purpose Type (Renew)': { Angular: 2, React: renewPayload.applicationPurposeType, Match: renewPayload.applicationPurposeType === 2 },
  'Iteration Count (New)': { Angular: 0, React: newPayload.iterationCount, Match: newPayload.iterationCount === 0 },
  'Iteration Count (Renew)': { Angular: 2, React: renewPayload.iterationCount, Match: renewPayload.iterationCount === 2 },
  'App ID (New)': { Angular: 0, React: newPayload.appId, Match: newPayload.appId === 0 },
  'App ID (Renew)': { Angular: 123, React: renewPayload.appId, Match: renewPayload.appId === 123 }
});

// Test 6: Public App Ref Number format verification
console.log('\n=== Test 6: Public App Ref Number Format ===');
const expectedPattern = /^CONTR\d{1}\d{1}\d+\d{8}\d+$/;
console.log('New App Ref:', newPayload.publicAppRefNum);
console.log('Format Valid:', expectedPattern.test(newPayload.publicAppRefNum));
console.log('Renew App Ref:', renewPayload.publicAppRefNum);
console.log('Format Valid:', expectedPattern.test(renewPayload.publicAppRefNum));

// Test 7: ApplicationAction required fields
console.log('\n=== Test 7: ApplicationAction Field Verification ===');
const actionRequiredFields = [
  'appActionId', 'appActionType', 'sender_UserRefId', 'sender_ProfileRefId',
  'receiver_UserRefId', 'receiver_ProfileRefId', 'actionOnDate', 'actionTakenDaysCount',
  'remarks', 'senderRoleId', 'receiverRoleId', 'isDocumentUploaded',
  'appDocumentRefId', 'applicationRefId', 'ipAddress', 'latitude', 'longitude'
];

const actionMissingFields = actionRequiredFields.filter(field => !(field in actionPayload));
if (actionMissingFields.length === 0) {
  console.log('✅ All ApplicationAction fields present');
} else {
  console.log('❌ Missing ApplicationAction fields:', actionMissingFields);
}

// Test 8: Session persistence simulation
console.log('\n=== Test 8: Session Persistence Test ===');
const testAppState = {
  appId: 12345,
  iterationCount: 0,
  isLocked: false,
  isAllowEdit: true,
  applicationLifeCycleStatusType: -1
};

// Simulate persistence
sessionStorage.setItem('contractorApplicationState', JSON.stringify(testAppState));
sessionStorage.setItem('contractorApplicationId', testAppState.appId.toString());

// Simulate restoration
const restoredState = JSON.parse(sessionStorage.getItem('contractorApplicationState'));
const restoredId = parseInt(sessionStorage.getItem('contractorApplicationId'));

console.log('Persisted State:', testAppState);
console.log('Restored State:', restoredState);
console.log('Restored ID:', restoredId);
console.log('Persistence Test:', JSON.stringify(testAppState) === JSON.stringify(restoredState) ? '✅ PASS' : '❌ FAIL');
