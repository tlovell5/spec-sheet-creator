import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTag, 
  faUpload, 
  faImage, 
  faTrash, 
  faExternalLinkAlt, 
  faBarcode, 
  faInfoCircle, 
  faCalendarAlt,
  faWeightHanging,
  faBoxOpen,
  faPalette,
  faFlask
} from '@fortawesome/free-solid-svg-icons';

const ProductIdentification = ({ specSheetData, setSpecSheetData }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
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
      setSpecSheetData(prevData => ({
        ...prevData,
        productIdentification: {
          ...prevData.productIdentification,
          productImage: publicUrlData.publicUrl
        }
      }));
    } catch (error) {
      console.error('Error uploading product image:', error);
      setUploadError('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  const handleRemoveProductImage = () => {
    setSpecSheetData(prevData => ({
      ...prevData,
      productIdentification: {
        ...prevData.productIdentification,
        productImage: ''
      }
    }));
  };

  // Auto-calculate units per pallet when units per case or cases per pallet changes
  const calculateUnitsPerPallet = () => {
    if (specSheetData.productIdentification?.unitsPerCase && specSheetData.productIdentification?.casesPerPallet) {
      const unitsPerPallet = specSheetData.productIdentification.unitsPerCase * specSheetData.productIdentification.casesPerPallet;
      setSpecSheetData(prevData => ({
        ...prevData,
        productIdentification: {
          ...prevData.productIdentification,
          unitsPerPallet
        }
      }));
    }
  };

  const handleUnitsPerCaseChange = (e) => {
    const value = e.target.value === '' ? '' : Number(e.target.value);
    setSpecSheetData(prevData => ({
      ...prevData,
      productIdentification: {
        ...prevData.productIdentification,
        unitsPerCase: value
      }
    }));
    
    // Trigger calculation after state update
    setTimeout(calculateUnitsPerPallet, 0);
  };

  const handleCasesPerPalletChange = (e) => {
    const value = e.target.value === '' ? '' : Number(e.target.value);
    setSpecSheetData(prevData => ({
      ...prevData,
      productIdentification: {
        ...prevData.productIdentification,
        casesPerPallet: value
      }
    }));
    
    // Trigger calculation after state update
    setTimeout(calculateUnitsPerPallet, 0);
  };

  return (
    <div className="product-identification-container">
      <div className="tabs-container">
        <div className="tabs-header">
          <button className="tab-button active">Basic Information</button>
          <button className="tab-button">Specifications</button>
          <button className="tab-button">Packaging</button>
        </div>
        
        <div className="tab-content">
          <div className="card-grid">
            <div className="info-card">
              <div className="info-card-title">
                <FontAwesomeIcon icon={faTag} />
                Product Details
              </div>
              <div className="form-group">
                <label htmlFor="productName" className="required-field">Product Name</label>
                <input
                  type="text"
                  id="productName"
                  name="productName"
                  value={specSheetData.productIdentification?.productName || ''}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                />
                <span className="field-help">The official name of the product as it will appear on packaging</span>
              </div>
              
              <div className="form-group">
                <label htmlFor="productCode" className="required-field">Product Code</label>
                <input
                  type="text"
                  id="productCode"
                  name="productCode"
                  value={specSheetData.productIdentification?.productCode || ''}
                  onChange={handleInputChange}
                  placeholder="Enter product code"
                />
                <span className="field-help">Unique identifier for this product</span>
              </div>
              
              <div className="form-group">
                <label htmlFor="upc">UPC/Barcode</label>
                <div className="input-with-icon">
                  <FontAwesomeIcon icon={faBarcode} className="input-icon" />
                  <input
                    type="text"
                    id="upc"
                    name="upc"
                    value={specSheetData.productIdentification?.upc || ''}
                    onChange={handleInputChange}
                    placeholder="Enter UPC or barcode"
                  />
                </div>
                <span className="field-help">Universal Product Code for retail scanning</span>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-card-title">
                <FontAwesomeIcon icon={faInfoCircle} />
                Description & Classification
              </div>
              <div className="form-group">
                <label htmlFor="description">Product Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={specSheetData.productIdentification?.description || ''}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  rows="3"
                />
                <span className="field-help">Brief description of the product and its purpose</span>
              </div>
              
              <div className="form-group">
                <label htmlFor="category">Product Category</label>
                <select
                  id="category"
                  name="category"
                  value={specSheetData.productIdentification?.category || ''}
                  onChange={handleInputChange}
                >
                  <option value="">Select Category</option>
                  <option value="Beverage">Beverage</option>
                  <option value="Food">Food</option>
                  <option value="Supplement">Supplement</option>
                  <option value="Cosmetic">Cosmetic</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Other">Other</option>
                </select>
                <span className="field-help">General product classification</span>
              </div>
            </div>
          </div>
          
          <div className="card-grid">
            <div className="info-card">
              <div className="info-card-title">
                <FontAwesomeIcon icon={faCalendarAlt} />
                Dates & Lifecycle
              </div>
              <div className="form-group">
                <label htmlFor="creationDate">Creation Date</label>
                <input
                  type="date"
                  id="creationDate"
                  name="creationDate"
                  value={specSheetData.productIdentification?.creationDate || ''}
                  onChange={handleInputChange}
                />
                <span className="field-help">When this product was first created</span>
              </div>
              
              <div className="form-group">
                <label htmlFor="shelfLife">Shelf Life</label>
                <div className="input-group">
                  <input
                    type="number"
                    id="shelfLife"
                    name="shelfLife"
                    value={specSheetData.productIdentification?.shelfLife || ''}
                    onChange={handleInputChange}
                    placeholder="Enter shelf life"
                    min="0"
                  />
                  <select
                    id="shelfLifeUnit"
                    name="shelfLifeUnit"
                    value={specSheetData.productIdentification?.shelfLifeUnit || 'months'}
                    onChange={handleInputChange}
                  >
                    <option value="days">Days</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
                <span className="field-help">How long the product remains viable after production</span>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-card-title">
                <FontAwesomeIcon icon={faWeightHanging} />
                Physical Properties
              </div>
              <div className="form-group">
                <label htmlFor="netWeight">Net Weight</label>
                <div className="input-group">
                  <input
                    type="number"
                    id="netWeight"
                    name="netWeight"
                    value={specSheetData.productIdentification?.netWeight || ''}
                    onChange={handleInputChange}
                    placeholder="Enter weight"
                    min="0"
                    step="0.01"
                  />
                  <select
                    id="weightUnit"
                    name="weightUnit"
                    value={specSheetData.productIdentification?.weightUnit || 'oz'}
                    onChange={handleInputChange}
                  >
                    <option value="oz">oz</option>
                    <option value="lb">lb</option>
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                  </select>
                </div>
                <span className="field-help">Weight of the product without packaging</span>
              </div>
              
              <div className="form-group">
                <label htmlFor="dimensions">Dimensions (L × W × H)</label>
                <div className="dimensions-input">
                  <input
                    type="number"
                    id="length"
                    name="length"
                    value={specSheetData.productIdentification?.length || ''}
                    onChange={handleInputChange}
                    placeholder="L"
                    min="0"
                    step="0.1"
                  />
                  <span>×</span>
                  <input
                    type="number"
                    id="width"
                    name="width"
                    value={specSheetData.productIdentification?.width || ''}
                    onChange={handleInputChange}
                    placeholder="W"
                    min="0"
                    step="0.1"
                  />
                  <span>×</span>
                  <input
                    type="number"
                    id="height"
                    name="height"
                    value={specSheetData.productIdentification?.height || ''}
                    onChange={handleInputChange}
                    placeholder="H"
                    min="0"
                    step="0.1"
                  />
                  <select
                    id="dimensionUnit"
                    name="dimensionUnit"
                    value={specSheetData.productIdentification?.dimensionUnit || 'in'}
                    onChange={handleInputChange}
                  >
                    <option value="in">in</option>
                    <option value="cm">cm</option>
                    <option value="mm">mm</option>
                  </select>
                </div>
                <span className="field-help">Physical dimensions of the product</span>
              </div>
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-card-title">
              <FontAwesomeIcon icon={faImage} />
              Product Image
            </div>
            
            {!specSheetData.productIdentification?.productImage ? (
              <div 
                className="image-upload-area"
                onClick={() => document.getElementById('productImageUpload').click()}
              >
                <FontAwesomeIcon icon={faUpload} className="image-upload-icon" />
                <p>Click to upload product image</p>
                <p className="field-help">Recommended size: 800x600px, Max size: 5MB</p>
                <p className="field-help">Supported formats: JPG, PNG, GIF</p>
                <input
                  type="file"
                  id="productImageUpload"
                  accept="image/*"
                  onChange={handleProductImageUpload}
                  style={{ display: 'none' }}
                />
                {uploadError && <p className="error-message">{uploadError}</p>}
                {uploading && (
                  <div className="upload-status">
                    <FontAwesomeIcon icon={faSpinner} spin />
                    <span>Uploading...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="product-image-preview">
                <img 
                  src={specSheetData.productIdentification.productImage} 
                  alt="Product" 
                  className="image-preview"
                />
                <div className="image-actions">
                  <button 
                    className="action-button"
                    onClick={() => window.open(specSheetData.productIdentification.productImage, '_blank')}
                  >
                    <FontAwesomeIcon icon={faExternalLinkAlt} />
                    View Full Size
                  </button>
                  <button 
                    className="action-button danger"
                    onClick={handleRemoveProductImage}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    Remove Image
                  </button>
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
