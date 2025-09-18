/**
 * Supervisor Documents Upload Page
 * Now uses the unified DocumentUploadManager
 */

import React from 'react';
import { DocumentUploadManager, SUPERVISOR_DOCUMENTS_CONFIG } from '../../modules/documents';
import Footer from '../../components/Footer/Footer';

const UploadSupervisorDocumentNew: React.FC = () => {
  return (
    <div className="registeration-bg min-vh-100" style={{ padding: "5px", backgroundColor: "#f8f9fa", marginTop: "80px" }}>
      <DocumentUploadManager 
        config={SUPERVISOR_DOCUMENTS_CONFIG}
        title="Supervisor Documents Upload"
        subtitle="Please upload all required documents for supervisor registration"
        nextRoute="/dashboard"
        className="supervisor-documents"
      />
      <Footer />
    </div>
  );
};

export default UploadSupervisorDocumentNew;