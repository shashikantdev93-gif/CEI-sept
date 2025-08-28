"use client";
import '../../styles/sidebar-zoom.css';
import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => Promise<void>;
}

const user = {
  name: 'Shashikant Gupta',
  profileImg: '/assets/images/user-png-33857.png',
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onLogout }) => {
  const handleLogoutClick = async () => {
    onClose();
    await onLogout();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-25 ${isOpen ? '' : 'd-none'}`}
        style={{ zIndex: 1000 }}
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <aside
        className={`position-fixed start-0 h-100 text-dark shadow-lg d-flex flex-column`}
        style={{
          top: '80px', 
          height: 'calc(100vh - 80px)',
          width: '18vw',
          maxWidth: 320,
          backgroundColor: '#cfe2ff',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s',
          zIndex: 1001,
        }}
      >
        {/* Close Button */}
        <button
          className="btn btn-link text-dark fs-2 position-absolute top-0 end-0 mt-2 me-3"
          onClick={onClose}
          style={{ zIndex: 1002 }}
        >
          ×
        </button>
        
        {/* Profile Section */}
        <div className="d-flex flex-column align-items-center mt-3 py-4">
          <div className="rounded-circle bg-primary shadow d-flex align-items-center justify-content-center mb-2" style={{ width: 150, height: 150 }}>
            <img
              src={user.profileImg}
              alt="User Profile"
              width={90}
              height={90}
              className="rounded-circle"
              style={{ objectFit: 'cover', background: 'transparent' }}
            />
          </div>
          <div className="fw-semibold text-dark mt-2" style={{ fontSize: 20 }}>
            {user.name}
          </div>
        </div>

        {/* Menu Section */}
        <div className="flex-grow-1 px-3">
          {/* Dashboard */}
          <div className="d-flex align-items-center gap-3 px-3 py-3 rounded bg-transparent menu-item sidebar-zoom-text">
            <i className="bi bi-grid-3x3-gap" style={{ fontSize: '1.2rem' }}></i>
            <span className="fw-medium" style={{ fontSize: 17 }}>Dashboard</span>
          </div>

          {/* Support */}
          <div className="d-flex align-items-center gap-3 px-3 py-3 rounded bg-transparent menu-item sidebar-zoom-text">
            <i className="bi bi-headphones" style={{ fontSize: '1.2rem' }}></i>
            <span className="fw-medium" style={{ fontSize: 20 }}>Support</span>
          </div>

          {/* Logout */}
          <div
            className="d-flex align-items-center gap-3 px-3 py-3 rounded bg-transparent menu-item sidebar-zoom-text"
            style={{ cursor: 'pointer' }}
            onClick={handleLogoutClick}
          >
            <i className="bi bi-box-arrow-left" style={{ fontSize: '1.2rem' }}></i>
            <span className="fw-medium" style={{ fontSize: 17 }}>Logout</span>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="d-flex align-items-center border-top border-secondary px-3" style={{ height: 60 }}>
          {/* Add any bottom content here */}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;