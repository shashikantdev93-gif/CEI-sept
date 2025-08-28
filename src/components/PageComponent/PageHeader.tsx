import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
  return (
    <>
      <h2 className="fw-bold mb-2 text-dark" style={{ fontSize: "32px", }}>
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted mb-4 fw-bold text-dark" style={{ fontSize: "20px", }}>
          {subtitle}
        </p>
      )}
    </>
  );
};

export default PageHeader;
