import React from "react";

interface FooterProps {
  text?: string;
}

const Footer: React.FC<FooterProps> = ({
  text = "© 2025, Designed and Developed by NIC Punjab."
}) => {
  return (
    <div className="position-fixed bottom-0 w-100 text-center pb-3 bg-white" style={{ left: 0 }}>
      <span style={{ fontSize: '.9em', fontWeight: 800, color: '#6c757d', letterSpacing: '0.5px' }}>
        {text}
      </span>
    </div>
  );
};

export default Footer;