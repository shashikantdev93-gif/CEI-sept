import React from "react";

interface InputFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  type = "text", 
  value, 
  onChange, 
  placeholder 
}) => {
  return (
    <div className="mb-4">
      <label className="form-label fw-semibold mb-2" style={{ color: "#595c5f", fontSize: "14px" }}>
        {label}
      </label>
      <input
        type={type}
        className="form-control form-control-sm"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          borderRadius: "50px",
          border: "1px solid #e0e0e0",
          padding: "6px 20px",
          fontSize: "14px"
        }}
      />
    </div>
  );
};

export default InputField;
