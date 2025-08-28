'use client';
import React from 'react';

const Header2: React.FC = () => {
  return (
    <>
      <header className="main-header">
        
        {}
      </header>

      <style>{`
        .main-header {
          background: transparent;
          height: 50px;
          width: 100%;
          display: flex;
          align-items: center;
        }
        .header-title {
          color: white;
          margin-left: 20px;
          font-size: 1.5rem;
        }
      `}</style>
    </>
  );
};

export default Header2;