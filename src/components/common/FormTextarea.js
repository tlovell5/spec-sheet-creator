import React from 'react';

/**
 * Reusable form textarea component
 * @param {Object} props - Component props
 * @param {string} props.id - Textarea ID
 * @param {string} props.label - Textarea label
 * @param {string} props.value - Textarea value
 * @param {function} props.onChange - Change handler
 * @param {string} props.placeholder - Textarea placeholder
 * @param {boolean} props.required - Whether the textarea is required
 * @param {string} props.error - Error message
 * @param {string} props.className - Additional CSS class
 * @param {number} props.rows - Number of rows
 * @param {Object} props.textareaProps - Additional props for the textarea element
 * @param {string} props.size - Textarea size (sm, md, lg)
 */
const FormTextarea = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  className = '',
  rows = 3,
  textareaProps = {},
  size = 'md'
}) => {
  const textareaId = id || `textarea-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  const isInvalid = !!error;
  
  return (
    <div className={`form-group compact ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="form-label">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`form-control form-control-${size} ${isInvalid ? 'is-invalid' : ''}`}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        {...textareaProps}
      ></textarea>
      {isInvalid && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default FormTextarea;
