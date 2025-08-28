import React from "react";

interface LogoProps {
  title?: string;
  subtitle?: string;
  titleColor?: string;
}

const Logo: React.FC<LogoProps & { subtitleColor?: string }> = ({ 
  title = "Chief Electric ", 
  subtitle = "Inspector", 
  titleColor = "#0c3064",
  subtitleColor = "#0c3064",
}) => {
  return (
    <div className="mb-4 d-flex align-items-center">
      <img 
        src="/assets/images/cei_logo.jpg" 
        alt="Logo" 
        style={{ height: "40px", width: "90px", marginTop: "20px", marginLeft: "8px" }} 
      />
      <span className="fw-bold" style={{ fontSize: "27px", height: "30px", marginTop: "10px", marginLeft: "2px", color: titleColor, whiteSpace: "nowrap" }}>
        {title} <span style={{ color: subtitleColor }}>{subtitle}</span>
      </span>
    </div>
  );
};

export default Logo;
