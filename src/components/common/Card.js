import React from 'react';

/**
 * Reusable card component for wrapping content sections
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS class for the card
 * @param {string} props.headerClassName - Additional CSS class for the card header
 * @param {string} props.bodyClassName - Additional CSS class for the card body
 * @param {React.ReactNode} props.actions - Optional actions to display in the header
 * @param {boolean} props.collapsible - Whether the card can be collapsed
 * @param {boolean} props.defaultCollapsed - Whether the card is collapsed by default
 */
const Card = ({
  title,
  children,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  actions,
  collapsible = false,
  defaultCollapsed = false
}) => {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  
  const toggleCollapse = () => {
    if (collapsible) {
      setCollapsed(!collapsed);
    }
  };
  
  return (
    <div className={`card ${className}`}>
      {title && (
        <div className={`card-header ${headerClassName}`}>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0" onClick={toggleCollapse} style={{ cursor: collapsible ? 'pointer' : 'default' }}>
              {title}
              {collapsible && (
                <span className="ml-2">
                  <i className={`fas fa-chevron-${collapsed ? 'down' : 'up'}`}></i>
                </span>
              )}
            </h5>
            {actions && <div className="card-actions">{actions}</div>}
          </div>
        </div>
      )}
      {!collapsed && (
        <div className={`card-body ${bodyClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
};

export default Card;
