import React from 'react';
// Removed import for 'next/image' as it's not available in Vite

interface LogoSectionProps {
  variant?: 'desktop' | 'mobile';
  className?: string;
}

const LogoSection: React.FC<LogoSectionProps> = ({ 
  variant = 'desktop',
  className = '' 
}) => {
  const isDesktop = variant === 'desktop';
  
  return (
    <div className={`d-flex flex-column align-items-center ${className}`}>
      <div className={isDesktop ? 'mb-4' : 'mb-3'}>
        <img
          src="/assets/Images/cei_logo.jpg"
          alt="CEI Logo"
          width={isDesktop ? 250 : 80}
          height={isDesktop ? 120 : 60}
          className="img-fluid"
          style={{ 
            maxWidth: isDesktop ? '250px' : '200px', 
            height: 'auto',
            borderRadius: isDesktop ? '10px' : '8px'
          }}
        />
      </div>
      <h5 
        className={`text-white fw-normal mb-0 ${isDesktop ? 'h5' : 'h6'}`}
        style={{ 
          fontSize: isDesktop ? '18px' : '16px',
          fontWeight: '400',
          letterSpacing: '0.5px'
        }}
      >
        Chief Electric Inspector, Punjab
      </h5>
    </div>
  );
};

export default LogoSection;
