import React from "react";

interface CardContainerProps {
  children: React.ReactNode;
}

const CardContainer: React.FC<CardContainerProps> = ({ children }) => {
  return (
    <div className="container vh-100 d-flex align-items-center justify-content-center card-container">
      <div className="row justify-content-center w-100 mx-1">
        <div className="col-12">
          <div className="card shadow-lg border-0" style={{ borderRadius: "24px", overflow: "hidden", width: "100%" }}>
            <div className="row g-0 w-100">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardContainer;
