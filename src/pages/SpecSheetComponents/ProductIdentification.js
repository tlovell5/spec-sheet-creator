import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTag, faUpload, faImage, faTrash, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

const ProductIdentification = ({ data, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange('productIdentification', name, value);
  };

  const handleProductImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    const fileExt = file.name.split('.').pop();
    const allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
    if (!allowedTypes.includes(fileExt.toLowerCase())) {
      setUploadError('Invalid file type. Please upload an image file (jpg, jpeg, png, gif).');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size too large. Maximum size is 5MB.');
      return;
    }
    
    setUploading(true);
    setUploadError('');
    
    try {
      // Create a unique filename
      const fileName = `${Date.now()}-${file.name}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error } = await supabase.storage
        .from('spec-sheet-assets')
        .upload(`product-images/${fileName}`, file);
        
      if (error) throw error;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('spec-sheet-assets')
        .getPublicUrl(`product-images/${fileName}`);
      
      // Update the product_image field
      onChange('productIdentification', 'product_image', publicUrlData.publicUrl);
    } catch (error) {
      console.error('Error uploading product image:', error);
      setUploadError('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  const handleRemoveProductImage = () => {
    onChange('productIdentification', 'product_image', '');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange('productIdentification', name, value);
  };

  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value === '' ? '' : Number(value);
    onChange('productIdentification', name, numericValue);
  };

  // Auto-calculate units per pallet when units per case or cases per pallet changes
  const calculateUnitsPerPallet = () => {
    if (data?.units_per_case && data?.cases_per_pallet) {
      const unitsPerPallet = data.units_per_case * data.cases_per_pallet;
      onChange('productIdentification', 'units_per_pallet', unitsPerPallet);
    }
  };

  const handleUnitsPerCaseChange = (e) => {
    const value = e.target.value === '' ? '' : Number(e.target.value);
    onChange('productIdentification', 'units_per_case', value);
    
    // Trigger calculation after state update
    setTimeout(calculateUnitsPerPallet, 0);
  };

  const handleCasesPerPalletChange = (e) => {
    const value = e.target.value === '' ? '' : Number(e.target.value);
    onChange('productIdentification', 'cases_per_pallet', value);
    
    // Trigger calculation after state update
    setTimeout(calculateUnitsPerPallet, 0);
  };

  return (
    <div className="product-identification-container">
      <div className="section-header">
        <FontAwesomeIcon icon={faTag} className="section-icon" />
        <h2>Product Identification</h2>
      </div>
      <div className="section-content">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="product_name">Product Name</label>
            <input
              type="text"
              id="product_name"
              name="product_name"
              className="form-control"
              value={data?.product_name || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="sku_id">SKU ID</label>
            <input
              type="text"
              id="sku_id"
              name="sku_id"
              className="form-control"
              value={data?.sku_id || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="bom_id">BOM ID</label>
            <input
              type="text"
              id="bom_id"
              name="bom_id"
              className="form-control"
              value={data?.bom_id || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="wip_id">WIP ID</label>
            <input
              type="text"
              id="wip_id"
              name="wip_id"
              className="form-control"
              value={data?.wip_id || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="spec_revision">Spec Revision</label>
            <input
              type="text"
              id="spec_revision"
              name="spec_revision"
              className="form-control"
              value={data?.spec_revision || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="intended_use">Intended Use</label>
            <select
              id="intended_use"
              name="intended_use"
              className="form-control"
              value={data?.intended_use || ''}
              onChange={handleChange}
            >
              <option value="">Select Intended Use</option>
              <option value="Retail">Retail</option>
              <option value="Ingredient">Ingredient</option>
              <option value="Inclusion">Inclusion</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="unit_claim_weight">Unit Claim Weight</label>
            <input
              type="number"
              id="unit_claim_weight"
              name="unit_claim_weight"
              className="form-control"
              value={data?.unit_claim_weight || ''}
              onChange={handleNumericChange}
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label htmlFor="weight_uom">Unit of Measure</label>
            <select
              id="weight_uom"
              name="weight_uom"
              className="form-control"
              value={data?.weight_uom || ''}
              onChange={handleChange}
            >
              <option value="">Select UOM</option>
              <option value="g">Grams (g)</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="oz">Ounces (oz)</option>
              <option value="lb">Pounds (lb)</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="units_per_case">Units per Case</label>
            <input
              type="number"
              id="units_per_case"
              name="units_per_case"
              className="form-control"
              value={data?.units_per_case || ''}
              onChange={handleUnitsPerCaseChange}
              min="1"
              step="1"
            />
          </div>
          <div className="form-group">
            <label htmlFor="cases_per_pallet">Cases per Pallet</label>
            <input
              type="number"
              id="cases_per_pallet"
              name="cases_per_pallet"
              className="form-control"
              value={data?.cases_per_pallet || ''}
              onChange={handleCasesPerPalletChange}
              min="1"
              step="1"
            />
          </div>
          <div className="form-group">
            <label htmlFor="units_per_pallet">Units per Pallet (Auto-calculated)</label>
            <input
              type="number"
              id="units_per_pallet"
              name="units_per_pallet"
              className="form-control"
              value={data?.units_per_pallet || ''}
              readOnly
              disabled
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="unit_upc">Unit UPC</label>
            <input
              type="text"
              id="unit_upc"
              name="unit_upc"
              className="form-control"
              value={data?.unit_upc || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="case_upc">Case UPC</label>
            <input
              type="text"
              id="case_upc"
              name="case_upc"
              className="form-control"
              value={data?.case_upc || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="pallet_upc">Pallet UPC</label>
            <input
              type="text"
              id="pallet_upc"
              name="pallet_upc"
              className="form-control"
              value={data?.pallet_upc || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="lot_code_format">Lot Code Format</label>
            <input
              type="text"
              id="lot_code_format"
              name="lot_code_format"
              className="form-control"
              value={data?.lot_code_format || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="shelf_life_years">Shelf Life (Years)</label>
            <input
              type="number"
              id="shelf_life_years"
              name="shelf_life_years"
              className="form-control"
              value={data?.shelf_life_years || ''}
              onChange={handleNumericChange}
              min="0"
              max="10"
            />
          </div>
          <div className="form-group">
            <label htmlFor="shelf_life_months">Shelf Life (Months)</label>
            <input
              type="number"
              id="shelf_life_months"
              name="shelf_life_months"
              className="form-control"
              value={data?.shelf_life_months || ''}
              onChange={handleNumericChange}
              min="0"
              max="11"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <div className="file-upload">
              <label className="file-upload-label">Product Picture</label>
              <label className="file-upload-input">
                <FontAwesomeIcon icon={faUpload} /> 
                <span>Click or drag to upload product image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProductImageUpload}
                  style={{ display: 'none' }}
                />
              </label>
              {uploadError && <div className="error-message">{uploadError}</div>}
            </div>
            
            {data?.product_image ? (
              <div className="image-preview-container">
                <div className="image-preview">
                  <img src={data.product_image} alt="Product" />
                  
                  {uploading && (
                    <div className="uploading-overlay">
                      <div className="uploading-spinner"></div>
                      <div className="uploading-text">Uploading...</div>
                    </div>
                  )}
                  
                  <div className="image-actions">
                    <button 
                      className="image-action-button" 
                      onClick={() => window.open(data.product_image, '_blank')}
                      title="View Full Size"
                    >
                      <FontAwesomeIcon icon={faExternalLinkAlt} />
                    </button>
                    <button 
                      className="image-action-button delete" 
                      onClick={handleRemoveProductImage}
                      title="Remove Image"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
                <div className="image-caption">Product Image</div>
              </div>
            ) : (
              <div className="image-preview-container">
                <div className="image-placeholder">
                  <FontAwesomeIcon icon={faImage} />
                  <span>No product image uploaded</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductIdentification;
