/**
 * Wireman Documents Upload Page
 * Now uses the unified DocumentUploadManager
 */

import React from 'react';
import { DocumentUploadManager, WIREMAN_DOCUMENTS_CONFIG } from '../../modules/documents';
import Footer from '../../components/Footer/Footer';

const UploadWiremanDocumentNew: React.FC = () => {
  return (
    <div className="registeration-bg min-vh-100" style={{ padding: "5px", backgroundColor: "#f8f9fa", marginTop: "80px" }}>
      <DocumentUploadManager 
        config={WIREMAN_DOCUMENTS_CONFIG}
        title="Wireman Documents Upload"
        subtitle="Please upload all required documents for wireman registration"
        nextRoute="/dashboard"
        className="wireman-documents"
      />
      <Footer />
    </div>
  );
};

export default UploadWiremanDocumentNew;