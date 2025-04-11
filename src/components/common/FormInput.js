import React from 'react';

/**
 * Reusable form input component
 * @param {Object} props - Component props
 * @param {string} props.id - Input ID
 * @param {string} props.label - Input label
 * @param {string} props.type - Input type (text, number, email, etc.)
 * @param {string} props.value - Input value
 * @param {function} props.onChange - Change handler
 * @param {string} props.placeholder - Input placeholder
 * @param {boolean} props.required - Whether the input is required
 * @param {string} props.error - Error message
 * @param {string} props.className - Additional CSS class
 * @param {Object} props.inputProps - Additional props for the input element
 * @param {string} props.size - Input size (sm, md, lg)
 */
const FormInput = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  className = '',
  inputProps = {},
  size = 'md'
}) => {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  const isInvalid = !!error;
  
  return (
    <div className={`form-group compact ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`form-control form-control-${size} ${isInvalid ? 'is-invalid' : ''}`}
        required={required}
        {...inputProps}
      />
      {isInvalid && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default FormInput;
