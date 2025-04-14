import React, { useState, useContext, useEffect } from 'react';
import { SpecSheetContext } from '../context/SpecSheetContext';
import { STORAGE_BUCKETS } from '../supabaseClient';
import { SectionContainer, FormInput, FormSelect, FileUpload } from './common';

const ProductIdentification = () => {
  const { specSheetData, setSpecSheetData } = useContext(SpecSheetContext);
  const [uploadError, setUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setSpecSheetData(prevData => ({
      ...prevData,
      productIdentification: {
        ...prevData.productIdentification,
        [name]: value
      }
    }));
  };
  
  // Calculate units per pallet when units per case or cases per pallet changes
  useEffect(() => {
    const unitsPerCase = parseInt(specSheetData.productIdentification.unitsPerCase) || 0;
    const casesPerPallet = parseInt(specSheetData.productIdentification.casesPerPallet) || 0;
    
    if (unitsPerCase && casesPerPallet) {
      const unitsPerPallet = unitsPerCase * casesPerPallet;
      
      setSpecSheetData(prevData => ({
        ...prevData,
        productIdentification: {
          ...prevData.productIdentification,
          unitsPerPallet: unitsPerPallet.toString()
        }
      }));
    }
  }, [
    specSheetData.productIdentification.unitsPerCase,
    specSheetData.productIdentification.casesPerPallet,
    setSpecSheetData
  ]);
  
  // Handle product image URL update
  const handleImageChange = (url) => {
    setSpecSheetData(prevData => ({
      ...prevData,
      productIdentification: {
        ...prevData.productIdentification,
        productImage: url
      }
    }));
  };
  
  // Handle product image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload file to storage bucket
      // Replace with your actual upload logic
      // ...
      
      setUploading(false);
    }
  };
  
  // Weight unit options
  const weightUnitOptions = [
    { value: 'g', label: 'Grams (g)' },
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'oz', label: 'Ounces (oz)' },
    { value: 'lbs', label: 'Pounds (lbs)' }
  ];
  
  return (
    <div className="card spec-sheet-section">
      <div className="card-header spec-sheet-section-header">
        <h2 className="spec-sheet-section-title">
          <i className="fas fa-tag"></i>
          Product Identification
        </h2>
      </div>
      
      <div className="card-body p-2">
        <div className="product-identification-container">
          {/* Basic Info Section */}
          <div className="product-section mb-2">
            <div className="section-header d-flex justify-content-between align-items-center py-1 px-2 bg-light rounded">
              <h3 className="section-title mb-0 small text-uppercase">
                <i className="fas fa-info-circle mr-1"></i>
                Basic Information
              </h3>
            </div>
            
            <div className="section-content p-2">
              <div className="form-group mb-2">
                <label htmlFor="productName" className="form-label small font-weight-bold">Product Name</label>
                <input
                  type="text"
                  id="productName"
                  name="productName"
                  className="form-control form-control-sm"
                  value={specSheetData.productIdentification.productName || ''}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                />
              </div>
              
              <div className="row g-1 mb-2">
                <div className="col-md-4">
                  <div className="form-group mb-0">
                    <label htmlFor="skuId" className="form-label small font-weight-bold">SKU ID</label>
                    <input
                      type="text"
                      id="skuId"
                      name="skuId"
                      className="form-control form-control-sm"
                      value={specSheetData.productIdentification.skuId || ''}
                      onChange={handleInputChange}
                      placeholder="Enter SKU ID"
                    />
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="form-group mb-0">
                    <label htmlFor="bomId" className="form-label small font-weight-bold">BOM ID</label>
                    <input
                      type="text"
                      id="bomId"
                      name="bomId"
                      className="form-control form-control-sm"
                      value={specSheetData.productIdentification.bomId || ''}
                      onChange={handleInputChange}
                      placeholder="Enter BOM ID"
                    />
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="form-group mb-0">
                    <label htmlFor="productId" className="form-label small font-weight-bold">WIP ID</label>
                    <input
                      type="text"
                      id="productId"
                      name="productId"
                      className="form-control form-control-sm"
                      value={specSheetData.productIdentification.productId || ''}
                      onChange={handleInputChange}
                      placeholder="Enter WIP ID"
                    />
                  </div>
                </div>
              </div>
              
              <div className="row g-1">
                <div className="col-md-6">
                  <div className="form-group mb-0">
                    <label htmlFor="specRevision" className="form-label small font-weight-bold">Spec Revision</label>
                    <input
                      type="text"
                      id="specRevision"
                      name="specRevision"
                      className="form-control form-control-sm"
                      value={specSheetData.productIdentification.specRevision || ''}
                      onChange={handleInputChange}
                      placeholder="Enter Spec Revision"
                    />
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-group mb-0">
                    <label htmlFor="intendedUse" className="form-label small font-weight-bold">Intended Use</label>
                    <select
                      id="intendedUse"
                      name="intendedUse"
                      className="form-control form-control-sm"
                      value={specSheetData.productIdentification.intendedUse || 'Retail'}
                      onChange={handleInputChange}
                    >
                      <option value="Retail">Retail</option>
                      <option value="Ingredient">Ingredient</option>
                      <option value="Inclusion">Inclusion</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Weight & Quantity Section */}
          <div className="product-section mb-2">
            <div className="section-header py-1 px-2 bg-light rounded">
              <h3 className="section-title mb-0 small text-uppercase">
                <i className="fas fa-weight mr-1"></i>
                Weight & Quantity
              </h3>
            </div>
            
            <div className="section-content p-2">
              <div className="row g-1 mb-2">
                <div className="col-md-8">
                  <div className="form-group mb-0">
                    <label htmlFor="netWeight" className="form-label small font-weight-bold">Unit Claim Weight</label>
                    <input
                      type="number"
                      id="netWeight"
                      name="netWeight"
                      className="form-control form-control-sm"
                      value={specSheetData.productIdentification.netWeight || ''}
                      onChange={handleInputChange}
                      placeholder="Enter weight"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="form-group mb-0">
                    <label htmlFor="weightUnit" className="form-label small font-weight-bold">Unit</label>
                    <select
                      id="weightUnit"
                      name="weightUnit"
                      className="form-control form-control-sm"
                      value={specSheetData.productIdentification.weightUnit || 'g'}
                      onChange={handleInputChange}
                    >
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="oz">oz</option>
                      <option value="lbs">lbs</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="row g-1">
                <div className="col-md-4">
                  <div className="form-group mb-0">
                    <label htmlFor="unitsPerCase" className="form-label small font-weight-bold">Units per Case (ea)</label>
                    <input
                      type="number"
                      id="unitsPerCase"
                      name="unitsPerCase"
                      className="form-control form-control-sm"
                      value={specSheetData.productIdentification.unitsPerCase || ''}
                      onChange={handleInputChange}
                      placeholder="Enter units per case"
                      min="0"
                      step="1"
                    />
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="form-group mb-0">
                    <label htmlFor="casesPerPallet" className="form-label small font-weight-bold">Cases per Pallet (ea)</label>
                    <input
                      type="number"
                      id="casesPerPallet"
                      name="casesPerPallet"
                      className="form-control form-control-sm"
                      value={specSheetData.productIdentification.casesPerPallet || ''}
                      onChange={handleInputChange}
                      placeholder="Enter cases per pallet"
                      min="0"
                      step="1"
                    />
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="form-group mb-0">
                    <label htmlFor="unitsPerPallet" className="form-label small font-weight-bold">Units per Pallet (ea)</label>
                    <div className="input-group input-group-sm">
                      <input
                        type="number"
                        id="unitsPerPallet"
                        name="unitsPerPallet"
                        className="form-control form-control-sm bg-light"
                        value={specSheetData.productIdentification.unitsPerPallet || ''}
                        readOnly
                        placeholder="Auto-calculated"
                      />
                      <div className="input-group-append">
                        <span className="input-group-text">
                          <i className="fas fa-calculator"></i>
                        </span>
                      </div>
                    </div>
                    <small className="text-muted x-small">Auto-calculated: Units/Case × Cases/Pallet</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Identification Codes Section */}
          <div className="product-section mb-2">
            <div className="section-header py-1 px-2 bg-light rounded">
              <h3 className="section-title mb-0 small text-uppercase">
                <i className="fas fa-barcode mr-1"></i>
                Identification Codes
              </h3>
            </div>
            
            <div className="section-content p-2">
              <div className="row g-1 mb-2">
                <div className="col-md-4">
                  <div className="form-group mb-0">
                    <label htmlFor="unitUpc" className="form-label small font-weight-bold">Unit UPC</label>
                    <input
                      type="text"
                      id="unitUpc"
                      name="unitUpc"
                      className="form-control form-control-sm"
                      value={specSheetData.productIdentification.unitUpc || ''}
                      onChange={handleInputChange}
                      placeholder="Enter unit UPC"
                    />
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="form-group mb-0">
                    <label htmlFor="caseUpc" className="form-label small font-weight-bold">Case UPC</label>
                    <input
                      type="text"
                      id="caseUpc"
                      name="caseUpc"
                      className="form-control form-control-sm"
                      value={specSheetData.productIdentification.caseUpc || ''}
                      onChange={handleInputChange}
                      placeholder="Enter case UPC"
                    />
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="form-group mb-0">
                    <label htmlFor="palletUpc" className="form-label small font-weight-bold">Pallet UPC</label>
                    <input
                      type="text"
                      id="palletUpc"
                      name="palletUpc"
                      className="form-control form-control-sm"
                      value={specSheetData.productIdentification.palletUpc || ''}
                      onChange={handleInputChange}
                      placeholder="Enter pallet UPC"
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-group mb-0">
                <label htmlFor="lotCodeFormat" className="form-label small font-weight-bold">Lot Code Format</label>
                <input
                  type="text"
                  id="lotCodeFormat"
                  name="lotCodeFormat"
                  className="form-control form-control-sm"
                  value={specSheetData.productIdentification.lotCodeFormat || ''}
                  onChange={handleInputChange}
                  placeholder="Enter lot code format"
                />
              </div>
            </div>
          </div>
          
          {/* Shelf Life & Image Section */}
          <div className="product-section">
            <div className="section-header py-1 px-2 bg-light rounded">
              <h3 className="section-title mb-0 small text-uppercase">
                <i className="fas fa-calendar-alt mr-1"></i>
                Shelf Life & Product Image
              </h3>
            </div>
            
            <div className="section-content p-2">
              <div className="row g-1">
                <div className="col-md-6">
                  <div className="shelf-life-container">
                    <div className="row g-1">
                      <div className="col-md-6">
                        <div className="form-group mb-0">
                          <label htmlFor="shelfLifeYears" className="form-label small font-weight-bold">Shelf Life (Years)</label>
                          <select
                            id="shelfLifeYears"
                            name="shelfLifeYears"
                            className="form-control form-control-sm"
                            value={specSheetData.productIdentification.shelfLifeYears || '0'}
                            onChange={handleInputChange}
                          >
                            {[...Array(6).keys()].map(year => (
                              <option key={year} value={year.toString()}>{year}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="col-md-6">
                        <div className="form-group mb-0">
                          <label htmlFor="shelfLifeMonths" className="form-label small font-weight-bold">Shelf Life (Months)</label>
                          <select
                            id="shelfLifeMonths"
                            name="shelfLifeMonths"
                            className="form-control form-control-sm"
                            value={specSheetData.productIdentification.shelfLifeMonths || '0'}
                            onChange={handleInputChange}
                          >
                            {[...Array(12).keys()].map(month => (
                              <option key={month} value={month.toString()}>{month}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="shelf-life-display mt-2 text-center">
                      <div className="card border-light">
                        <div className="card-body p-2">
                          <h5 className="card-title h6 mb-0 small">Total Shelf Life</h5>
                          <p className="shelf-life-value mb-0">
                            {specSheetData.productIdentification.shelfLifeYears || '0'} years, {specSheetData.productIdentification.shelfLifeMonths || '0'} months
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-group mb-0">
                    <label className="form-label small font-weight-bold">Product Image</label>
                    
                    <div className="product-image-container border rounded p-2 text-center">
                      {specSheetData.productIdentification.productImage ? (
                        <div className="product-image-preview">
                          <img 
                            src={specSheetData.productIdentification.productImage} 
                            alt="Product" 
                            className="product-image img-thumbnail"
                            style={{ maxWidth: '150px', maxHeight: '150px' }}
                          />
                          <button
                            type="button"
                            className="btn btn-danger btn-sm btn-xs mt-1"
                            onClick={() => {
                              setSpecSheetData(prevData => ({
                                ...prevData,
                                productIdentification: {
                                  ...prevData.productIdentification,
                                  productImage: null
                                }
                              }));
                            }}
                          >
                            <i className="fas fa-trash-alt mr-1"></i>
                            Remove Image
                          </button>
                        </div>
                      ) : (
                        <div className="product-image-upload">
                          <label htmlFor="product-image-upload" className="btn btn-secondary btn-sm">
                            {uploading ? 
                              <><i className="fas fa-spinner fa-spin mr-1"></i>Uploading...</> : 
                              <><i className="fas fa-upload mr-1"></i>Upload Product Image</>
                            }
                          </label>
                          <input
                            type="file"
                            id="product-image-upload"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                            disabled={uploading}
                          />
                          <p className="text-muted small mt-1 mb-0">
                            Upload a product image (JPG, PNG, GIF, max 5MB)
                          </p>
                        </div>
                      )}
                      
                      {uploadError && (
                        <div className="text-danger small mt-1">
                          <i className="fas fa-exclamation-circle mr-1"></i>
                          {uploadError}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx="true">{`
        .product-section {
          border: 1px solid #eee;
          border-radius: 0.25rem;
          overflow: hidden;
          margin-bottom: 0.75rem;
        }
        
        .product-section:last-child {
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
        
        .shelf-life-value {
          font-size: 1rem;
          font-weight: 600;
          color: var(--primary-color);
        }
        
        .product-image-container {
          min-height: 180px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default ProductIdentification;
