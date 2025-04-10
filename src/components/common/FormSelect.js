import React from 'react';

/**
 * Reusable form select component
 * @param {Object} props - Component props
 * @param {string} props.id - Select ID
 * @param {string} props.label - Select label
 * @param {Array} props.options - Array of options [{value, label}]
 * @param {string|number} props.value - Selected value
 * @param {function} props.onChange - Change handler
 * @param {boolean} props.required - Whether the select is required
 * @param {string} props.error - Error message
 * @param {string} props.className - Additional CSS class
 * @param {Object} props.selectProps - Additional props for the select element
 */
const FormSelect = ({
  id,
  label,
  options = [],
  value,
  onChange,
  required = false,
  error,
  className = '',
  selectProps = {}
}) => {
  const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  const isInvalid = !!error;
  
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`form-control ${isInvalid ? 'is-invalid' : ''}`}
        value={value || ''}
        onChange={onChange}
        required={required}
        {...selectProps}
      >
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {isInvalid && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default FormSelect;
