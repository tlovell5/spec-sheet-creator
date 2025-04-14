import React, { useState, useContext } from 'react';
import { SpecSheetContext } from '../context/SpecSheetContext';
import { STORAGE_BUCKETS, uploadFile } from '../supabaseClient';

const ProductionDetails = () => {
  const { specSheetData, setSpecSheetData } = useContext(SpecSheetContext);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setSpecSheetData(prevData => ({
      ...prevData,
      productionDetails: {
        ...prevData.productionDetails,
        [name]: value
      }
    }));
  };
  
  // Handle textarea changes
  const handleTextareaChange = (e) => {
    const { name, value } = e.target;
    
    setSpecSheetData(prevData => ({
      ...prevData,
      productionDetails: {
        ...prevData.productionDetails,
        [name]: value
      }
    }));
  };
  
  // Handle artwork upload
  const handleArtworkUpload = async (e) => {
    try {
      setUploading(true);
      setUploadError(null);
      
      const file = e.target.files[0];
      
      if (!file) {
        return;
      }
      
      // Validate file type
      const fileExt = file.name.split('.').pop();
      const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'pdf'];
      
      if (!allowedTypes.includes(fileExt.toLowerCase())) {
        setUploadError('Invalid file type. Please upload an image or PDF file (JPG, PNG, GIF, PDF).');
        setUploading(false);
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size too large. Maximum size is 10MB.');
        setUploading(false);
        return;
      }
      
      // Upload file to Supabase storage
      const { data, error } = await uploadFile(
        file,
        STORAGE_BUCKETS.ARTWORK_FILES
      );
      
      if (error) {
        throw error;
      }
      
      // Update spec sheet data with artwork URL
      setSpecSheetData(prevData => ({
        ...prevData,
        productionDetails: {
          ...prevData.productionDetails,
          artworkFile: data.publicUrl,
          artworkFileName: file.name
        }
      }));
      
      setUploading(false);
    } catch (error) {
      console.error('Error uploading artwork file:', error);
      setUploadError('Failed to upload artwork file. Please try again.');
      setUploading(false);
    }
  };
  
  // Handle material field changes
  const handleMaterialChange = (index, field, value) => {
    setSpecSheetData(prevData => {
      const updatedMaterials = [...(prevData.productionDetails?.materials || [])];
      
      if (!updatedMaterials[index]) {
        updatedMaterials[index] = {};
      }
      
      updatedMaterials[index][field] = value;
      
      return {
        ...prevData,
        productionDetails: {
          ...prevData.productionDetails,
          materials: updatedMaterials
        }
      };
    });
  };
  
  // Add a new material row
  const handleAddMaterial = () => {
    setSpecSheetData(prevData => ({
      ...prevData,
      productionDetails: {
        ...prevData.productionDetails,
        materials: [
          ...(prevData.productionDetails?.materials || []),
          { name: '', description: '', quantity: '', unit: 'g' }
        ]
      }
    }));
  };
  
  // Remove a material row
  const handleRemoveMaterial = (index) => {
    setSpecSheetData(prevData => {
      const updatedMaterials = [...(prevData.productionDetails?.materials || [])];
      updatedMaterials.splice(index, 1);
      
      return {
        ...prevData,
        productionDetails: {
          ...prevData.productionDetails,
          materials: updatedMaterials
        }
      };
    });
  };

  return (
    <div className="card spec-sheet-section">
      <div className="card-header spec-sheet-section-header">
        <h2 className="spec-sheet-section-title">
          <i className="fas fa-industry"></i>
          Production Details
        </h2>
      </div>
      
      <div className="card-body p-2">
        <div className="production-details-container">
          {/* Materials Section */}
          <div className="production-section mb-2">
            <div className="section-header d-flex justify-content-between align-items-center py-1 px-2 bg-light rounded">
              <h3 className="section-title mb-0 small text-uppercase">
                <i className="fas fa-boxes mr-1"></i>
                Materials
              </h3>
            </div>
            
            <div className="section-content p-2">
              <div className="materials-list">
                {(specSheetData.productionDetails?.materials || []).length === 0 ? (
                  <p className="text-muted small mb-0">No materials added yet</p>
                ) : (
                  <div className="row g-1">
                    {(specSheetData.productionDetails?.materials || []).map((material, index) => (
                      <div key={index} className="col-md-6 mb-1">
                        <div className="material-item d-flex align-items-center">
                          <span 
                            className={`material-badge badge badge-${
                              material.type === 'Ingredient' ? 'primary' : 
                              material.type === 'Packaging' ? 'success' : 
                              material.type === 'WIP' ? 'warning' : 
                              material.type === 'Inclusion' ? 'info' : 
                              'secondary'
                            } mr-2`}
                          >
                            {material.type}
                          </span>
                          <span className="material-name small">{material.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Product Information Section */}
          <div className="production-section mb-2">
            <div className="section-header d-flex justify-content-between align-items-center py-1 px-2 bg-light rounded">
              <h3 className="section-title mb-0 small text-uppercase">
                <i className="fas fa-info-circle mr-1"></i>
                Product Information
              </h3>
            </div>
            
            <div className="section-content p-2">
              <div className="form-group mb-2">
                <label htmlFor="productDescription" className="form-label small font-weight-bold">Product Description</label>
                <textarea
                  id="productDescription"
                  name="productDescription"
                  className="form-control form-control-sm"
                  value={specSheetData.productionDetails?.productDescription || ''}
                  onChange={handleTextareaChange}
                  placeholder="Enter product description"
                  rows="2"
                ></textarea>
              </div>
              
              <div className="form-group mb-0">
                <label htmlFor="allergens" className="form-label small font-weight-bold">Allergens</label>
                <textarea
                  id="allergens"
                  name="allergens"
                  className="form-control form-control-sm"
                  value={specSheetData.productionDetails?.allergens || ''}
                  onChange={handleTextareaChange}
                  placeholder="Enter allergen information"
                  rows="2"
                ></textarea>
              </div>
            </div>
          </div>
          
          {/* Weights Section */}
          <div className="production-section mb-2">
            <div className="section-header d-flex justify-content-between align-items-center py-1 px-2 bg-light rounded">
              <h3 className="section-title mb-0 small text-uppercase">
                <i className="fas fa-weight mr-1"></i>
                Weights
              </h3>
            </div>
            
            <div className="section-content p-2">
              <div className="row g-1">
                <div className="col-md-6">
                  <div className="form-group mb-2 mb-md-0">
                    <label htmlFor="targetWeight" className="form-label small font-weight-bold">Target Weight (g)</label>
                    <input
                      type="number"
                      id="targetWeight"
                      name="targetWeight"
                      className="form-control form-control-sm"
                      value={specSheetData.productionDetails?.targetWeight || ''}
                      onChange={handleInputChange}
                      placeholder="Enter target weight"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-group mb-0">
                    <label htmlFor="weightTolerance" className="form-label small font-weight-bold">Weight Tolerance (%)</label>
                    <input
                      type="number"
                      id="weightTolerance"
                      name="weightTolerance"
                      className="form-control form-control-sm"
                      value={specSheetData.productionDetails?.weightTolerance || ''}
                      onChange={handleInputChange}
                      placeholder="Enter weight tolerance"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Artwork Section */}
          <div className="production-section mb-2">
            <div className="section-header d-flex justify-content-between align-items-center py-1 px-2 bg-light rounded">
              <h3 className="section-title mb-0 small text-uppercase">
                <i className="fas fa-paint-brush mr-1"></i>
                Artwork
              </h3>
            </div>
            
            <div className="section-content p-2">
              <div className="artwork-upload-container">
                <div className="form-group mb-0">
                  <label className="form-label small font-weight-bold">Artwork File</label>
                  
                  <div className="artwork-upload border rounded p-2 text-center">
                    {specSheetData.productionDetails?.artworkFile ? (
                      <div className="artwork-preview">
                        {specSheetData.productionDetails.artworkFile.endsWith('.pdf') ? (
                          <div className="pdf-preview d-flex align-items-center justify-content-center mb-2">
                            <i className="fas fa-file-pdf text-danger fa-3x"></i>
                          </div>
                        ) : (
                          <img 
                            src={specSheetData.productionDetails.artworkFile} 
                            alt="Artwork" 
                            className="artwork-image img-thumbnail mb-2"
                            style={{ maxHeight: '150px' }}
                          />
                        )}
                        
                        <div className="artwork-actions">
                          <a 
                            href={specSheetData.productionDetails.artworkFile} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-primary btn-sm mr-2"
                          >
                            <i className="fas fa-eye mr-1"></i>
                            View
                          </a>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                              setSpecSheetData(prevData => ({
                                ...prevData,
                                productionDetails: {
                                  ...prevData.productionDetails,
                                  artworkFile: null
                                }
                              }));
                            }}
                          >
                            <i className="fas fa-trash-alt mr-1"></i>
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="artwork-upload-prompt">
                        <label htmlFor="artwork-file-upload" className="btn btn-secondary btn-sm mb-0">
                          {uploading ? 
                            <><i className="fas fa-spinner fa-spin mr-1"></i>Uploading...</> : 
                            <><i className="fas fa-upload mr-1"></i>Upload Artwork</>
                          }
                        </label>
                        <input
                          type="file"
                          id="artwork-file-upload"
                          accept=".jpg,.jpeg,.png,.gif,.pdf"
                          onChange={handleArtworkUpload}
                          style={{ display: 'none' }}
                          disabled={uploading}
                        />
                        <p className="text-muted small mt-1 mb-0">
                          Upload artwork file (JPG, PNG, PDF, max 10MB)
                        </p>
                      </div>
                    )}
                    
                    {uploadError && (
                      <div className="text-danger small mt-2">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {uploadError}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Notes Section */}
          <div className="production-section">
            <div className="section-header d-flex justify-content-between align-items-center py-1 px-2 bg-light rounded">
              <h3 className="section-title mb-0 small text-uppercase">
                <i className="fas fa-sticky-note mr-1"></i>
                Notes
              </h3>
            </div>
            
            <div className="section-content p-2">
              <div className="form-group mb-0">
                <label htmlFor="productionNotes" className="form-label small font-weight-bold">Production Notes</label>
                <textarea
                  id="productionNotes"
                  name="productionNotes"
                  className="form-control form-control-sm"
                  value={specSheetData.productionDetails?.productionNotes || ''}
                  onChange={handleTextareaChange}
                  placeholder="Enter production notes"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx="true">{`
        .production-section {
          border: 1px solid #eee;
          border-radius: 0.25rem;
          overflow: hidden;
          margin-bottom: 0.75rem;
        }
        
        .production-section:last-child {
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
        
        .material-badge {
          font-size: 0.7rem;
          padding: 0.2rem 0.4rem;
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
        
        .artwork-upload {
          min-height: 150px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default ProductionDetails;
