import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  type = "button",
  variant = "primary",
  size = "sm"
}) => {
  return (
    <button 
      type={type}
      className={`btn btn-${size} w-80 fw-bold mb-3`}
      onClick={onClick}
      style={{
        backgroundColor: variant === "primary" ? "#007bff" : "#6c757d",
        border: "none",
        borderRadius: "50px",
        padding: "8px 16px",
        fontSize: "14px",
        color: "white"
      }}
    >
      {children}
    </button>
  );
};

export default Button;
