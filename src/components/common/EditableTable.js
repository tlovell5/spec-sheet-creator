import React, { useState } from 'react';
import FormInput from './FormInput';

/**
 * Reusable editable table component
 * @param {Object} props - Component props
 * @param {Array} props.columns - Array of column definitions [{id, label, type, width, required, validate}]
 * @param {Array} props.data - Array of data objects
 * @param {function} props.onAdd - Function called when a row is added
 * @param {function} props.onUpdate - Function called when a row is updated
 * @param {function} props.onDelete - Function called when a row is deleted
 * @param {string} props.className - Additional CSS class
 * @param {string} props.emptyMessage - Message to show when data is empty
 * @param {boolean} props.showActions - Whether to show action buttons
 */
const EditableTable = ({
  columns = [],
  data = [],
  onAdd,
  onUpdate,
  onDelete,
  className = '',
  emptyMessage = 'No data available',
  showActions = true
}) => {
  const [editingRow, setEditingRow] = useState(null);
  const [newRow, setNewRow] = useState({});
  const [errors, setErrors] = useState({});
  
  // Initialize a new row with empty values
  const initializeNewRow = () => {
    const row = {};
    columns.forEach(column => {
      row[column.id] = '';
    });
    setNewRow(row);
  };
  
  // Validate a row
  const validateRow = (row) => {
    const newErrors = {};
    let isValid = true;
    
    columns.forEach(column => {
      if (column.required && !row[column.id]) {
        newErrors[column.id] = `${column.label} is required`;
        isValid = false;
      } else if (column.validate && row[column.id]) {
        const validationResult = column.validate(row[column.id]);
        if (!validationResult.isValid) {
          newErrors[column.id] = validationResult.message;
          isValid = false;
        }
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Handle adding a new row
  const handleAddRow = () => {
    if (validateRow(newRow)) {
      onAdd(newRow);
      initializeNewRow();
    }
  };
  
  // Handle updating a row
  const handleUpdateRow = (index) => {
    if (validateRow(editingRow)) {
      onUpdate(editingRow, index);
      setEditingRow(null);
    }
  };
  
  // Handle deleting a row
  const handleDeleteRow = (index) => {
    if (window.confirm('Are you sure you want to delete this row?')) {
      onDelete(index);
    }
  };
  
  // Handle editing a row
  const handleEditRow = (row, index) => {
    setEditingRow({ ...row, index });
  };
  
  // Handle canceling edit
  const handleCancelEdit = () => {
    setEditingRow(null);
    setErrors({});
  };
  
  // Handle input change for new row
  const handleNewRowChange = (id, value) => {
    setNewRow(prev => ({
      ...prev,
      [id]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };
  
  // Handle input change for editing row
  const handleEditingRowChange = (id, value) => {
    setEditingRow(prev => ({
      ...prev,
      [id]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };
  
  // Initialize new row on component mount
  React.useEffect(() => {
    initializeNewRow();
  }, []);
  
  return (
    <div className={`editable-table ${className}`}>
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              {columns.map(column => (
                <th 
                  key={column.id}
                  style={{ width: column.width || 'auto' }}
                >
                  {column.label}
                  {column.required && <span className="text-danger ml-1">*</span>}
                </th>
              ))}
              {showActions && <th style={{ width: '100px' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, index) => (
                <tr key={index}>
                  {columns.map(column => (
                    <td key={`${index}-${column.id}`}>
                      {editingRow && editingRow.index === index ? (
                        <FormInput
                          type={column.type || 'text'}
                          value={editingRow[column.id]}
                          onChange={(e) => handleEditingRowChange(column.id, e.target.value)}
                          error={errors[column.id]}
                          inputProps={column.inputProps}
                        />
                      ) : (
                        column.render ? column.render(row[column.id], row, index) : row[column.id]
                      )}
                    </td>
                  ))}
                  {showActions && (
                    <td>
                      {editingRow && editingRow.index === index ? (
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-success"
                            onClick={() => handleUpdateRow(index)}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => handleEditRow(row, index)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => handleDeleteRow(index)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (showActions ? 1 : 0)} className="text-center">
                  {emptyMessage}
                </td>
              </tr>
            )}
            
            {/* New row input */}
            <tr className="new-row">
              {columns.map(column => (
                <td key={`new-${column.id}`}>
                  <FormInput
                    type={column.type || 'text'}
                    value={newRow[column.id]}
                    onChange={(e) => handleNewRowChange(column.id, e.target.value)}
                    error={errors[column.id]}
                    placeholder={`Enter ${column.label.toLowerCase()}`}
                    inputProps={column.inputProps}
                  />
                </td>
              ))}
              {showActions && (
                <td>
                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                    onClick={handleAddRow}
                  >
                    Add
                  </button>
                </td>
              )}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EditableTable;
