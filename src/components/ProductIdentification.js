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
          {/* Basic Information Section */}
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

          {/* Weights Section */}
          <div className="product-section mb-2">
            <div className="section-header py-1 px-2 bg-light rounded">
              <h3 className="section-title mb-0 small text-uppercase">
                <i className="fas fa-weight mr-1"></i>
                Weights
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

          {/* Artwork Section */}
          <div className="product-section mb-2">
            <div className="section-header py-1 px-2 bg-light rounded">
              <h3 className="section-title mb-0 small text-uppercase">
                <i className="fas fa-image mr-1"></i>
                Artwork
              </h3>
            </div>

            <div className="section-content p-2">
              <div className="product-image-container">
                <div className="form-group mb-0">
                  <label className="form-label small font-weight-bold">Product Image</label>

                  <div className="product-image-upload border rounded p-2 text-center">
                    {specSheetData.productIdentification?.productImage ? (
                      <div className="product-image-preview">
                        <img
                          src={specSheetData.productIdentification.productImage}
                          alt="Product"
                          className="img-fluid img-thumbnail mb-2"
                          style={{ maxHeight: '150px' }}
                        />
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleImageChange(null)}
                        >
                          <i className="fas fa-trash-alt mr-1"></i>
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <div className="product-image-upload-prompt">
                        <i className="fas fa-camera fa-3x text-muted mb-2"></i>
                        <p className="mb-2">Upload a product image (JPG, PNG)</p>
                        <label htmlFor="productImage" className="btn btn-primary btn-sm">
                          <i className="fas fa-upload mr-1"></i>
                          Select Image
                        </label>
                        <input
                          type="file"
                          id="productImage"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              // Mock upload for now
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                handleImageChange(event.target.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          style={{ display: 'none' }}
                        />
                        {uploadError && (
                          <div className="alert alert-danger mt-2 mb-0 p-2 small">
                            {uploadError}
                          </div>
                        )}
                        {uploading && (
                          <div className="mt-2">
                            <div className="spinner-border spinner-border-sm text-primary" role="status">
                              <span className="sr-only">Loading...</span>
                            </div>
                            <span className="ml-2">Uploading...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="product-section">
            <div className="section-header py-1 px-2 bg-light rounded">
              <h3 className="section-title mb-0 small text-uppercase">
                <i className="fas fa-sticky-note mr-1"></i>
                Notes
              </h3>
            </div>

            <div className="section-content p-2">
              <div className="form-group mb-0">
                <label htmlFor="notes" className="form-label small font-weight-bold">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  className="form-control form-control-sm"
                  value={specSheetData.productIdentification.notes || ''}
                  onChange={handleInputChange}
                  placeholder="Enter notes"
                />
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

        .product-image-upload {
          min-height: 150px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .product-image-upload-prompt {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
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
      `}</style>
    </div>
  );
};

export default ProductIdentification;
