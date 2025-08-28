import React from "react";
import { Card, Form, Button, Table } from "react-bootstrap";

export interface DocumentItem {
  id: number;
  sNo: number;
  documentName: string;
  formatMaxSize: string;
  uploadedFile?: File | null;
  fileName?: string;
}

interface UploadDataProps {
  documents: DocumentItem[];
  onFileUpload: (documentId: number, file: File | null) => void;
  onRemoveFile: (documentId: number) => void;
  disableSubmit?: boolean;
  onSubmit: () => void;
  onBack: () => void;
  title: string;
  submitLabel?: string;
}

const UploadData: React.FC<UploadDataProps> = ({
  documents,
  onFileUpload,
  onRemoveFile,
  disableSubmit,
  onSubmit,
  title,
  submitLabel = "Submit Uploaded Document & Next"
}) => (
  <Card className="border-0 shadow-sm mx-auto" style={{ width: '100%' }}>
    <Card.Body className="p-1">
      <div className="document-upload-section mb-4">
        <div className="text-center mb-4">
          <h5 className="text-dark fw-semibold mb-0">{title}</h5>
        </div>
        <div className="table-responsive">
          <Table className="table table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th className="text-center fw-bold" style={{ width: '80px' }}>S.No.</th>
                <th className="text-center fw-bold" style={{ width: '300px' }}>Document Name</th>
                <th className="text-center fw-bold" style={{ width: '200px' }}>Format / Max Size (MB)</th>
                <th className="text-center fw-bold" style={{ width: '150px' }}>Upload</th>
                <th className="text-center fw-bold">Already uploaded Files</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td className="text-center fw-semibold">{doc.sNo}</td>
                  <td className="text-start fw-medium">{doc.documentName}</td>
                  <td className="text-center text-muted">{doc.formatMaxSize}</td>
                  <td className="text-center">
                    <div className="position-relative">
                      <Form.Control
                        type="file"
                        accept={doc.formatMaxSize.includes('PDF') ? '.pdf' : '.jpg,.jpeg,.png,.pdf'}
                        onChange={(e) => {
                          const file = (e.target as HTMLInputElement).files?.[0] || null;
                          onFileUpload(doc.id, file);
                        }}
                        className="form-control-sm"
                        style={{ fontSize: '12px' }}
                      />
                    </div>
                  </td>
                  <td className="text-center">
                    {doc.uploadedFile ? (
                      <div className="d-flex align-items-center justify-content-center">
                        <span className="text-success me-2">
                          <i className="bi bi-check-circle-fill"></i>
                        </span>
                        <small className="text-success fw-medium">
                          {doc.fileName}
                        </small>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="ms-2 btn-sm"
                          onClick={() => onRemoveFile(doc.id)}
                          style={{ fontSize: '10px', padding: '2px 6px' }}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted">
                        <small>No file uploaded</small>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
      
        <div className="d-flex justify-content-end mt-4">
        <Button 
            variant="primary" 
            onClick={onSubmit}
            className="btn-primary fw-semibold"
            disabled={disableSubmit}
        >
            {submitLabel}
            <i className="bi bi-arrow-right ms-2"></i>
        </Button>
        </div>
    </Card.Body>
  </Card>
);

export default UploadData;