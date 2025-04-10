import React, { memo } from 'react';

const InclusionsTable = ({ 
  inclusions, 
  onAddInclusion, 
  onRemoveInclusion, 
  onUpdateInclusion 
}) => {
  return (
    <div className="inclusions-table-container mb-4">
      <h3 className="mb-3">Inclusions</h3>
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inclusions.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">No inclusions added yet</td>
              </tr>
            ) : (
              inclusions.map((inclusion, index) => (
                <tr key={inclusion.id || index}>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      value={inclusion.name || ''}
                      onChange={(e) => onUpdateInclusion(index, 'name', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={inclusion.quantity || ''}
                      onChange={(e) => onUpdateInclusion(index, 'quantity', e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td>
                    <select
                      className="form-control"
                      value={inclusion.unit || 'g'}
                      onChange={(e) => onUpdateInclusion(index, 'unit', e.target.value)}
                    >
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="oz">oz</option>
                      <option value="lbs">lbs</option>
                      <option value="ea">ea</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      value={inclusion.notes || ''}
                      onChange={(e) => onUpdateInclusion(index, 'notes', e.target.value)}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => onRemoveInclusion(index)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        className="btn btn-primary"
        onClick={onAddInclusion}
      >
        Add Inclusion
      </button>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(InclusionsTable);
