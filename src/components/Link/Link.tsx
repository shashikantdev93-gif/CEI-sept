import React from "react";

interface LinkProps {
  href?: string;
  children: React.ReactNode;
  color?: string;
  fontSize?: string;
}

const Link: React.FC<LinkProps> = ({ 
  href = "#", 
  children, 
  color = "#007bff", 
  fontSize = "14px" 
}) => {
  return (
    <div className="text-center">
      <a 
        href={href} 
        className="text-decoration-none" 
        style={{ color, fontSize }}
      >
        {children}
      </a>
    </div>
  );
};

export default Link;
