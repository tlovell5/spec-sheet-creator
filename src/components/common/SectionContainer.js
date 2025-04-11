import React from 'react';

/**
 * Reusable section container component for spec sheet sections
 * @param {Object} props - Component props
 * @param {string} props.id - Section ID
 * @param {string} props.title - Section title
 * @param {React.ReactNode} props.children - Section content
 * @param {boolean} props.collapsible - Whether the section can be collapsed
 * @param {boolean} props.defaultCollapsed - Whether the section is collapsed by default
 * @param {string} props.className - Additional CSS class
 * @param {React.ReactNode} props.actions - Optional actions to display in the header
 * @param {boolean} props.compact - Whether to use compact styling
 */
const SectionContainer = ({
  id,
  title,
  children,
  collapsible = true,
  defaultCollapsed = false,
  className = '',
  actions,
  compact = true
}) => {
  return (
    <div id={id} className={`section-container ${className}`}>
      <div className="section-header">
        <h3 className="section-title">{title}</h3>
        {actions && <div className="section-actions">{actions}</div>}
      </div>
      <div className="section-body">
        {children}
      </div>
    </div>
  );
};

export default SectionContainer;
