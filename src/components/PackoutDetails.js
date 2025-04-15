import React, { useContext, useEffect, useState } from 'react';
import { SpecSheetContext } from '../context/SpecSheetContext';
import { calculateTotalCaseWeight, calculatePalletWeight } from '../utils/weightUtils';

const PackoutDetails = () => {
  const { specSheetData, setSpecSheetData } = useContext(SpecSheetContext);
  const [totalCaseWeight, setTotalCaseWeight] = useState(0);
  const [totalPalletWeight, setTotalPalletWeight] = useState(0);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setSpecSheetData(prevData => ({
      ...prevData,
      packoutDetails: {
        ...prevData.packoutDetails,
        [name]: value
      }
    }));
  };
  
  // Calculate total case weight when relevant data changes
  useEffect(() => {
    if (
      specSheetData.productIdentification?.netWeight &&
      specSheetData.productIdentification?.unitsPerCase
    ) {
      // Get unit net weight in grams
      const unitNetWeight = parseFloat(specSheetData.productIdentification.netWeight) || 0;
      const unitWeightUnit = specSheetData.productIdentification.weightUnit || 'g';
      const unitsPerCase = parseInt(specSheetData.productIdentification.unitsPerCase) || 0;
      
      // Calculate case weight (sum of all case items)
      const caseWeight = (specSheetData.billOfMaterials?.caseItems || []).reduce((sum, item) => {
        return sum + (parseFloat(item.weight) || 0);
      }, 0);
      
      // Calculate total case weight
      const totalWeight = calculateTotalCaseWeight(unitNetWeight, unitsPerCase, caseWeight);
      setTotalCaseWeight(totalWeight);
      
      // Update context with calculated weight
      setSpecSheetData(prevData => ({
        ...prevData,
        packoutDetails: {
          ...prevData.packoutDetails,
          totalCaseWeightLbs: totalWeight.toFixed(2)
        }
      }));
    }
  }, [
    specSheetData.productIdentification?.netWeight,
    specSheetData.productIdentification?.weightUnit,
    specSheetData.productIdentification?.unitsPerCase,
    specSheetData.billOfMaterials?.caseItems,
    setSpecSheetData
  ]);
  
  // Calculate total pallet weight when case weight or cases per pallet changes
  useEffect(() => {
    if (
      specSheetData.packoutDetails?.totalCaseWeightLbs &&
      specSheetData.productIdentification?.casesPerPallet
    ) {
      const caseWeightLbs = parseFloat(specSheetData.packoutDetails.totalCaseWeightLbs) || 0;
      const casesPerPallet = parseInt(specSheetData.productIdentification.casesPerPallet) || 0;
      
      // Calculate pallet weight
      const palletWeight = calculatePalletWeight(caseWeightLbs, casesPerPallet);
      setTotalPalletWeight(palletWeight);
      
      // Update context with calculated weight
      setSpecSheetData(prevData => ({
        ...prevData,
        packoutDetails: {
          ...prevData.packoutDetails,
          totalPalletWeightLbs: palletWeight.toFixed(2)
        }
      }));
    }
  }, [
    specSheetData.packoutDetails?.totalCaseWeightLbs,
    specSheetData.productIdentification?.casesPerPallet,
    setSpecSheetData
  ]);

  return (
    <div className="card spec-sheet-section">
      <div className="card-header spec-sheet-section-header">
        <h2 className="spec-sheet-section-title">
          <i className="fas fa-box"></i>
          Packout Details
        </h2>
      </div>
      
      <div className="card-body p-2">
        <div className="packout-details-container">
          {/* Materials Section */}
          <div className="packout-section mb-2">
            <div className="section-header d-flex justify-content-between align-items-center py-1 px-2 bg-light rounded">
              <h3 className="section-title mb-0 small text-uppercase">
                <i className="fas fa-boxes mr-1"></i>
                Materials
              </h3>
            </div>
            
            <div className="section-content p-2">
              <div className="table-responsive mb-2">
                <table className="table table-sm table-bordered mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="small font-weight-bold">Type</th>
                      <th className="small font-weight-bold">SKU</th>
                      <th className="small font-weight-bold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(specSheetData.billOfMaterials?.caseItems || []).length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center small">
                          <em>No case items added yet</em>
                        </td>
                      </tr>
                    ) : (
                      (specSheetData.billOfMaterials?.caseItems || []).map((item, index) => (
                        <tr key={index}>
                          <td className="small">{item.description || 'N/A'}</td>
                          <td className="small">{item.sku || 'N/A'}</td>
                          <td className="small">{item.description || 'N/A'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="units-per-case">
                <div className="row g-1">
                  <div className="col-md-12">
                    <div className="form-group mb-0">
                      <label className="form-label small font-weight-bold">Units per Case (ea)</label>
                      <p className="form-control-static small mb-0">
                        {specSheetData.productIdentification?.unitsPerCase || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Case Configuration Section */}
          <div className="packout-section mb-2">
            <div className="section-header d-flex justify-content-between align-items-center py-1 px-2 bg-light rounded">
              <h3 className="section-title mb-0 small text-uppercase">
                <i className="fas fa-cube mr-1"></i>
                Case Configuration
              </h3>
            </div>
            
            <div className="section-content p-2">
              <div className="row g-1 mb-2">
                <div className="col-md-4">
                  <div className="form-group mb-0">
                    <label htmlFor="caseLength" className="form-label small font-weight-bold">Case Length (in)</label>
                    <input
                      type="number"
                      id="caseLength"
                      name="caseLength"
                      className="form-control form-control-sm"
                      value={specSheetData.packoutDetails?.caseLength || ''}
                      onChange={handleInputChange}
                      placeholder="Enter case length"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="form-group mb-0">
                    <label htmlFor="caseWidth" className="form-label small font-weight-bold">Case Width (in)</label>
                    <input
                      type="number"
                      id="caseWidth"
                      name="caseWidth"
                      className="form-control form-control-sm"
                      value={specSheetData.packoutDetails?.caseWidth || ''}
                      onChange={handleInputChange}
                      placeholder="Enter case width"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="form-group mb-0">
                    <label htmlFor="caseHeight" className="form-label small font-weight-bold">Case Height (in)</label>
                    <input
                      type="number"
                      id="caseHeight"
                      name="caseHeight"
                      className="form-control form-control-sm"
                      value={specSheetData.packoutDetails?.caseHeight || ''}
                      onChange={handleInputChange}
                      placeholder="Enter case height"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-group mb-2">
                <label htmlFor="caseConfiguration" className="form-label small font-weight-bold">Case Configuration</label>
                <textarea
                  id="caseConfiguration"
                  name="caseConfiguration"
                  className="form-control form-control-sm"
                  value={specSheetData.packoutDetails?.caseConfiguration || ''}
                  onChange={handleInputChange}
                  placeholder="Enter case configuration details"
                  rows="2"
                ></textarea>
              </div>
              
              <div className="row g-1 mb-2">
                <div className="col-md-6">
                  <div className="form-group mb-0">
                    <label htmlFor="caseLabelSize" className="form-label small font-weight-bold">Case Label Size</label>
                    <select
                      id="caseLabelSize"
                      name="caseLabelSize"
                      className="form-control form-control-sm"
                      value={specSheetData.packoutDetails?.caseLabelSize || '4x6'}
                      onChange={handleInputChange}
                    >
                      <option value="2x2">2x2</option>
                      <option value="4x6">4x6</option>
                    </select>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-group mb-0">
                    <label htmlFor="caseUpc" className="form-label small font-weight-bold">Case UPC</label>
                    <p className="form-control-static small mb-0">
                      {specSheetData.productIdentification?.caseUpc || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="form-group mb-2">
                <label htmlFor="caseLabelPlacement" className="form-label small font-weight-bold">Case Label Placement</label>
                <textarea
                  id="caseLabelPlacement"
                  name="caseLabelPlacement"
                  className="form-control form-control-sm"
                  value={specSheetData.packoutDetails?.caseLabelPlacement || ''}
                  onChange={handleInputChange}
                  placeholder="Enter case label placement details"
                  rows="2"
                ></textarea>
              </div>
              
              <div className="form-group mb-0">
                <label htmlFor="totalCaseWeightLbs" className="form-label small font-weight-bold">Total Case Weight (lbs)</label>
                <div className="input-group input-group-sm">
                  <input
                    type="text"
                    id="totalCaseWeightLbs"
                    name="totalCaseWeightLbs"
                    className="form-control form-control-sm bg-light"
                    value={specSheetData.packoutDetails?.totalCaseWeightLbs || ''}
                    readOnly
                    placeholder="Calculated automatically"
                  />
                  <div className="input-group-append">
                    <span className="input-group-text">
                      <i className="fas fa-calculator"></i>
                    </span>
                  </div>
                </div>
                <small className="text-muted x-small">
                  Auto-calculated: (Units per case × Unit Net Weight) + Case Weight
                </small>
              </div>
            </div>
          </div>
          
          {/* Pallet Information Section */}
          <div className="packout-section mb-2">
            <div className="section-header d-flex justify-content-between align-items-center py-1 px-2 bg-light rounded">
              <h3 className="section-title mb-0 small text-uppercase">
                <i className="fas fa-pallet mr-1"></i>
                Pallet Information
              </h3>
            </div>
            
            <div className="section-content p-2">
              <div className="row g-1 mb-2">
                <div className="col-md-6">
                  <div className="form-group mb-0">
                    <label htmlFor="caseTi" className="form-label small font-weight-bold">Ti (cases per layer)</label>
                    <input
                      type="number"
                      id="caseTi"
                      name="caseTi"
                      className="form-control form-control-sm"
                      value={specSheetData.packoutDetails?.caseTi || ''}
                      onChange={handleInputChange}
                      placeholder="Enter Ti"
                      min="0"
                      step="1"
                    />
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-group mb-0">
                    <label htmlFor="caseHi" className="form-label small font-weight-bold">Hi (layers per pallet)</label>
                    <input
                      type="number"
                      id="caseHi"
                      name="caseHi"
                      className="form-control form-control-sm"
                      value={specSheetData.packoutDetails?.caseHi || ''}
                      onChange={handleInputChange}
                      placeholder="Enter Hi"
                      min="0"
                      step="1"
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-group mb-2">
                <label htmlFor="palletConfiguration" className="form-label small font-weight-bold">Pallet Configuration</label>
                <textarea
                  id="palletConfiguration"
                  name="palletConfiguration"
                  className="form-control form-control-sm"
                  value={specSheetData.packoutDetails?.palletConfiguration || ''}
                  onChange={handleInputChange}
                  placeholder="Enter pallet configuration details"
                  rows="2"
                ></textarea>
              </div>
              
              <div className="form-group mb-0">
                <label htmlFor="totalPalletWeightLbs" className="form-label small font-weight-bold">Total Pallet Weight (lbs)</label>
                <div className="input-group input-group-sm">
                  <input
                    type="text"
                    id="totalPalletWeightLbs"
                    name="totalPalletWeightLbs"
                    className="form-control form-control-sm bg-light"
                    value={specSheetData.packoutDetails?.totalPalletWeightLbs || ''}
                    readOnly
                    placeholder="Calculated automatically"
                  />
                  <div className="input-group-append">
                    <span className="input-group-text">
                      <i className="fas fa-calculator"></i>
                    </span>
                  </div>
                </div>
                <small className="text-muted x-small">
                  Auto-calculated: Total Case Weight × Cases per Pallet
                </small>
              </div>
            </div>
          </div>
          
          {/* Pallet Configuration Images Section */}
          <div className="packout-section mb-2">
            <div className="section-header d-flex justify-content-between align-items-center py-1 px-2 bg-light rounded">
              <h3 className="section-title mb-0 small text-uppercase">
                <i className="fas fa-images mr-1"></i>
                Pallet Configuration Images
              </h3>
            </div>
            
            <div className="section-content p-2">
              <div className="row g-1">
                <div className="col-md-4">
                  <div className="form-group mb-2 mb-md-0">
                    <label className="form-label small font-weight-bold">Single Layer Configuration</label>
                    <div className="file-upload-container border rounded p-2 text-center">
                      {specSheetData.packoutDetails?.singleLayerImage ? (
                        <div className="file-preview">
                          <img 
                            src={specSheetData.packoutDetails.singleLayerImage} 
                            alt="Single Layer Configuration" 
                            className="img-fluid img-thumbnail mb-1"
                            style={{ maxHeight: '100px' }}
                          />
                          <button
                            type="button"
                            className="btn btn-danger btn-sm btn-xs"
                            onClick={() => {
                              setSpecSheetData(prevData => ({
                                ...prevData,
                                packoutDetails: {
                                  ...prevData.packoutDetails,
                                  singleLayerImage: null
                                }
                              }));
                            }}
                          >
                            <i className="fas fa-trash-alt mr-1"></i>
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="file-upload">
                          <label htmlFor="singleLayerImage" className="btn btn-secondary btn-sm mb-0">
                            <i className="fas fa-upload mr-1"></i>
                            Upload Image
                          </label>
                          <input
                            type="file"
                            id="singleLayerImage"
                            accept="image/*"
                            onChange={(e) => {
                              // Handle file upload
                              const file = e.target.files[0];
                              if (file) {
                                // Mock upload for now
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  setSpecSheetData(prevData => ({
                                    ...prevData,
                                    packoutDetails: {
                                      ...prevData.packoutDetails,
                                      singleLayerImage: event.target.result
                                    }
                                  }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            style={{ display: 'none' }}
                          />
                          <p className="text-muted small mt-1 mb-0">
                            Upload layer image
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="form-group mb-2 mb-md-0">
                    <label className="form-label small font-weight-bold">Two Layers Configuration</label>
                    <div className="file-upload-container border rounded p-2 text-center">
                      {specSheetData.packoutDetails?.twoLayersImage ? (
                        <div className="file-preview">
                          <img 
                            src={specSheetData.packoutDetails.twoLayersImage} 
                            alt="Two Layers Configuration" 
                            className="img-fluid img-thumbnail mb-1"
                            style={{ maxHeight: '100px' }}
                          />
                          <button
                            type="button"
                            className="btn btn-danger btn-sm btn-xs"
                            onClick={() => {
                              setSpecSheetData(prevData => ({
                                ...prevData,
                                packoutDetails: {
                                  ...prevData.packoutDetails,
                                  twoLayersImage: null
                                }
                              }));
                            }}
                          >
                            <i className="fas fa-trash-alt mr-1"></i>
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="file-upload">
                          <label htmlFor="twoLayersImage" className="btn btn-secondary btn-sm mb-0">
                            <i className="fas fa-upload mr-1"></i>
                            Upload Image
                          </label>
                          <input
                            type="file"
                            id="twoLayersImage"
                            accept="image/*"
                            onChange={(e) => {
                              // Handle file upload
                              const file = e.target.files[0];
                              if (file) {
                                // Mock upload for now
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  setSpecSheetData(prevData => ({
                                    ...prevData,
                                    packoutDetails: {
                                      ...prevData.packoutDetails,
                                      twoLayersImage: event.target.result
                                    }
                                  }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            style={{ display: 'none' }}
                          />
                          <p className="text-muted small mt-1 mb-0">
                            Upload two layers image
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="form-group mb-0">
                    <label className="form-label small font-weight-bold">Full Pallet Configuration</label>
                    <div className="file-upload-container border rounded p-2 text-center">
                      {specSheetData.packoutDetails?.fullPalletImage ? (
                        <div className="file-preview">
                          <img 
                            src={specSheetData.packoutDetails.fullPalletImage} 
                            alt="Full Pallet Configuration" 
                            className="img-fluid img-thumbnail mb-1"
                            style={{ maxHeight: '100px' }}
                          />
                          <button
                            type="button"
                            className="btn btn-danger btn-sm btn-xs"
                            onClick={() => {
                              setSpecSheetData(prevData => ({
                                ...prevData,
                                packoutDetails: {
                                  ...prevData.packoutDetails,
                                  fullPalletImage: null
                                }
                              }));
                            }}
                          >
                            <i className="fas fa-trash-alt mr-1"></i>
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="file-upload">
                          <label htmlFor="fullPalletImage" className="btn btn-secondary btn-sm mb-0">
                            <i className="fas fa-upload mr-1"></i>
                            Upload Image
                          </label>
                          <input
                            type="file"
                            id="fullPalletImage"
                            accept="image/*"
                            onChange={(e) => {
                              // Handle file upload
                              const file = e.target.files[0];
                              if (file) {
                                // Mock upload for now
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  setSpecSheetData(prevData => ({
                                    ...prevData,
                                    packoutDetails: {
                                      ...prevData.packoutDetails,
                                      fullPalletImage: event.target.result
                                    }
                                  }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            style={{ display: 'none' }}
                          />
                          <p className="text-muted small mt-1 mb-0">
                            Upload full pallet image
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Shipping Information Section */}
          <div className="packout-section">
            <div className="section-header d-flex justify-content-between align-items-center py-1 px-2 bg-light rounded">
              <h3 className="section-title mb-0 small text-uppercase">
                <i className="fas fa-shipping-fast mr-1"></i>
                Shipping Information
              </h3>
            </div>
            
            <div className="section-content p-2">
              <div className="form-group mb-2">
                <label htmlFor="shippingNotes" className="form-label small font-weight-bold">Shipping Notes</label>
                <textarea
                  id="shippingNotes"
                  name="shippingNotes"
                  className="form-control form-control-sm"
                  value={specSheetData.packoutDetails?.shippingNotes || ''}
                  onChange={handleInputChange}
                  placeholder="Enter any special shipping or handling instructions"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="row g-1">
                <div className="col-md-6">
                  <div className="form-group mb-0">
                    <label htmlFor="storageConditions" className="form-label small font-weight-bold">Storage Conditions</label>
                    <select
                      id="storageConditions"
                      name="storageConditions"
                      className="form-control form-control-sm"
                      value={specSheetData.packoutDetails?.storageConditions || ''}
                      onChange={handleInputChange}
                    >
                      <option value="">Select storage condition</option>
                      <option value="Ambient">Ambient</option>
                      <option value="Refrigerated">Refrigerated</option>
                      <option value="Frozen">Frozen</option>
                      <option value="Cool Dry Place">Cool Dry Place</option>
                    </select>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-group mb-0">
                    <label htmlFor="temperatureRange" className="form-label small font-weight-bold">Temperature Range</label>
                    <input
                      type="text"
                      id="temperatureRange"
                      name="temperatureRange"
                      className="form-control form-control-sm"
                      value={specSheetData.packoutDetails?.temperatureRange || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., 35-40°F"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx="true">{`
        .packout-section {
          border: 1px solid #eee;
          border-radius: 0.25rem;
          overflow: hidden;
          margin-bottom: 0.75rem;
        }
        
        .packout-section:last-child {
          margin-bottom: 0;
        }
        
        .section-header {
          background-color: #f8f9fa;
          border-bottom: 1px solid #eee;
        }
        
        .section-title {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--primary-color);
        }
        
        .section-content {
          background-color: #fff;
        }
        
        .form-control-static {
          padding: 0.375rem 0;
          margin-bottom: 0;
          line-height: 1.5;
        }
        
        .g-1 {
          margin-right: -0.25rem;
          margin-left: -0.25rem;
        }
        
        .g-1 > .col,
        .g-1 > [class*="col-"] {
          padding-right: 0.25rem;
          padding-left: 0.25rem;
        }
        
        .x-small {
          font-size: 0.75rem;
        }
        
        .btn-xs {
          padding: 0.1rem 0.25rem;
          font-size: 0.75rem;
          line-height: 1.5;
          border-radius: 0.2rem;
        }
        
        .file-upload-container {
          min-height: 120px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .file-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
        }
        
        .table-sm td, 
        .table-sm th {
          padding: 0.25rem 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default PackoutDetails;
