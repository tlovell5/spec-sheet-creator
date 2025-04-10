import React, { useContext, useEffect } from 'react';
import { SpecSheetContext } from '../context/SpecSheetContext';

const ActivityLog = () => {
  const { specSheetData, setSpecSheetData } = useContext(SpecSheetContext);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Add a log entry when signatures are added
  useEffect(() => {
    // Check if signatures have been added or updated
    const customerSig = specSheetData.signatures?.customer?.signature;
    const qualityManagerSig = specSheetData.signatures?.qualityManager?.signature;
    const productionManagerSig = specSheetData.signatures?.productionManager?.signature;
    
    const logs = [...(specSheetData.activityLog?.logs || [])];
    
    // Check for customer signature
    if (customerSig && !logs.some(log => log.action === 'Customer Signature Added')) {
      const customerName = specSheetData.signatures?.customer?.name || 'Customer';
      
      logs.push({
        timestamp: new Date().toISOString(),
        user: customerName,
        action: 'Customer Signature Added',
        details: `${customerName} approved the spec sheet`
      });
    }
    
    // Check for quality manager signature
    if (qualityManagerSig && !logs.some(log => log.action === 'Quality Manager Signature Added')) {
      const qualityManagerName = specSheetData.signatures?.qualityManager?.name || 'Quality Manager';
      
      logs.push({
        timestamp: new Date().toISOString(),
        user: qualityManagerName,
        action: 'Quality Manager Signature Added',
        details: `${qualityManagerName} approved the spec sheet`
      });
    }
    
    // Check for production manager signature
    if (productionManagerSig && !logs.some(log => log.action === 'Production Manager Signature Added')) {
      const productionManagerName = specSheetData.signatures?.productionManager?.name || 'Production Manager';
      
      logs.push({
        timestamp: new Date().toISOString(),
        user: productionManagerName,
        action: 'Production Manager Signature Added',
        details: `${productionManagerName} approved the spec sheet`
      });
    }
    
    // Update activity log if new entries were added
    if (logs.length !== (specSheetData.activityLog?.logs || []).length) {
      setSpecSheetData(prevData => ({
        ...prevData,
        activityLog: {
          ...prevData.activityLog,
          logs
        }
      }));
    }
  }, [
    specSheetData.signatures?.customer?.signature,
    specSheetData.signatures?.qualityManager?.signature,
    specSheetData.signatures?.productionManager?.signature,
    specSheetData.activityLog?.logs,
    setSpecSheetData
  ]);
  
  // Add a manual log entry
  const handleAddLogEntry = () => {
    const logs = [...(specSheetData.activityLog?.logs || [])];
    
    logs.push({
      timestamp: new Date().toISOString(),
      user: specSheetData.activityLog?.currentUser || 'User',
      action: specSheetData.activityLog?.currentAction || 'Updated Spec Sheet',
      details: specSheetData.activityLog?.currentDetails || ''
    });
    
    setSpecSheetData(prevData => ({
      ...prevData,
      activityLog: {
        ...prevData.activityLog,
        logs,
        currentAction: '',
        currentDetails: ''
      }
    }));
  };
  
  // Handle input changes
  const handleInputChange = (field, value) => {
    setSpecSheetData(prevData => ({
      ...prevData,
      activityLog: {
        ...prevData.activityLog,
        [field]: value
      }
    }));
  };

  return (
    <div className="card spec-sheet-section">
      <div className="card-header spec-sheet-section-header">
        <h2 className="spec-sheet-section-title">Activity Log</h2>
      </div>
      
      <div className="card-body">
        <div className="form-section mb-4">
          <h3 className="mb-3">Add Log Entry</h3>
          
          <div className="form-row d-flex">
            <div className="form-group mr-3" style={{ flex: 1 }}>
              <label htmlFor="currentUser" className="form-label">User</label>
              <input
                type="text"
                id="currentUser"
                className="form-control"
                value={specSheetData.activityLog?.currentUser || ''}
                onChange={(e) => handleInputChange('currentUser', e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            
            <div className="form-group" style={{ flex: 2 }}>
              <label htmlFor="currentAction" className="form-label">Action</label>
              <select
                id="currentAction"
                className="form-control"
                value={specSheetData.activityLog?.currentAction || ''}
                onChange={(e) => handleInputChange('currentAction', e.target.value)}
              >
                <option value="">Select an action</option>
                <option value="Updated Spec Sheet">Updated Spec Sheet</option>
                <option value="Reviewed Spec Sheet">Reviewed Spec Sheet</option>
                <option value="Requested Changes">Requested Changes</option>
                <option value="Approved Changes">Approved Changes</option>
                <option value="Rejected Changes">Rejected Changes</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="currentDetails" className="form-label">Details</label>
              <textarea
                id="currentDetails"
                className="form-control"
                value={specSheetData.activityLog?.currentDetails || ''}
                onChange={(e) => handleInputChange('currentDetails', e.target.value)}
                placeholder="Enter details about this action"
                rows="3"
              ></textarea>
            </div>
          </div>
          
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAddLogEntry}
            disabled={!specSheetData.activityLog?.currentUser || !specSheetData.activityLog?.currentAction}
          >
            Add Log Entry
          </button>
        </div>
        
        <div className="form-section">
          <h3 className="mb-3">Log History</h3>
          
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {(specSheetData.activityLog?.logs || []).map((log, index) => (
                  <tr key={index}>
                    <td>{formatDate(log.timestamp)}</td>
                    <td>{log.user}</td>
                    <td>{log.action}</td>
                    <td>{log.details}</td>
                  </tr>
                ))}
                {(specSheetData.activityLog?.logs || []).length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center">
                      <em>No activity logged yet</em>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
