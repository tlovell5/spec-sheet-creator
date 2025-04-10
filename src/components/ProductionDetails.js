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
        <h2 className="spec-sheet-section-title">Production Details</h2>
      </div>
      
      <div className="card-body">
        <div className="form-section mb-4">
          <h3 className="mb-3">Materials</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Material Name</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(specSheetData.productionDetails?.materials || []).map((material, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={material.name || ''}
                        onChange={(e) => handleMaterialChange(index, 'name', e.target.value)}
                        placeholder="Material name"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={material.description || ''}
                        onChange={(e) => handleMaterialChange(index, 'description', e.target.value)}
                        placeholder="Description"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={material.quantity || ''}
                        onChange={(e) => handleMaterialChange(index, 'quantity', e.target.value)}
                        placeholder="Quantity"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td>
                      <select
                        className="form-control"
                        value={material.unit || 'g'}
                        onChange={(e) => handleMaterialChange(index, 'unit', e.target.value)}
                      >
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="oz">oz</option>
                        <option value="lbs">lbs</option>
                        <option value="ea">ea</option>
                        <option value="ml">ml</option>
                        <option value="L">L</option>
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemoveMaterial(index)}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
                {(specSheetData.productionDetails?.materials || []).length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center">
                      <em>No materials added yet</em>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAddMaterial}
          >
            Add Material
          </button>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="productionNotes" className="form-label">Production Notes</label>
            <textarea
              id="productionNotes"
              name="productionNotes"
              className="form-control"
              value={specSheetData.productionDetails?.productionNotes || ''}
              onChange={handleTextareaChange}
              placeholder="Enter any special production notes or requirements"
              rows="4"
            ></textarea>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="qualityCheckpoints" className="form-label">Quality Checkpoints</label>
            <textarea
              id="qualityCheckpoints"
              name="qualityCheckpoints"
              className="form-control"
              value={specSheetData.productionDetails?.qualityCheckpoints || ''}
              onChange={handleTextareaChange}
              placeholder="Enter quality control checkpoints"
              rows="4"
            ></textarea>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Artwork File</label>
            
            <div className="artwork-file-container">
              {specSheetData.productionDetails?.artworkFile ? (
                <div className="artwork-file-preview">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-file-image mr-2" style={{ fontSize: '24px' }}></i>
                    <a 
                      href={specSheetData.productionDetails.artworkFile} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="artwork-filename"
                    >
                      {specSheetData.productionDetails.artworkFileName || 'Artwork File'}
                    </a>
                  </div>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm mt-2"
                    onClick={() => {
                      setSpecSheetData(prevData => ({
                        ...prevData,
                        productionDetails: {
                          ...prevData.productionDetails,
                          artworkFile: null,
                          artworkFileName: null
                        }
                      }));
                    }}
                  >
                    Remove File
                  </button>
                </div>
              ) : (
                <div className="artwork-file-upload">
                  <label htmlFor="artwork-file-upload" className="btn btn-secondary">
                    {uploading ? 'Uploading...' : 'Upload Artwork File'}
                  </label>
                  <input
                    type="file"
                    id="artwork-file-upload"
                    accept=".jpg,.jpeg,.png,.gif,.pdf"
                    onChange={handleArtworkUpload}
                    style={{ display: 'none' }}
                    disabled={uploading}
                  />
                  <p className="text-muted mt-2">
                    Upload artwork file (JPG, PNG, GIF, PDF, max 10MB)
                  </p>
                </div>
              )}
              
              {uploadError && (
                <div className="text-danger mt-2">
                  {uploadError}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionDetails;
