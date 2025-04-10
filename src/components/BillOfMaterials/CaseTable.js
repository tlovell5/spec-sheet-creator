import React, { memo, useEffect } from 'react';

const CaseTable = ({ 
  caseItems, 
  productIdentification,
  onAddCaseItem, 
  onRemoveCaseItem, 
  onUpdateCaseItem 
}) => {
  // Handle special case for box quantity
  useEffect(() => {
    if (!caseItems || caseItems.length === 0 || !productIdentification) return;
    
    // Find box items
    const boxIndex = caseItems.findIndex(item => 
      item.description && item.description.toLowerCase() === 'box'
    );
    
    if (boxIndex !== -1 && productIdentification.unitsPerCase) {
      const unitsPerCase = parseInt(productIdentification.unitsPerCase) || 0;
      
      if (unitsPerCase > 0) {
        // Calculate box quantity (1 / units per case)
        const boxQty = (1 / unitsPerCase).toFixed(4);
        
        // Only update if the value has changed
        if (caseItems[boxIndex].qty !== boxQty) {
          onUpdateCaseItem(boxIndex, 'qty', boxQty);
        }
      }
    }
  }, [caseItems, productIdentification, onUpdateCaseItem]);

  return (
    <div className="case-table-container mb-4">
      <h3 className="mb-3">Case</h3>
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
            {caseItems.map((item, index) => (
              <tr key={item.id || index}>
                <td>{index + 1}</td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={item.sku || ''}
                    onChange={(e) => onUpdateCaseItem(index, 'sku', e.target.value)}
                  />
                </td>
                <td>
                  <select
                    className="form-control"
                    value={item.description || ''}
                    onChange={(e) => onUpdateCaseItem(index, 'description', e.target.value)}
                  >
                    <option value="">Select Type</option>
                    <option value="Box">Box</option>
                    <option value="Tray">Tray</option>
                    <option value="Divider">Divider</option>
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={item.qty || ''}
                    onChange={(e) => onUpdateCaseItem(index, 'qty', e.target.value)}
                    min="0"
                    step="0.0001"
                    readOnly={item.description === 'Box'}
                  />
                  {item.description === 'Box' && (
                    <small className="text-muted">Auto-calculated</small>
                  )}
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={item.weight || ''}
                    onChange={(e) => onUpdateCaseItem(index, 'weight', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={item.length || ''}
                    onChange={(e) => onUpdateCaseItem(index, 'length', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={item.width || ''}
                    onChange={(e) => onUpdateCaseItem(index, 'width', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={item.height || ''}
                    onChange={(e) => onUpdateCaseItem(index, 'height', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => onRemoveCaseItem(index)}
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
        onClick={onAddCaseItem}
      >
        Add Case Item
      </button>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(CaseTable);
