import React from 'react';
import { Card, Table, Button, ButtonGroup, Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';

interface ActionButton {
  label: string;
  icon: string;
  variant?: string;
  onClick: (rowData: any) => void;
}

interface DataTableProps {
  title: string;
  columns: string[];
  rows: any[];
  onActionClick?: (rowData: any) => void;
  isMobileView: boolean;
  // Enhanced action configuration
  actionButton?: {
    label: string;
    icon: string;
    variant?: string;
  };
  // New: Support for multiple actions
  multipleActions?: ActionButton[];
  // New: Custom render function for action cell
  renderActionCell?: (row: any) => React.ReactNode;
  // New: Force horizontal layout for actions
  forceHorizontalActions?: boolean;
  // New: Show only icons with tooltip labels
  showOnlyIcons?: boolean;
}

const DataTable: React.FC<DataTableProps> = ({
  title,
  columns,
  rows,
  onActionClick,
  isMobileView,
  actionButton = { label: 'Details', icon: 'bi-ticket-detailed', variant: 'primary' },
  multipleActions,
  renderActionCell,
  forceHorizontalActions = false,
  showOnlyIcons = false
}) => {
  
  const renderActions = (row: any) => {
    // If custom render function is provided, use it
    if (renderActionCell) {
      return renderActionCell(row);
    }
    
    // If multiple actions are provided, render them
    if (multipleActions && multipleActions.length > 0) {
      if (multipleActions.length === 1) {
        // Single action button
        const action = multipleActions[0];
        const buttonContent = showOnlyIcons ? (
          <i className={action.icon} style={{ fontSize: '14px' }}></i>
        ) : (
          <>
            <i className={`${action.icon} me-1`}></i> {action.label}
          </>
        );

        if (showOnlyIcons) {
          return (
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id={`tooltip-${action.label}`}>{action.label}</Tooltip>}
            >
              <Button 
                variant={action.variant || 'primary'}
                size="sm"
                className="d-flex align-items-center justify-content-center action-btn-icon"
                style={{ 
                  fontSize: '12px',
                  width: '32px',
                  height: '32px',
                  padding: '0'
                }}
                onClick={() => action.onClick(row)}
              >
                {buttonContent}
              </Button>
            </OverlayTrigger>
          );
        }

        return (
          <Button 
            variant={action.variant || 'primary'}
            size="sm"
            className="d-flex align-items-center small"
            style={{ fontSize: '12px' }}
            onClick={() => action.onClick(row)}
          >
            {buttonContent}
          </Button>
        );
      } else if (forceHorizontalActions || multipleActions.length <= 3) {
        // Horizontal button layout - force or 2-3 actions
        return (
          <div className="d-flex flex-wrap gap-1 justify-content-center">
            {multipleActions.map((action, index) => {
              const buttonContent = showOnlyIcons ? (
                <i className={action.icon} style={{ fontSize: '14px' }}></i>
              ) : (
                <>
                  <i className={`${action.icon} me-1`} style={{ fontSize: '10px' }}></i> 
                  <span className="action-label">{action.label}</span>
                </>
              );

              if (showOnlyIcons) {
                return (
                  <OverlayTrigger
                    key={index}
                    placement="top"
                    overlay={<Tooltip id={`tooltip-${index}-${action.label}`}>{action.label}</Tooltip>}
                  >
                    <Button
                      variant={action.variant || 'primary'}
                      size="sm"
                      className="d-flex align-items-center justify-content-center action-btn-icon"
                      style={{ 
                        fontSize: '12px',
                        width: '32px',
                        height: '32px',
                        padding: '0',
                        minWidth: '32px'
                      }}
                      onClick={() => action.onClick(row)}
                    >
                      {buttonContent}
                    </Button>
                  </OverlayTrigger>
                );
              }

              return (
                <Button
                  key={index}
                  variant={action.variant || 'primary'}
                  size="sm"
                  className="d-flex align-items-center small action-btn"
                  style={{ 
                    fontSize: '10px', 
                    minWidth: 'auto',
                    padding: '0.25rem 0.5rem',
                    whiteSpace: 'nowrap'
                  }}
                  onClick={() => action.onClick(row)}
                >
                  {buttonContent}
                </Button>
              );
            })}
          </div>
        );
      } else {
        // Dropdown for more than 4 actions (when not forced horizontal)
        return (
          <Dropdown>
            <Dropdown.Toggle variant="primary" size="sm" className="small">
              <i className="bi bi-three-dots-vertical me-1"></i> Actions
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {multipleActions.map((action, index) => (
                <Dropdown.Item
                  key={index}
                  onClick={() => action.onClick(row)}
                  className="d-flex align-items-center small"
                >
                  <i className={`${action.icon} me-2`}></i> {action.label}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        );
      }
    }
    
    // Default single action button (backward compatibility)
    const buttonContent = showOnlyIcons ? (
      <i className={actionButton.icon} style={{ fontSize: '14px' }}></i>
    ) : (
      <>
        <i className={`${actionButton.icon} me-1`}></i> {actionButton.label}
      </>
    );

    if (showOnlyIcons) {
      return (
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id={`tooltip-default`}>{actionButton.label}</Tooltip>}
        >
          <Button 
            variant={actionButton.variant || 'primary'}
            size="sm"
            className="d-flex align-items-center justify-content-center action-btn-icon"
            style={{ 
              fontSize: '12px',
              width: '32px',
              height: '32px',
              padding: '0'
            }}
            onClick={() => onActionClick?.(row)}
          >
            {buttonContent}
          </Button>
        </OverlayTrigger>
      );
    }

    return (
      <Button 
        variant={actionButton.variant || 'primary'}
        size="sm"
        className="d-flex align-items-center small"
        style={{ fontSize: '12px' }}
        onClick={() => onActionClick?.(row)}
      >
        {buttonContent}
      </Button>
    );
  };

  const renderMobileActions = (row: any) => {
    // If custom render function is provided, use it
    if (renderActionCell) {
      return (
        <div className="mt-2">
          {renderActionCell(row)}
        </div>
      );
    }
    
    // If multiple actions are provided, render them
    if (multipleActions && multipleActions.length > 0) {
      return (
        <div className="mt-2 d-flex flex-column gap-2">
          {multipleActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'primary'}
              size="sm"
              className="d-flex align-items-center justify-content-center small"
              onClick={() => action.onClick(row)}
            >
              <i className={`${action.icon} me-2`}></i> {action.label}
            </Button>
          ))}
        </div>
      );
    }
    
    // Default single action button (backward compatibility)
    return (
      <div className="mt-2">
        <Button
          variant={actionButton.variant || 'primary'}
          size="sm"
          className="d-flex align-items-center w-100 justify-content-center small"
          onClick={() => onActionClick?.(row)}
        >
          <i className={`${actionButton.icon} me-1`}></i> {actionButton.label}
        </Button>
      </div>
    );
  };

  return (
    <Card className="border-1 shadow-dark p-0">
      <Card.Body className="p-0">
        
        {/* Desktop View */}
        {!isMobileView ? (
          <Table className="mb-0 sleek-bordered-table" style={{ borderRadius: '14px', overflow: 'hidden', width: '100%' }}>
            <thead>
              <tr>
                <th colSpan={columns.length} className="p-2" style={{
                  backgroundColor: '#c7ced1',
                  borderBottom: '2px solid #dee2e6',
                  color: '#000'
                }}>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: '18px' }}>{title}</h5>
                </th>
              </tr>
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className="p-3 fw-bold small" style={{
                    backgroundColor: '#c7ced1',
                    color: '#000',
                    borderRight: idx !== columns.length - 1 ? '1px solid #dee2e6' : 'none',
                    borderBottom: '1px solid #dee2e6',
                    minWidth: col === 'Action' && showOnlyIcons ? '150px' : col === 'Action' ? '200px' : 'auto'
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="sleek-tr">
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className="bg-light p-3 small fw-normal sleek-td" style={{
                        minWidth: col === 'Action' && showOnlyIcons ? '150px' : col === 'Action' ? '200px' : 'auto'
                      }}>
                        {col === 'Action' ? renderActions(row) : (row[col] || '-')}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr className="sleek-tr">
                  <td colSpan={columns.length} className="text-center text-danger fw-medium bg-light p-4 sleek-td">
                    <div className="d-flex flex-column align-items-center">
                      <i className="bi bi-exclamation-triangle-fill mb-2" style={{ fontSize: '24px' }}></i>
                      <span>No Data Found</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        ) : (
          /* Mobile Card View */
          <div>
            {rows.length > 0 ? (
              rows.map((row, rowIndex) => (
                <Card key={rowIndex} className="mb-3 mobile-card">
                  <Card.Body className="p-3 small lh-base">
                    {columns.map((col, colIndex) => (
                      col === 'Action' ? renderMobileActions(row) : (
                        <div key={colIndex} className="d-flex flex-column border-bottom pb-2 mb-3">
                          <div className="fw-bold text-dark small">{col}:</div>
                          <div className="text-primary small">{row[col] || '-'}</div>
                        </div>
                      )
                    ))}
                  </Card.Body>
                </Card>
              ))
            ) : (
              <Card className="mb-3 no-data-card">
                <Card.Body className="p-3 text-center text-danger fw-semibold">
                  <i className="bi bi-exclamation-triangle-fill me-2" style={{ fontSize: '16px' }}></i>
                  No Data Found
                </Card.Body>
              </Card>
            )}
          </div>
        )}
      </Card.Body>
      
      {/* Enhanced styles for icon-only action buttons */}
      <style>{`
        .action-btn {
          transition: all 0.2s ease;
        }
        .action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        
        .action-btn-icon {
          transition: all 0.2s ease;
          border-radius: 50% !important;
        }
        .action-btn-icon:hover {
          transform: translateY(-1px) scale(1.1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        /* Responsive action buttons */
        @media (max-width: 1200px) {
          .action-btn {
            font-size: 9px !important;
            padding: 0.2rem 0.4rem !important;
          }
          .action-btn i {
            font-size: 9px !important;
          }
        }
        
        @media (max-width: 992px) {
          .action-btn .action-label {
            display: none;
          }
          .action-btn {
            padding: 0.3rem !important;
            min-width: 32px !important;
          }
          .action-btn i {
            margin: 0 !important;
          }
        }
        
        @media (max-width: 768px) {
          .btn-group {
            flex-direction: column;
            width: 100%;
          }
          .btn-group .btn {
            margin-right: 0;
            margin-bottom: 4px;
            width: 100%;
          }
          .btn-group .btn:last-child {
            margin-bottom: 0;
          }
        }
        
        /* Tooltip styles */
        .tooltip {
          font-size: 12px;
        }
        .tooltip-inner {
          background-color: #333;
          color: white;
          border-radius: 4px;
          padding: 4px 8px;
        }
      `}</style>
    </Card>
  );
};

export default DataTable;