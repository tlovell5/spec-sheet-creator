import React from 'react';
import Card from './Card';

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
 */
const SectionContainer = ({
  id,
  title,
  children,
  collapsible = true,
  defaultCollapsed = false,
  className = '',
  actions
}) => {
  return (
    <div id={id} className={`spec-sheet-section ${className}`}>
      <Card
        title={title}
        collapsible={collapsible}
        defaultCollapsed={defaultCollapsed}
        actions={actions}
        className="mb-4"
      >
        {children}
      </Card>
    </div>
  );
};

export default SectionContainer;
