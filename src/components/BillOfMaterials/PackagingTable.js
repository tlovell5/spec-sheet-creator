import React, { memo } from 'react';

const PackagingTable = ({ 
  packaging, 
  onAddPackaging, 
  onRemovePackaging, 
  onUpdatePackaging 
}) => {
  return (
    <div className="packaging-table-container mb-4">
      <h3 className="mb-3">Packaging</h3>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>SKU</th>
              <th>Description</th>
              <th>QTY (ea)</th>
              <th>Weight (g)</th>
              <th>Length (in)</th>
              <th>Width (in)</th>
              <th>Height (in)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {packaging.map((item, index) => (
              <tr key={item.id || index}>
                <td>{index + 1}</td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={item.sku || ''}
                    onChange={(e) => onUpdatePackaging(index, 'sku', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={item.description || ''}
                    onChange={(e) => onUpdatePackaging(index, 'description', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={item.qty || ''}
                    onChange={(e) => onUpdatePackaging(index, 'qty', e.target.value)}
                    min="0"
                    step="1"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={item.weight || ''}
                    onChange={(e) => onUpdatePackaging(index, 'weight', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={item.length || ''}
                    onChange={(e) => onUpdatePackaging(index, 'length', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={item.width || ''}
                    onChange={(e) => onUpdatePackaging(index, 'width', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={item.height || ''}
                    onChange={(e) => onUpdatePackaging(index, 'height', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => onRemovePackaging(index)}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        className="btn btn-primary"
        onClick={onAddPackaging}
      >
        Add Packaging
      </button>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(PackagingTable);
