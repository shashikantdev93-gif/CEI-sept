import React from 'react';
import { Card } from 'react-bootstrap';

// Admin Dashboard Count Cards - Angular Parity
// These components match the exact design from Angular admin dashboard

interface AdminDashboardCardProps {
  count: number;
  isActive: boolean;
  onClick: () => void;
}

/**
 * Inbox Card - Orange Theme
 * Matches Angular's app-pending component exactly
 */
export const InboxCard: React.FC<AdminDashboardCardProps> = ({ count, isActive, onClick }) => (
  <div 
    className={`card bg-c-yellow order-card h-50 font_family ${isActive ? 'cardBottomBorderPending' : ''}`}
    onClick={onClick}
    style={{ cursor: 'pointer' }}
  >
    <div className="card-block d-flex justify-content-between align-items-center h-100">
      {/* Left Section: Icon */}
      <i 
        style={{ color: 'rgb(219, 135, 0)', fontSize: '2.5rem' }} 
        className="bx bxs-inbox"
      ></i>

      {/* Right Section: Text and Number */}
      <div className="d-flex flex-column justify-content-center">
        <h6 
          className="mb-1 text-center" 
          style={{ color: 'rgb(219, 135, 0)', fontWeight: 400 }}
        >
          Inbox
        </h6>
        <span 
          className="text-center" 
          style={{ fontSize: '2.5rem', color: 'rgb(219, 135, 0)', fontWeight: 600 }}
        >
          {count}
        </span>
      </div>
    </div>
  </div>
);

/**
 * Closed Card - Green Theme  
 * Matches Angular's app-processed component exactly
 */
export const ClosedCard: React.FC<AdminDashboardCardProps> = ({ count, isActive, onClick }) => (
  <div 
    className={`card bg-c-submitted order-card h-50 font_family ${isActive ? 'cardBottomBorderProcessed' : ''}`}
    onClick={onClick}
    style={{ cursor: 'pointer' }}
  >
    <div className="card-block d-flex justify-content-between align-items-center h-100">
      {/* Left Section: Icon */}
      <i 
        style={{ color: '#198754', fontSize: '2.5rem' }} 
        className="bx bxs-check-circle"
      ></i>

      {/* Right Section: Text and Number */}
      <div className="d-flex flex-column justify-content-center">
        <h6 
          className="mb-1 text-center" 
          style={{ color: '#198754', fontWeight: 400 }}
        >
          Closed
        </h6>
        <span 
          className="text-center" 
          style={{ fontSize: '2.5rem', color: '#198754', fontWeight: 600 }}
        >
          {count}
        </span>
      </div>
    </div>
  </div>
);

/**
 * Rejected Card - Red Theme
 * Matches Angular's app-applied component exactly
 */
export const RejectedCard: React.FC<AdminDashboardCardProps> = ({ count, isActive, onClick }) => (
  <div 
    className={`card bg-c-pink order-card h-50 font_family ${isActive ? 'cardBottomBorderRejected' : ''}`}
    onClick={onClick}
    style={{ cursor: 'pointer' }}
  >
    <div className="card-block d-flex justify-content-between align-items-center h-100">
      {/* Left Section: Icon */}
      <i 
        style={{ color: '#dc3545', fontSize: '2.5rem' }} 
        className="bx bx-window-close"
      ></i>

      {/* Right Section: Text and Number */}
      <div className="d-flex flex-column justify-content-center">
        <h6 
          className="mb-1 text-center" 
          style={{ color: '#dc3545', fontWeight: 400 }}
        >
          Rejected
        </h6>
        <span 
          className="text-center" 
          style={{ fontSize: '2.5rem', color: '#dc3545', fontWeight: 600 }}
        >
          {count}
        </span>
      </div>
    </div>
  </div>
);

/**
 * Admin Dashboard Cards Container
 * Matches Angular's admin dashboard card layout exactly
 */
interface AdminDashboardCardsProps {
  dashboardCountData: {
    pendingCount: number;
    procesedCount: number; // Note: Angular uses 'procesedCount' (typo in backend)
    rejectedCount: number;
  } | null;
  tableTitle: string;
  onCardClick: (title: string, type: string) => void;
  loading?: boolean;
}

export const AdminDashboardCards: React.FC<AdminDashboardCardsProps> = ({
  dashboardCountData,
  tableTitle,
  onCardClick,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="row mt-4 d-flex justify-content-between">
        <div className="col-md-1"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="col-md-3">
            <Card className="order-card h-50">
              <Card.Body className="d-flex justify-content-between align-items-center h-100">
                <div className="placeholder-glow">
                  <div className="placeholder bg-secondary rounded" style={{ width: '40px', height: '40px' }}></div>
                </div>
                <div>
                  <div className="placeholder-glow">
                    <div className="placeholder bg-secondary" style={{ width: '80px', height: '20px' }}></div>
                  </div>
                  <div className="placeholder-glow mt-1">
                    <div className="placeholder bg-secondary" style={{ width: '50px', height: '30px' }}></div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        ))}
        <div className="col-md-1"></div>
      </div>
    );
  }

  if (!dashboardCountData) {
    return null;
  }

  return (
    <div className="row mt-4 d-flex justify-content-between">
      <div className="col-md-1"></div>
      
      {/* Inbox Card */}
      <div className="col-md-3">
        <InboxCard
          count={dashboardCountData.pendingCount}
          isActive={tableTitle === 'Inbox'}
          onClick={() => onCardClick('Inbox', 'Pending')}
        />
      </div>

      {/* Closed Card */}
      <div className="col-md-3">
        <ClosedCard
          count={dashboardCountData.procesedCount}
          isActive={tableTitle === 'Closed'}
          onClick={() => onCardClick('Closed', 'Processed')}
        />
      </div>

      {/* Rejected Card */}
      <div className="col-md-3">
        <RejectedCard
          count={dashboardCountData.rejectedCount}
          isActive={tableTitle === 'Rejected'}
          onClick={() => onCardClick('Rejected', 'Rejected')}
        />
      </div>

      <div className="col-md-1"></div>
    </div>
  );
};