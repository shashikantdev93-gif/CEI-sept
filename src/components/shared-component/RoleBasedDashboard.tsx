import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import type { RoleName } from '../../types';

// Dashboard card configuration for different roles (Angular parity)
interface DashboardCardProps {
  title: string;
  count: number;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  onClick: () => void;
}

interface DashboardStats {
  projectSiteApplied: number;
  rejected: number;
  pending: number;
  processed: number;
  agenda?: number;
  department?: number;
  applicant?: number;
}

interface RoleBasedDashboardProps {
  roleName: RoleName;
  stats: DashboardStats;
  onCardClick: (category: string) => void;
  loading?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, count, icon, color, onClick }) => (
  <Col xl={3} lg={3} md={6} sm={6} className="mb-3">
    <Card 
      className={`text-white bg-${color} cursor-pointer h-100`} 
      onClick={onClick}
      style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <Card.Body className="d-flex align-items-center">
        <div className="me-3">
          <i className={`${icon} fs-2`}></i>
        </div>
        <div>
          <Card.Title className="h5 mb-1">{title}</Card.Title>
          <Card.Text className="h3 mb-0">{count}</Card.Text>
        </div>
      </Card.Body>
    </Card>
  </Col>
);

/**
 * Role-based dashboard cards component (Angular parity)
 * Displays different cards based on user role
 */
export const RoleBasedDashboard: React.FC<RoleBasedDashboardProps> = ({
  roleName,
  stats,
  onCardClick,
  loading = false
}) => {
  // Contractor (CONS) cards - Angular parity
  const contractorCards: DashboardCardProps[] = [
    {
      title: 'CAF Applied',
      count: stats.projectSiteApplied,
      icon: 'bi-file-earmark-plus',
      color: 'info',
      onClick: () => onCardClick('ProjectSiteApplied')
    },
    {
      title: 'Rejected',
      count: stats.rejected,
      icon: 'bi-x-circle',
      color: 'danger',
      onClick: () => onCardClick('Rejected')
    },
    {
      title: 'Pending',
      count: stats.pending,
      icon: 'bi-clock',
      color: 'warning',
      onClick: () => onCardClick('Inbox')
    },
    {
      title: 'Processed',
      count: stats.processed,
      icon: 'bi-check-circle',
      color: 'success',
      onClick: () => onCardClick('Closed')
    }
  ];

  // Officer cards (XEN, SUPP, SDO, CEI, SUPT, NDOF, ADMN) - Angular parity
  const officerCards: DashboardCardProps[] = [
    {
      title: 'Department',
      count: stats.department || 0,
      icon: 'bi-building',
      color: 'primary',
      onClick: () => onCardClick('Department')
    },
    {
      title: 'Applicant',
      count: stats.applicant || 0,
      icon: 'bi-people',
      color: 'info',
      onClick: () => onCardClick('Applicant')
    }
  ];

  // Special cards for CEI and SUPT - Angular parity
  const agendaCard: DashboardCardProps = {
    title: 'Agenda',
    count: stats.agenda || 0,
    icon: 'bi-calendar-check',
    color: 'success',
    onClick: () => onCardClick('Agenda')
  };

  // Admin-specific cards
  const adminCards: DashboardCardProps[] = [
    ...officerCards,
    {
      title: 'User Management',
      count: 0,
      icon: 'bi-person-gear',
      color: 'warning',
      onClick: () => onCardClick('UserManagement')
    },
    {
      title: 'Reports',
      count: 0,
      icon: 'bi-graph-up',
      color: 'danger',
      onClick: () => onCardClick('Reports')
    }
  ];

  // Get cards based on role
  const getCardsForRole = (): DashboardCardProps[] => {
    switch (roleName) {
      case 'CONS':
        return contractorCards;
      
      case 'XEN':
      case 'SUPP':
      case 'SDO':
      case 'NDOF':
        return officerCards;
      
      case 'CEI':
      case 'SUPT':
        return [...officerCards, agendaCard];
      
      case 'ADMN':
        return adminCards;
      
      case 'LICS':
        return [
          {
            title: 'License Applications',
            count: stats.pending || 0,
            icon: 'bi-card-checklist',
            color: 'primary',
            onClick: () => onCardClick('LicenseApplications')
          },
          {
            title: 'Approved Licenses',
            count: stats.processed || 0,
            icon: 'bi-shield-check',
            color: 'success',
            onClick: () => onCardClick('ApprovedLicenses')
          }
        ];
      
      default:
        return contractorCards; // Default to contractor view
    }
  };

  const cards = getCardsForRole();

  if (loading) {
    return (
      <Row className="mt-4 d-flex justify-content-between">
        {[1, 2, 3, 4].map((i) => (
          <Col xl={3} lg={3} md={6} sm={6} key={i} className="mb-3">
            <Card className="h-100">
              <Card.Body className="d-flex align-items-center">
                <div className="me-3">
                  <div className="placeholder-glow">
                    <div className="placeholder bg-secondary rounded" style={{ width: '40px', height: '40px' }}></div>
                  </div>
                </div>
                <div>
                  <div className="placeholder-glow">
                    <div className="placeholder bg-secondary" style={{ width: '100px', height: '20px' }}></div>
                  </div>
                  <div className="placeholder-glow mt-1">
                    <div className="placeholder bg-secondary" style={{ width: '60px', height: '30px' }}></div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <Row className="mt-4 d-flex justify-content-between">
      {cards.map((card, index) => (
        <DashboardCard key={index} {...card} />
      ))}
    </Row>
  );
};

export default RoleBasedDashboard;