'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { ToastService } from '../../utils';
import Logo from '../Logo/Logo';
import encryptionService from '../../lib/encryptionService';

interface UserData {
  firstName?: string;
  lastName?: string;
  userName?: string;  
  roleName?: string;
  userId?: string;
}

const Header1: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userData, setUserData] = useState<UserData>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Get user data from token (similar to Angular)
  useEffect(() => {
    const getUserDataFromToken = () => {
      try {
        const tokenStr = localStorage.getItem('token');
        if (tokenStr) {
          const tokenData = JSON.parse(tokenStr);
          
          // Decrypt user data like Angular does
          const decryptedData = {
            firstName: tokenData.firstName ? encryptionService.get(tokenData.firstName) : '',
            lastName: tokenData.lastName ? encryptionService.get(tokenData.lastName) : '',
            userName: tokenData.userName ? encryptionService.get(tokenData.userName) : '',
            roleName: tokenData.roleName ? encryptionService.get(tokenData.roleName) : '',
            userId: tokenData.userId ? encryptionService.get(tokenData.userId) : ''
          };
          
          setUserData(decryptedData);
          console.log('🔐 [Header]: User data loaded:', decryptedData);
        }
      } catch (error) {
        console.error('❌ [Header]: Error loading user data:', error);
      }
    };

    getUserDataFromToken();
  }, []);

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLogout = async () => {
    try {
      await logout();
      ToastService.success('Logged out successfully!');
    } catch (error) {
      ToastService.error('Logout failed. Please try again.');
    }
  };

  const handleChangePassword = () => {
    // Navigate to change password page
    navigate('/change-password');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Get user display name
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

  return (
    <>
      {sidebarOpen && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} userData={userData} />}
      <header className="position-fixed top-0 w-100 d-flex align-items-center px-3" style={{ height: 70, backgroundColor: '#0052a3', zIndex: 1000 }}>
        
        {/* Left: Logo & Title */}
        <div className="d-flex align-items-center flex-grow-1">
          <div className="d-flex align-items-center justify-content-between mb-2" style={{ minWidth: '80px', width: '80px' }} >
              <div className="d-flex align-items-center">
                <div 
                  className="header-logo-box me-3" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    backgroundColor: '#0052a3', 
                    borderRadius: '8px',
                    width: '80px',
                    minWidth: '80px', 
                    height: '50px',
                    cursor: 'pointer'
                  }}
                  onClick={handleLogoClick}
                >
                  <Logo title="" subtitle="" titleColor="#fff" subtitleColor="#fff" />
                </div>
              </div>
              
              <div style={{ width: '150px' }}></div>
            </div>

          {/* Sidebar Icon */}
         <button
            className="btn d-flex align-items-center mb-2 gap-2 px-3 py-0 ms-5 border border-white rounded-pill bg-transparent text-white"
            style={{ fontWeight: 500, fontSize: 18, minWidth: 90}}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <i className="bi bi-list" style={{ fontSize: 22 }}></i>
            <span>Menu</span>
          </button>
        </div>
        
        {/* Center: Title */}
        <div className="flex-grow-1 ms-5">
             <div className="title-box me-3 ms-5 fw-bold" >
                  <h4 style={{ color: '#fff', fontSize: "30px", height: "50px", marginTop:"20px" }}>Chief Electric Officer</h4>
                </div>
        </div>
       
        {/* Right: Profile & Language */}
        <div className="d-flex align-items-center gap-3">
         
          {/* Profile Info */}
          <div className="d-flex align-items-center position-relative" ref={dropdownRef} style={{ cursor: 'pointer' }} onClick={() => setDropdownOpen((v) => !v)}>
            <img
              src="/assets/images/user-icon.png"
              alt="Profile Icon"
              style={{
                width: 25,
                height: 25,
                objectFit: 'contain',
                filter: 'brightness(2) invert(1)'
              }}
              className="me-2"
            />
            <span className="text-white fw-medium" style={{ fontSize: 16 }}>
              {getUserDisplayName()}
            </span>
            <span className="ms-1 text-white" style={{ fontSize: 12 }}>▼</span>
            {dropdownOpen && (
              <div className="position-absolute end-0 mt-2 bg-white rounded shadow" style={{ minWidth: 160, zIndex: 100, top: '100%' }}>
                <div className="d-flex align-items-center gap-2 px-3 py-2 dropdown-item" style={{ cursor: 'pointer' }} onClick={handleChangePassword}>
                  <img src="/assets/images/view_pass.png" alt="Change Password" style={{ width: 20, height: 20, objectFit: 'contain' }} />
                  <span className="text-dark">Change Password</span>
                </div>
                <div className="d-flex align-items-center gap-2 px-3 py-2 dropdown-item" style={{ cursor: 'pointer' }} onClick={handleLogout}>
                  <img src="/assets/images/logout-icon.svg" alt="Logout" style={{ width: 18, height: 18, objectFit: 'contain' }} />
                  <span className="text-dark">Logout</span>
                </div>
              </div>
            )}
          </div>
          {/* Language & Status */}
          <div className="d-flex align-items-center gap-2">
            <select className="form-select form-select-sm" defaultValue="en" style={{ width: 100 }}>
              <option value="en">English</option>
              <option value="pn">ਪੰਜਾਬੀ</option>
            </select>
            <span style={{
              width: 8,
              height: 8,
              backgroundColor: '#28a745',
              borderRadius: '50%',
              display: 'inline-block'
            }}></span>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header1;