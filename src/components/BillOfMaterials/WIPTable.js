import React, { memo } from 'react';
import { convertWeight } from '../../utils/weightUtils';

const WIPTable = ({ productIdentification }) => {
  // Get the WIP weight in pounds directly from packaging claim weight
  const getWipWeightLbs = () => {
    if (!productIdentification || !productIdentification.netWeight) {
      return 0;
    }
    
    const netWeight = parseFloat(productIdentification.netWeight) || 0;
    const unit = productIdentification.weightUnit || 'g';
    
    // Convert to pounds
    return convertWeight(netWeight, unit, 'lbs');
  };

  const wipWeightLbs = getWipWeightLbs();

  return (
    <div className="wip-table-container mb-4">
      <h3 className="mb-3">WIP Information</h3>
      <table className="table" style={{ maxWidth: '600px' }}>
        <thead>
          <tr>
            <th>WIP ID</th>
            <th>Description</th>
            <th>Weight (lbs)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{productIdentification?.wipId || 'N/A'}</td>
            <td>{productIdentification?.productName || 'N/A'}</td>
            <td>{wipWeightLbs.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(WIPTable);
