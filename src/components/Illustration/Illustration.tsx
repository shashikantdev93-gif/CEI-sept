import React from "react";

interface IllustrationProps {
  src?: string;
  alt?: string;
}

const Illustration: React.FC<IllustrationProps> = ({ 
  src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f8f9fa'/%3E%3Cg transform='translate(50,50)'%3E%3Crect x='0' y='0' width='300' height='200' rx='20' fill='%23fff' stroke='%23e0e0e0'/%3E%3Ccircle cx='100' cy='80' r='30' fill='%23007bff'/%3E%3Crect x='150' y='60' width='120' height='15' rx='7' fill='%23e0e0e0'/%3E%3Crect x='150' y='85' width='80' height='10' rx='5' fill='%23e0e0e0'/%3E%3Crect x='20' y='130' width='260' height='50' rx='10' fill='%23f8f9fa'/%3E%3C/g%3E%3C/svg%3E",
  alt = "Login Illustration"
}) => {
  return (
    <div className="text-center p-1">
      <img 
        src={src}
        alt={alt}
        style={{ maxWidth: "100%", height: "auto", maxHeight: "250px" }}
      />
    </div>
  );
};

export default Illustration;
