import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPalette,
  faFlask,
  faSpinner,
  faListAlt,
  faRectangleList,
  faSignature,
  faTag,
  faInfoCircle,
  faWeightHanging,
  faBarcode,
  faUpload, 
  faImage, 
  faTrash, 
  faExternalLinkAlt, 
  faCalendarAlt,
  faBoxOpen,
  faPallet,
  faCalculator,
  faCode,
  faClock
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
        .upload(`product-images/${fileName}`, file, {
          upsert: true,
          cacheControl: '3600'
        });
        
      if (error) {
        console.error('Error uploading product image:', error);
        throw error;
      }
      
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
    const unitsPerCase = Number(specSheetData.productIdentification?.unitsPerCase) || 0;
    const casesPerPallet = Number(specSheetData.productIdentification?.casesPerPallet) || 0;
    
    if (unitsPerCase > 0 && casesPerPallet > 0) {
      const unitsPerPallet = unitsPerCase * casesPerPallet;
      setSpecSheetData(prevData => ({
        ...prevData,
        productIdentification: {
          ...prevData.productIdentification,
          unitsPerPallet
        }
      }));
    } else {
      // Clear the units per pallet if either input is missing or zero
      setSpecSheetData(prevData => ({
        ...prevData,
        productIdentification: {
          ...prevData.productIdentification,
          unitsPerPallet: ''
        }
      }));
    }
  };

  // Add useEffect to ensure calculation happens when component mounts or values change
  useEffect(() => {
    calculateUnitsPerPallet();
  }, [specSheetData.productIdentification?.unitsPerCase, specSheetData.productIdentification?.casesPerPallet]);

  const handleUnitsPerCaseChange = (e) => {
    const value = e.target.value === '' ? '' : Number(e.target.value);
    setSpecSheetData(prevData => ({
      ...prevData,
      productIdentification: {
        ...prevData.productIdentification,
        unitsPerCase: value
      }
    }));
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
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="productName">Product Name</label>
                <div className="input-with-icon">
                  <FontAwesomeIcon icon={faSignature} className="input-icon" />
                  <input
                    type="text"
                    id="productName"
                    name="productName"
                    value={specSheetData.productIdentification?.productName || ''}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    className="form-control"
                  />
                </div>
                <span className="field-help">Full product name as it appears on packaging</span>
              </div>
              <div className="form-group">
                <label htmlFor="sku">SKU</label>
                <div className="input-with-icon">
                  <FontAwesomeIcon icon={faBarcode} className="input-icon" />
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    value={specSheetData.productIdentification?.sku || ''}
                    onChange={handleInputChange}
                    placeholder="Enter SKU"
                    className="form-control"
                  />
                </div>
                <span className="field-help">Stock Keeping Unit identifier</span>
              </div>
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
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bomId">BOM ID</label>
                <div className="input-with-icon">
                  <FontAwesomeIcon icon={faRectangleList} className="input-icon" />
                  <input
                    type="text"
                    id="bomId"
                    name="bomId"
                    placeholder="Enter BOM ID"
                    className="form-control"
                    value={specSheetData.productIdentification?.bomId || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <span className="field-help">Bill of Materials identifier</span>
              </div>
              <div className="form-group">
                <label htmlFor="wipId">WIP ID</label>
                <div className="input-with-icon">
                  <FontAwesomeIcon icon={faFlask} className="input-icon" />
                  <input
                    type="text"
                    id="wipId"
                    name="wipId"
                    value={specSheetData.productIdentification?.wipId || ''}
                    onChange={handleInputChange}
                    placeholder="Enter WIP ID"
                    className="form-control"
                  />
                </div>
                <span className="field-help">Work in Progress identifier</span>
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
                <div className="input-with-icon">
                  <FontAwesomeIcon icon={faTag} className="input-icon" />
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
                </div>
                <span className="field-help">General product classification</span>
              </div>
              
              <div className="form-group">
                <label htmlFor="status">Product Status</label>
                <div className="input-with-icon">
                  <FontAwesomeIcon icon={faInfoCircle} className="input-icon" />
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
                </div>
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
            
            <div className="form-group">
              <label htmlFor="netWeight">Packaging Claim Weight</label>
              <div className="weight-group">
                <div className="input-icon-container">
                  <FontAwesomeIcon icon={faWeightHanging} />
                </div>
                <input
                  type="number"
                  id="netWeight"
                  name="netWeight"
                  value={specSheetData.productIdentification?.netWeight || ''}
                  onChange={handleInputChange}
                  placeholder="Enter weight"
                  step="0.01"
                />
                <select
                  id="weightUom"
                  name="weightUom"
                  value={specSheetData.productIdentification?.weightUom || 'g'}
                  onChange={handleInputChange}
                >
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="oz">oz</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
              <span className="field-help">Net weight as stated on packaging</span>
            </div>
            
            <div className="section-divider">
              <FontAwesomeIcon icon={faBoxOpen} className="section-icon" />
              Packaging Information
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="unitsPerCase">Units per Case</label>
                <div className="input-with-icon">
                  <FontAwesomeIcon icon={faBoxOpen} className="input-icon" />
                  <input
                    type="number"
                    id="unitsPerCase"
                    name="unitsPerCase"
                    value={specSheetData.productIdentification?.unitsPerCase || ''}
                    onChange={handleUnitsPerCaseChange}
                    placeholder="Enter units per case"
                    min="1"
                    step="1"
                    className="form-control"
                  />
                </div>
                <span className="field-help">Number of units in each case</span>
              </div>
              
              <div className="form-group">
                <label htmlFor="casesPerPallet">Cases per Pallet</label>
                <div className="input-with-icon">
                  <FontAwesomeIcon icon={faPallet} className="input-icon" />
                  <input
                    type="number"
                    id="casesPerPallet"
                    name="casesPerPallet"
                    value={specSheetData.productIdentification?.casesPerPallet || ''}
                    onChange={handleCasesPerPalletChange}
                    placeholder="Enter cases per pallet"
                    min="1"
                    step="1"
                    className="form-control"
                  />
                </div>
                <span className="field-help">Number of cases on each pallet</span>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="unitsPerPallet">Units per Pallet</label>
                <div className="input-with-icon">
                  <FontAwesomeIcon icon={faCalculator} className="input-icon" />
                  <input
                    type="number"
                    id="unitsPerPallet"
                    name="unitsPerPallet"
                    value={specSheetData.productIdentification?.unitsPerPallet || ''}
                    readOnly
                    disabled
                    className="form-control calculated-field"
                  />
                </div>
                <span className="field-help">Auto-calculated from units per case × cases per pallet</span>
              </div>
            </div>
            
            <div className="section-divider">
              <span>Product Lifecycle</span>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="lotCodeFormat">Lot Code Format</label>
                <div className="input-with-icon">
                  <FontAwesomeIcon icon={faCode} className="input-icon" />
                  <input
                    type="text"
                    id="lotCodeFormat"
                    name="lotCodeFormat"
                    value={specSheetData.productIdentification?.lotCodeFormat || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., NXL125058"
                    className="form-control"
                  />
                </div>
                <span className="field-help">Format: Company Initials (NX) + Production Line (L1) + Year (25) + Julian Date (058)</span>
              </div>
              
              <div className="form-group">
                <label htmlFor="shelfLife">Shelf Life</label>
                <div className="shelf-life-group">
                  <div className="input-icon-container">
                    <FontAwesomeIcon icon={faClock} />
                  </div>
                  <input
                    type="number"
                    id="shelfLife"
                    name="shelfLife"
                    value={specSheetData.productIdentification?.shelfLife || ''}
                    onChange={handleInputChange}
                    placeholder="Shelf life"
                    min="0"
                  />
                  <select
                    id="shelfLifeUnit"
                    name="shelfLifeUnit"
                    value={specSheetData.productIdentification?.shelfLifeUnit || 'months'}
                    onChange={handleInputChange}
                  >
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
                <span className="field-help">Product shelf life from date of manufacture</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductIdentification;
