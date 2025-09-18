/**
 * Contractor Documents Upload Page
 * Now uses the unified DocumentUploadManager
 */

import React from 'react';
import { DocumentUploadManager, CONTRACTOR_DOCUMENTS_CONFIG } from '../../modules/documents';
import Footer from '../../components/Footer/Footer';

const ContractorDocumentsNew: React.FC = () => {
  return (
    <div className="registeration-bg min-vh-100" style={{ padding: "5px", backgroundColor: "#f8f9fa", marginTop: "80px" }}>
      <DocumentUploadManager 
        config={CONTRACTOR_DOCUMENTS_CONFIG}
        title="Contractor Documents Upload"
        subtitle="Please upload all required documents for contractor license application"
        nextRoute="/dashboard"
        className="contractor-documents"
      />
      <Footer />
    </div>
  );
};

export default ContractorDocumentsNew;