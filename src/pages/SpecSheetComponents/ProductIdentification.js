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
  faFlask,
  faSpinner
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
      <div className="product-info-layout">
        {/* Left Column - Basic Product Information */}
        <div className="product-info-column">
          <div className="info-card product-details-card">
            <div className="info-card-title">
              <FontAwesomeIcon icon={faTag} />
              Basic Product Information
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
                className="form-control"
              />
              <span className="field-help">The official name of the product as it will appear on packaging</span>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="productCode" className="required-field">Product Code</label>
                <input
                  type="text"
                  id="productCode"
                  name="productCode"
                  value={specSheetData.productIdentification?.productCode || ''}
                  onChange={handleInputChange}
                  placeholder="Enter product code"
                  className="form-control"
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
                    className="form-control"
                  />
                </div>
                <span className="field-help">Universal Product Code for retail scanning</span>
              </div>
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
                className="form-control"
              />
              <span className="field-help">Brief description of the product and its purpose</span>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Product Category</label>
                <select
                  id="category"
                  name="category"
                  value={specSheetData.productIdentification?.category || ''}
                  onChange={handleInputChange}
                  className="form-select"
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
              
              <div className="form-group">
                <label htmlFor="status">Product Status</label>
                <select
                  id="status"
                  name="status"
                  value={specSheetData.productIdentification?.status || ''}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="In Development">In Development</option>
                  <option value="Discontinued">Discontinued</option>
                  <option value="Seasonal">Seasonal</option>
                </select>
                <span className="field-help">Current status of this product</span>
              </div>
            </div>
          </div>
          
          {/* Product Image Section */}
          <div className="info-card product-image-card">
            <div className="info-card-title">
              <FontAwesomeIcon icon={faImage} />
              Product Image
            </div>
            
            {!specSheetData.productIdentification?.productImage ? (
              <div 
                className="image-upload-area product-image-upload"
                onClick={() => document.getElementById('productImageUpload').click()}
              >
                <FontAwesomeIcon icon={faUpload} className="image-upload-icon" />
                <p>Click to upload product image</p>
                <p className="field-help">Recommended: 800×600px (Max: 5MB)</p>
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
                    <FontAwesomeIcon icon={faSpinner} pulse />
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
        
        {/* Right Column - Product Specifications */}
        <div className="product-info-column">
          <div className="info-card product-specs-card">
            <div className="info-card-title">
              <FontAwesomeIcon icon={faFlask} />
              Product Specifications
            </div>
            
            <div className="section-divider">
              <span>Physical Properties</span>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="netWeight">Net Weight</label>
                <div className="input-group">
                  <input
                    type="number"
                    id="netWeight"
                    name="netWeight"
                    value={specSheetData.productIdentification?.netWeight || ''}
                    onChange={handleInputChange}
                    placeholder="Weight"
                    min="0"
                    step="0.01"
                    className="form-control input-sm"
                  />
                  <select
                    id="weightUnit"
                    name="weightUnit"
                    value={specSheetData.productIdentification?.weightUnit || 'oz'}
                    onChange={handleInputChange}
                    style={{ 
                      width: '60px', 
                      height: '34px', 
                      fontSize: '13px',
                      padding: '2px 4px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="oz">oz</option>
                    <option value="lb">lb</option>
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                  </select>
                </div>
                <span className="field-help">Weight without packaging</span>
              </div>
              
              <div className="form-group">
                <label htmlFor="volume">Volume</label>
                <div className="input-group">
                  <input
                    type="number"
                    id="volume"
                    name="volume"
                    value={specSheetData.productIdentification?.volume || ''}
                    onChange={handleInputChange}
                    placeholder="Volume"
                    min="0"
                    step="0.01"
                    className="form-control input-sm"
                  />
                  <select
                    id="volumeUnit"
                    name="volumeUnit"
                    value={specSheetData.productIdentification?.volumeUnit || 'oz'}
                    onChange={handleInputChange}
                    style={{ 
                      width: '60px', 
                      height: '34px', 
                      fontSize: '13px',
                      padding: '2px 4px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="oz">fl oz</option>
                    <option value="ml">ml</option>
                    <option value="l">L</option>
                    <option value="gal">gal</option>
                  </select>
                </div>
                <span className="field-help">Liquid volume if applicable</span>
              </div>
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
                  className="form-control dimension-input input-sm"
                />
                <span className="dimension-separator">×</span>
                <input
                  type="number"
                  id="width"
                  name="width"
                  value={specSheetData.productIdentification?.width || ''}
                  onChange={handleInputChange}
                  placeholder="W"
                  min="0"
                  step="0.1"
                  className="form-control dimension-input input-sm"
                />
                <span className="dimension-separator">×</span>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={specSheetData.productIdentification?.height || ''}
                  onChange={handleInputChange}
                  placeholder="H"
                  min="0"
                  step="0.1"
                  className="form-control dimension-input input-sm"
                />
                <select
                  id="dimensionUnit"
                  name="dimensionUnit"
                  value={specSheetData.productIdentification?.dimensionUnit || 'in'}
                  onChange={handleInputChange}
                  style={{ 
                    width: '60px', 
                    height: '34px', 
                    fontSize: '13px',
                    padding: '2px 4px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                >
                  <option value="in">in</option>
                  <option value="cm">cm</option>
                  <option value="mm">mm</option>
                </select>
              </div>
              <span className="field-help">Physical dimensions of the product</span>
            </div>
            
            <div className="section-divider">
              <span>Packaging Information</span>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="unitsPerCase">Units per Case</label>
                <input
                  type="number"
                  id="unitsPerCase"
                  name="unitsPerCase"
                  value={specSheetData.productIdentification?.unitsPerCase || ''}
                  onChange={handleUnitsPerCaseChange}
                  placeholder="Enter units per case"
                  min="1"
                  step="1"
                  className="form-control input-sm"
                />
                <span className="field-help">Number of units in each case</span>
              </div>
              
              <div className="form-group">
                <label htmlFor="casesPerPallet">Cases per Pallet</label>
                <input
                  type="number"
                  id="casesPerPallet"
                  name="casesPerPallet"
                  value={specSheetData.productIdentification?.casesPerPallet || ''}
                  onChange={handleCasesPerPalletChange}
                  placeholder="Enter cases per pallet"
                  min="1"
                  step="1"
                  className="form-control input-sm"
                />
                <span className="field-help">Number of cases on each pallet</span>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="unitsPerPallet">Units per Pallet</label>
              <input
                type="number"
                id="unitsPerPallet"
                name="unitsPerPallet"
                value={specSheetData.productIdentification?.unitsPerPallet || ''}
                readOnly
                disabled
                className="form-control calculated-field input-sm"
              />
              <span className="field-help">Auto-calculated from units per case × cases per pallet</span>
            </div>
            
            <div className="section-divider">
              <span>Product Lifecycle</span>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="lotCodeFormat">Lot Code Format</label>
                <input
                  type="text"
                  id="lotCodeFormat"
                  name="lotCodeFormat"
                  value={specSheetData.productIdentification?.lotCodeFormat || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., NXL125058"
                  className="form-control input-sm"
                />
                <span className="field-help">Format: Company Initials (NX) + Production Line (L1) + Year (25) + Julian Date (058)</span>
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
                    placeholder="Shelf life"
                    min="0"
                    className="form-control input-sm"
                  />
                  <select
                    id="shelfLifeUnit"
                    name="shelfLifeUnit"
                    value={specSheetData.productIdentification?.shelfLifeUnit || 'months'}
                    onChange={handleInputChange}
                    style={{ 
                      width: '75px', 
                      height: '34px', 
                      fontSize: '13px',
                      padding: '2px 4px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="days">Days</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
                <span className="field-help">How long the product remains usable</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductIdentification;
