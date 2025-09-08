# CRITICAL FINDING: New vs Draft Mode Differences

## Mode Detection Logic
Angular uses TWO distinct entry points with different route parameters:
- **New Mode**: `formMode=new` only
- **Draft Mode**: `formMode=new` + `appRefId=applicationId`

## API Call Patterns
- **Both Modes**: ProjectSites API (user profile data)
- **Draft Mode Only**: ContractorLicence API (existing application data)

## React Implementation Status
- ✅ **Draft Navigation**: Working (project-details → ContractorApplicantDetails)
- ❌ **New Mode Entry**: Missing (no application-list equivalent)
- ❌ **Draft Data Loading**: Missing (ContractorLicence API not called)
- ❌ **Form Pre-population**: Missing (draft fields not filled)
- ❌ **Table Population**: Missing (working areas, instruments, partners empty)

## Required Implementation
1. Add ContractorLicence API call to useContractorForm hook
2. Add form pre-population logic for draft mode
3. Create application list page for new mode entry
4. Add mode detection and conditional behavior

## Field Mappings Verified
All required field mappings from Angular to React have been identified and documented.
Backend API response structure confirmed to match Angular expectations.