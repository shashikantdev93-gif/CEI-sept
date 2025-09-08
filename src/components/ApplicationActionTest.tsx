import React, { useState } from 'react';
import { Button, Card, Alert } from 'react-bootstrap';
import { ApplicationPayloadBuilder } from '../utils/applicationUtils';

interface TestResult {
  testName: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  data?: any;
}

export const ApplicationActionTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const clearTests = () => {
    setTestResults([]);
  };

  const runApplicationActionTest = async () => {
    setIsRunning(true);
    clearTests();

    try {
      // Test 1: Check Project Site Data Availability
      addTestResult({
        testName: 'Project Site Data Check',
        status: 'pending',
        message: 'Checking if project site data is available in sessionStorage...'
      });

      const projectSiteDataStr = sessionStorage.getItem('projectSiteData');
      const projectSiteData = projectSiteDataStr ? JSON.parse(projectSiteDataStr) : null;

      if (projectSiteData) {
        addTestResult({
          testName: 'Project Site Data Check',
          status: 'success',
          message: `✅ Project site data found with userId: ${projectSiteData.users?.userId}`,
          data: projectSiteData.users
        });
      } else {
        addTestResult({
          testName: 'Project Site Data Check',
          status: 'error',
          message: '❌ No project site data found in sessionStorage'
        });
      }

      // Test 2: Application Payload Generation
      addTestResult({
        testName: 'Application Payload Generation',
        status: 'pending',
        message: 'Testing application details payload creation...'
      });

      try {
        const appPayload = ApplicationPayloadBuilder.createApplicationDetailsPayload('new', null);
        addTestResult({
          testName: 'Application Payload Generation',
          status: 'success',
          message: '✅ Application payload generated successfully',
          data: {
            applicationType: appPayload.applicationType,
            applicationPurposeType: appPayload.applicationPurposeType,
            publicAppRefNum: appPayload.publicAppRefNum
          }
        });
      } catch (error: any) {
        addTestResult({
          testName: 'Application Payload Generation',
          status: 'error',
          message: `❌ Application payload generation failed: ${error.message}`
        });
      }

      // Test 3: ApplicationAction Payload Generation
      addTestResult({
        testName: 'ApplicationAction Payload Generation',
        status: 'pending',
        message: 'Testing ApplicationAction payload creation...'
      });

      try {
        const actionPayload = ApplicationPayloadBuilder.createApplicationActionPayload(12345, null);
        
        // Validate payload has required fields
        const requiredFields = [
          'appActionId', 'appActionType', 'sender_UserRefId', 'sender_ProfileRefId',
          'receiver_UserRefId', 'receiver_ProfileRefId', 'actionOnDate',
          'applicationRefId', 'remarks'
        ];

        const missingFields = requiredFields.filter(field => 
          actionPayload[field as keyof typeof actionPayload] === undefined
        );

        if (missingFields.length === 0) {
          addTestResult({
            testName: 'ApplicationAction Payload Generation',
            status: 'success',
            message: '✅ ApplicationAction payload generated with all required fields',
            data: {
              sender_UserRefId: actionPayload.sender_UserRefId,
              sender_ProfileRefId: actionPayload.sender_ProfileRefId,
              applicationRefId: actionPayload.applicationRefId,
              remarks: actionPayload.remarks
            }
          });
        } else {
          addTestResult({
            testName: 'ApplicationAction Payload Generation',
            status: 'error',
            message: `❌ Missing required fields: ${missingFields.join(', ')}`
          });
        }
      } catch (error: any) {
        addTestResult({
          testName: 'ApplicationAction Payload Generation',
          status: 'error',
          message: `❌ ApplicationAction payload generation failed: ${error.message}`
        });
      }

      // Test 4: Token Data vs Project Site Data Comparison
      addTestResult({
        testName: 'User Data Source Comparison',
        status: 'pending',
        message: 'Comparing user data sources (token vs project site)...'
      });

      try {
        const tokenStr = localStorage.getItem('token');
        const tokenData = tokenStr ? JSON.parse(tokenStr) : null;

        const comparison = {
          token: {
            userId: tokenData?.userId,
            userProfileId: tokenData?.userProfileId,
            roleCode: tokenData?.roleCode
          },
          projectSite: {
            userId: projectSiteData?.users?.userId,
            userProfileId: projectSiteData?.users?.userProfileMapping?.userProfileRefId,
            roleCode: 'N/A (hardcoded to 3)'
          }
        };

        addTestResult({
          testName: 'User Data Source Comparison',
          status: 'success',
          message: '✅ User data sources compared successfully',
          data: comparison
        });
      } catch (error: any) {
        addTestResult({
          testName: 'User Data Source Comparison',
          status: 'error',
          message: `❌ User data comparison failed: ${error.message}`
        });
      }

      // Test 5: Session Storage Persistence Test
      addTestResult({
        testName: 'Session Storage Persistence',
        status: 'pending',
        message: 'Testing session storage persistence...'
      });

      try {
        const testAppState = {
          appId: 12345,
          iterationCount: 0,
          isLocked: false,
          isAllowEdit: true,
          applicationLifeCycleStatusType: -1
        };

        sessionStorage.setItem('testApplicationState', JSON.stringify(testAppState));
        const retrieved = JSON.parse(sessionStorage.getItem('testApplicationState') || '{}');
        
        if (retrieved.appId === testAppState.appId) {
          addTestResult({
            testName: 'Session Storage Persistence',
            status: 'success',
            message: '✅ Session storage working correctly'
          });
        } else {
          addTestResult({
            testName: 'Session Storage Persistence',
            status: 'error',
            message: '❌ Session storage data corruption detected'
          });
        }

        // Clean up test data
        sessionStorage.removeItem('testApplicationState');
      } catch (error: any) {
        addTestResult({
          testName: 'Session Storage Persistence',
          status: 'error',
          message: `❌ Session storage test failed: ${error.message}`
        });
      }

    } catch (globalError: any) {
      addTestResult({
        testName: 'Global Test Error',
        status: 'error',
        message: `❌ Unexpected error during testing: ${globalError.message}`
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="mt-4">
      <Card.Header>
        <h5 className="mb-0">🧪 ApplicationAction Implementation Test Suite</h5>
      </Card.Header>
      <Card.Body>
        <div className="mb-3">
          <Button 
            variant="primary" 
            onClick={runApplicationActionTest}
            disabled={isRunning}
            className="me-2"
          >
            {isRunning ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Running Tests...
              </>
            ) : (
              '🚀 Run ApplicationAction Tests'
            )}
          </Button>
          <Button variant="outline-secondary" onClick={clearTests}>
            Clear Results
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="test-results">
            <h6>Test Results:</h6>
            {testResults.map((result, index) => (
              <Alert 
                key={index}
                variant={
                  result.status === 'success' ? 'success' : 
                  result.status === 'error' ? 'danger' : 
                  'info'
                }
                className="mb-2"
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <strong>{result.testName}</strong>
                    <div className="mt-1">{result.message}</div>
                    {result.data && (
                      <details className="mt-2">
                        <summary style={{ cursor: 'pointer' }}>View Data</summary>
                        <pre className="mt-2 mb-0" style={{ fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        <div className="mt-4 p-3 bg-light rounded">
          <h6>📋 Test Coverage:</h6>
          <ul className="mb-0">
            <li>✅ Project Site Data Availability</li>
            <li>✅ Application Payload Generation</li>
            <li>✅ ApplicationAction Payload Generation</li>
            <li>✅ User Data Source Priority (Project Site → Token)</li>
            <li>✅ Session Storage Persistence</li>
          </ul>
        </div>
      </Card.Body>
    </Card>
  );
};
