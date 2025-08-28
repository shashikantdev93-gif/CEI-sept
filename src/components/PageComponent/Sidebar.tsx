"use client";
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => Promise<void>;
  userData: {
    firstName?: string;
    lastName?: string;
    userName?: string; // Add userName field
    roleName?: string;
    userId?: string;
  };
}

interface MenuItem {
  name: string;
  routerLink: string;
  icon: string;
  roles: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onLogout, userData }) => {
  const navigate = useNavigate();

  // Role-based menu items (matching Angular structure)
  const menuItems: MenuItem[] = [
    { name: "Dashboard", routerLink: '/dashboard', icon: "bi bi-grid-3x3-gap", roles: ['CONS'] },
    { name: "Dashboard", routerLink: '/dashboard/license-dashboard', icon: "bi bi-grid-3x3-gap", roles: ['LICS'] },
    { name: "Dashboard", routerLink: '/dashboard/officer-dashboard', icon: "bi bi-grid-3x3-gap", roles: ['CEI', 'CLRK', 'NDOF', 'SDO', 'SUPP', 'SUPT', 'XEN'] },
    { name: "Dashboard", routerLink: '/dashboard/admin-dashboard', icon: "bi bi-grid-3x3-gap", roles: ['ADMN'] },
    { name: "Agenda", routerLink: '/dashboard/agenda', icon: "bi bi-calendar", roles: ['SUPT'] },
    // Add more menu items as needed
  ];

  const handleLogoutClick = async () => {
    onClose();
    await onLogout();
  };

  const handleMenuClick = (routerLink: string) => {
    onClose();
    navigate(routerLink);
  };

  // Filter menu items based on user role
  const getVisibleMenuItems = () => {
    if (!userData.roleName) return [];
    return menuItems.filter(item => item.roles.includes(userData.roleName!));
  };

  // Get user display name - prioritize userName over firstName/lastName
  const getUserDisplayName = () => {
    if (userData.userName) {
      return userData.userName;
    }
    // Fallback to firstName + lastName if userName is not available
    if (userData.firstName && userData.lastName) {
      return `${userData.firstName} ${userData.lastName}`;
    }
    return userData.firstName || 'User';
  };

  const visibleMenuItems = getVisibleMenuItems();

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
          top: '70px', 
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
          <div className="rounded-circle bg-primary shadow d-flex align-items-center justify-content-center mb-2" style={{ width: 100, height: 100 }}>
            <img
              src="/assets/images/user-png-33857.png"
              alt="User Profile"
              width={70}
              height={70}
              className="rounded-circle"
              style={{ objectFit: 'cover', background: 'transparent' }}
            />
          </div>
          <div className="fw-semibold text-dark mt-2" style={{ fontSize: 20 }}>
            {getUserDisplayName()}
          </div>
          {/* Removed roleName display */}
        </div>

        {/* Menu Section */}
        <div className="flex-grow-1 px-3">
          {/* Dynamic Menu Items */}
          {visibleMenuItems.map((item, index) => (
            <div 
              key={index}
              className="d-flex align-items-center gap-3 px-3 py-3 rounded bg-transparent menu-item sidebar-zoom-text"
              style={{ cursor: 'pointer' }}
              onClick={() => handleMenuClick(item.routerLink)}
            >
              <i className={item.icon} style={{ fontSize: '1.2rem' }}></i>
              <span className="fw-medium" style={{ fontSize: 17 }}>{item.name}</span>
            </div>
          ))}

          {/* Support */}
          <div className="d-flex align-items-center gap-3 px-3 py-3 rounded bg-transparent menu-item sidebar-zoom-text">
            <i className="bi bi-headphones" style={{ fontSize: '1.2rem' }}></i>
            <span className="fw-medium" style={{ fontSize: 17 }}>Support</span>
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