import React, { useContext, useState } from 'react';
import { SpecSheetContext } from '../context/SpecSheetContext';
import SignatureCanvas from 'react-signature-canvas';

const Signatures = () => {
  const { specSheetData, setSpecSheetData } = useContext(SpecSheetContext);
  const [sigCustomer, setSigCustomer] = useState(null);
  const [sigQualityManager, setSigQualityManager] = useState(null);
  const [sigProductionManager, setSigProductionManager] = useState(null);
  
  // Handle input changes
  const handleInputChange = (role, field, value) => {
    setSpecSheetData(prevData => ({
      ...prevData,
      signatures: {
        ...prevData.signatures,
        [role]: {
          ...(prevData.signatures?.[role] || {}),
          [field]: value
        }
      }
    }));
  };
  
  // Handle date changes
  const handleDateChange = (role, value) => {
    setSpecSheetData(prevData => ({
      ...prevData,
      signatures: {
        ...prevData.signatures,
        [role]: {
          ...(prevData.signatures?.[role] || {}),
          date: value
        }
      }
    }));
  };
  
  // Clear signature
  const clearSignature = (role) => {
    if (role === 'customer' && sigCustomer) {
      sigCustomer.clear();
      
      setSpecSheetData(prevData => ({
        ...prevData,
        signatures: {
          ...prevData.signatures,
          customer: {
            ...(prevData.signatures?.customer || {}),
            signature: null
          }
        }
      }));
    } else if (role === 'qualityManager' && sigQualityManager) {
      sigQualityManager.clear();
      
      setSpecSheetData(prevData => ({
        ...prevData,
        signatures: {
          ...prevData.signatures,
          qualityManager: {
            ...(prevData.signatures?.qualityManager || {}),
            signature: null
          }
        }
      }));
    } else if (role === 'productionManager' && sigProductionManager) {
      sigProductionManager.clear();
      
      setSpecSheetData(prevData => ({
        ...prevData,
        signatures: {
          ...prevData.signatures,
          productionManager: {
            ...(prevData.signatures?.productionManager || {}),
            signature: null
          }
        }
      }));
    }
  };
  
  // Save signature
  const saveSignature = (role) => {
    let signatureData = null;
    
    if (role === 'customer' && sigCustomer && !sigCustomer.isEmpty()) {
      signatureData = sigCustomer.toDataURL('image/png');
    } else if (role === 'qualityManager' && sigQualityManager && !sigQualityManager.isEmpty()) {
      signatureData = sigQualityManager.toDataURL('image/png');
    } else if (role === 'productionManager' && sigProductionManager && !sigProductionManager.isEmpty()) {
      signatureData = sigProductionManager.toDataURL('image/png');
    }
    
    if (signatureData) {
      setSpecSheetData(prevData => ({
        ...prevData,
        signatures: {
          ...prevData.signatures,
          [role]: {
            ...(prevData.signatures?.[role] || {}),
            signature: signatureData
          }
        }
      }));
    }
  };
  
  // Generate today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="card spec-sheet-section">
      <div className="card-header spec-sheet-section-header">
        <h2 className="spec-sheet-section-title">Signatures</h2>
      </div>
      
      <div className="card-body">
        <div className="form-section mb-4">
          <h3 className="mb-3">Customer Approval</h3>
          
          <div className="form-row d-flex">
            <div className="form-group mr-3" style={{ flex: 1 }}>
              <label htmlFor="customerName" className="form-label">Name</label>
              <input
                type="text"
                id="customerName"
                className="form-control"
                value={(specSheetData.signatures?.customer?.name) || ''}
                onChange={(e) => handleInputChange('customer', 'name', e.target.value)}
                placeholder="Enter customer name"
              />
            </div>
            
            <div className="form-group mr-3" style={{ flex: 1 }}>
              <label htmlFor="customerTitle" className="form-label">Title</label>
              <input
                type="text"
                id="customerTitle"
                className="form-control"
                value={(specSheetData.signatures?.customer?.title) || ''}
                onChange={(e) => handleInputChange('customer', 'title', e.target.value)}
                placeholder="Enter customer title"
              />
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="customerDate" className="form-label">Date</label>
              <input
                type="date"
                id="customerDate"
                className="form-control"
                value={(specSheetData.signatures?.customer?.date) || ''}
                onChange={(e) => handleDateChange('customer', e.target.value)}
                max={getTodayDate()}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Signature</label>
              <div className="signature-container">
                {specSheetData.signatures?.customer?.signature ? (
                  <div className="saved-signature">
                    <img 
                      src={specSheetData.signatures.customer.signature} 
                      alt="Customer Signature" 
                      className="signature-image"
                    />
                    <button
                      type="button"
                      className="btn btn-danger btn-sm mt-2"
                      onClick={() => clearSignature('customer')}
                    >
                      Clear Signature
                    </button>
                  </div>
                ) : (
                  <div className="signature-pad-container">
                    <div className="signature-pad">
                      <SignatureCanvas
                        ref={(ref) => setSigCustomer(ref)}
                        penColor="black"
                        canvasProps={{
                          className: 'signature-canvas',
                          width: 500,
                          height: 150
                        }}
                      />
                    </div>
                    <div className="signature-actions mt-2">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm mr-2"
                        onClick={() => clearSignature('customer')}
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => saveSignature('customer')}
                      >
                        Save Signature
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="form-section mb-4">
          <h3 className="mb-3">Quality Manager Approval</h3>
          
          <div className="form-row d-flex">
            <div className="form-group mr-3" style={{ flex: 1 }}>
              <label htmlFor="qualityManagerName" className="form-label">Name</label>
              <input
                type="text"
                id="qualityManagerName"
                className="form-control"
                value={(specSheetData.signatures?.qualityManager?.name) || ''}
                onChange={(e) => handleInputChange('qualityManager', 'name', e.target.value)}
                placeholder="Enter quality manager name"
              />
            </div>
            
            <div className="form-group mr-3" style={{ flex: 1 }}>
              <label htmlFor="qualityManagerTitle" className="form-label">Title</label>
              <input
                type="text"
                id="qualityManagerTitle"
                className="form-control"
                value={(specSheetData.signatures?.qualityManager?.title) || 'Quality Manager'}
                onChange={(e) => handleInputChange('qualityManager', 'title', e.target.value)}
                placeholder="Enter quality manager title"
              />
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="qualityManagerDate" className="form-label">Date</label>
              <input
                type="date"
                id="qualityManagerDate"
                className="form-control"
                value={(specSheetData.signatures?.qualityManager?.date) || ''}
                onChange={(e) => handleDateChange('qualityManager', e.target.value)}
                max={getTodayDate()}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Signature</label>
              <div className="signature-container">
                {specSheetData.signatures?.qualityManager?.signature ? (
                  <div className="saved-signature">
                    <img 
                      src={specSheetData.signatures.qualityManager.signature} 
                      alt="Quality Manager Signature" 
                      className="signature-image"
                    />
                    <button
                      type="button"
                      className="btn btn-danger btn-sm mt-2"
                      onClick={() => clearSignature('qualityManager')}
                    >
                      Clear Signature
                    </button>
                  </div>
                ) : (
                  <div className="signature-pad-container">
                    <div className="signature-pad">
                      <SignatureCanvas
                        ref={(ref) => setSigQualityManager(ref)}
                        penColor="black"
                        canvasProps={{
                          className: 'signature-canvas',
                          width: 500,
                          height: 150
                        }}
                      />
                    </div>
                    <div className="signature-actions mt-2">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm mr-2"
                        onClick={() => clearSignature('qualityManager')}
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => saveSignature('qualityManager')}
                      >
                        Save Signature
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3 className="mb-3">Production Manager Approval</h3>
          
          <div className="form-row d-flex">
            <div className="form-group mr-3" style={{ flex: 1 }}>
              <label htmlFor="productionManagerName" className="form-label">Name</label>
              <input
                type="text"
                id="productionManagerName"
                className="form-control"
                value={(specSheetData.signatures?.productionManager?.name) || ''}
                onChange={(e) => handleInputChange('productionManager', 'name', e.target.value)}
                placeholder="Enter production manager name"
              />
            </div>
            
            <div className="form-group mr-3" style={{ flex: 1 }}>
              <label htmlFor="productionManagerTitle" className="form-label">Title</label>
              <input
                type="text"
                id="productionManagerTitle"
                className="form-control"
                value={(specSheetData.signatures?.productionManager?.title) || 'Production Manager'}
                onChange={(e) => handleInputChange('productionManager', 'title', e.target.value)}
                placeholder="Enter production manager title"
              />
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="productionManagerDate" className="form-label">Date</label>
              <input
                type="date"
                id="productionManagerDate"
                className="form-control"
                value={(specSheetData.signatures?.productionManager?.date) || ''}
                onChange={(e) => handleDateChange('productionManager', e.target.value)}
                max={getTodayDate()}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Signature</label>
              <div className="signature-container">
                {specSheetData.signatures?.productionManager?.signature ? (
                  <div className="saved-signature">
                    <img 
                      src={specSheetData.signatures.productionManager.signature} 
                      alt="Production Manager Signature" 
                      className="signature-image"
                    />
                    <button
                      type="button"
                      className="btn btn-danger btn-sm mt-2"
                      onClick={() => clearSignature('productionManager')}
                    >
                      Clear Signature
                    </button>
                  </div>
                ) : (
                  <div className="signature-pad-container">
                    <div className="signature-pad">
                      <SignatureCanvas
                        ref={(ref) => setSigProductionManager(ref)}
                        penColor="black"
                        canvasProps={{
                          className: 'signature-canvas',
                          width: 500,
                          height: 150
                        }}
                      />
                    </div>
                    <div className="signature-actions mt-2">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm mr-2"
                        onClick={() => clearSignature('productionManager')}
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => saveSignature('productionManager')}
                      >
                        Save Signature
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx="true">{`
        .signature-pad {
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #fff;
        }
        
        .signature-canvas {
          width: 100%;
          height: 150px;
        }
        
        .signature-image {
          max-width: 500px;
          max-height: 150px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #fff;
        }
      `}</style>
    </div>
  );
};

export default Signatures;
