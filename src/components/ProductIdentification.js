import React, { useState, useContext, useEffect } from 'react';
import { SpecSheetContext } from '../context/SpecSheetContext';
import { STORAGE_BUCKETS, uploadFile } from '../supabaseClient';

const ProductIdentification = () => {
  const { specSheetData, setSpecSheetData } = useContext(SpecSheetContext);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  
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
  
  // Handle product image upload
  const handleImageUpload = async (e) => {
    try {
      setUploading(true);
      setUploadError(null);
      
      const file = e.target.files[0];
      
      if (!file) {
        return;
      }
      
      // Validate file type
      const fileExt = file.name.split('.').pop();
      const allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
      
      if (!allowedTypes.includes(fileExt.toLowerCase())) {
        setUploadError('Invalid file type. Please upload an image file (JPG, PNG, GIF).');
        setUploading(false);
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size too large. Maximum size is 5MB.');
        setUploading(false);
        return;
      }
      
      // Upload file to Supabase storage
      const { data, error } = await uploadFile(
        file,
        STORAGE_BUCKETS.PRODUCT_IMAGES
      );
      
      if (error) {
        throw error;
      }
      
      // Update spec sheet data with product image URL
      setSpecSheetData(prevData => ({
        ...prevData,
        productIdentification: {
          ...prevData.productIdentification,
          productImage: data.publicUrl
        }
      }));
      
      setUploading(false);
    } catch (error) {
      console.error('Error uploading product image:', error);
      setUploadError('Failed to upload product image. Please try again.');
      setUploading(false);
    }
  };
  
  return (
    <div className="card spec-sheet-section">
      <div className="card-header spec-sheet-section-header">
        <h2 className="spec-sheet-section-title">Product Identification</h2>
      </div>
      
      <div className="card-body">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="productName" className="form-label">Product Name</label>
            <input
              type="text"
              id="productName"
              name="productName"
              className="form-control"
              value={specSheetData.productIdentification.productName || ''}
              onChange={handleInputChange}
              placeholder="Enter product name"
            />
          </div>
        </div>
        
        <div className="form-row d-flex">
          <div className="form-group mr-3" style={{ flex: 1 }}>
            <label htmlFor="skuId" className="form-label">SKU ID</label>
            <input
              type="text"
              id="skuId"
              name="skuId"
              className="form-control"
              value={specSheetData.productIdentification.skuId || ''}
              onChange={handleInputChange}
              placeholder="Enter SKU ID"
            />
          </div>
          
          <div className="form-group mr-3" style={{ flex: 1 }}>
            <label htmlFor="bomId" className="form-label">BOM ID</label>
            <input
              type="text"
              id="bomId"
              name="bomId"
              className="form-control"
              value={specSheetData.productIdentification.bomId || ''}
              onChange={handleInputChange}
              placeholder="Enter BOM ID"
            />
          </div>
          
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="wipId" className="form-label">WIP ID</label>
            <input
              type="text"
              id="wipId"
              name="wipId"
              className="form-control"
              value={specSheetData.productIdentification.wipId || ''}
              onChange={handleInputChange}
              placeholder="Enter WIP ID"
            />
          </div>
        </div>
        
        <div className="form-row d-flex">
          <div className="form-group mr-3" style={{ flex: 1 }}>
            <label htmlFor="specRevision" className="form-label">Spec Revision</label>
            <input
              type="text"
              id="specRevision"
              name="specRevision"
              className="form-control"
              value={specSheetData.productIdentification.specRevision || ''}
              onChange={handleInputChange}
              placeholder="Enter Spec Revision"
            />
          </div>
          
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="intendedUse" className="form-label">Intended Use</label>
            <select
              id="intendedUse"
              name="intendedUse"
              className="form-control"
              value={specSheetData.productIdentification.intendedUse || 'Retail'}
              onChange={handleInputChange}
            >
              <option value="Retail">Retail</option>
              <option value="Ingredient">Ingredient</option>
              <option value="Inclusion">Inclusion</option>
            </select>
          </div>
        </div>
        
        <div className="form-row d-flex align-items-end">
          <div className="form-group mr-3" style={{ flex: 2 }}>
            <label htmlFor="netWeight" className="form-label">Unit Claim Weight</label>
            <input
              type="number"
              id="netWeight"
              name="netWeight"
              className="form-control"
              value={specSheetData.productIdentification.netWeight || ''}
              onChange={handleInputChange}
              placeholder="Enter weight"
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="weightUnit" className="form-label">Unit</label>
            <select
              id="weightUnit"
              name="weightUnit"
              className="form-control"
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
        
        <div className="form-row d-flex">
          <div className="form-group mr-3" style={{ flex: 1 }}>
            <label htmlFor="unitsPerCase" className="form-label">Units per Case (ea)</label>
            <input
              type="number"
              id="unitsPerCase"
              name="unitsPerCase"
              className="form-control"
              value={specSheetData.productIdentification.unitsPerCase || ''}
              onChange={handleInputChange}
              placeholder="Enter units per case"
              min="0"
              step="1"
            />
          </div>
          
          <div className="form-group mr-3" style={{ flex: 1 }}>
            <label htmlFor="casesPerPallet" className="form-label">Cases per Pallet (ea)</label>
            <input
              type="number"
              id="casesPerPallet"
              name="casesPerPallet"
              className="form-control"
              value={specSheetData.productIdentification.casesPerPallet || ''}
              onChange={handleInputChange}
              placeholder="Enter cases per pallet"
              min="0"
              step="1"
            />
          </div>
          
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="unitsPerPallet" className="form-label">Units per Pallet (ea)</label>
            <input
              type="number"
              id="unitsPerPallet"
              name="unitsPerPallet"
              className="form-control"
              value={specSheetData.productIdentification.unitsPerPallet || ''}
              readOnly
              placeholder="Calculated automatically"
            />
          </div>
        </div>
        
        <div className="form-row d-flex">
          <div className="form-group mr-3" style={{ flex: 1 }}>
            <label htmlFor="unitUpc" className="form-label">Unit UPC</label>
            <input
              type="text"
              id="unitUpc"
              name="unitUpc"
              className="form-control"
              value={specSheetData.productIdentification.unitUpc || ''}
              onChange={handleInputChange}
              placeholder="Enter unit UPC"
            />
          </div>
          
          <div className="form-group mr-3" style={{ flex: 1 }}>
            <label htmlFor="caseUpc" className="form-label">Case UPC</label>
            <input
              type="text"
              id="caseUpc"
              name="caseUpc"
              className="form-control"
              value={specSheetData.productIdentification.caseUpc || ''}
              onChange={handleInputChange}
              placeholder="Enter case UPC"
            />
          </div>
          
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="palletUpc" className="form-label">Pallet UPC</label>
            <input
              type="text"
              id="palletUpc"
              name="palletUpc"
              className="form-control"
              value={specSheetData.productIdentification.palletUpc || ''}
              onChange={handleInputChange}
              placeholder="Enter pallet UPC"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="lotCodeFormat" className="form-label">Lot Code Format</label>
            <input
              type="text"
              id="lotCodeFormat"
              name="lotCodeFormat"
              className="form-control"
              value={specSheetData.productIdentification.lotCodeFormat || ''}
              onChange={handleInputChange}
              placeholder="Enter lot code format"
            />
          </div>
        </div>
        
        <div className="form-row d-flex">
          <div className="form-group mr-3" style={{ flex: 1 }}>
            <label htmlFor="shelfLifeYears" className="form-label">Shelf Life (Years)</label>
            <select
              id="shelfLifeYears"
              name="shelfLifeYears"
              className="form-control"
              value={specSheetData.productIdentification.shelfLifeYears || '0'}
              onChange={handleInputChange}
            >
              {[...Array(6).keys()].map(year => (
                <option key={year} value={year.toString()}>{year}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="shelfLifeMonths" className="form-label">Shelf Life (Months)</label>
            <select
              id="shelfLifeMonths"
              name="shelfLifeMonths"
              className="form-control"
              value={specSheetData.productIdentification.shelfLifeMonths || '0'}
              onChange={handleInputChange}
            >
              {[...Array(12).keys()].map(month => (
                <option key={month} value={month.toString()}>{month}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Product Image</label>
            
            <div className="product-image-container">
              {specSheetData.productIdentification.productImage ? (
                <div className="product-image-preview">
                  <img 
                    src={specSheetData.productIdentification.productImage} 
                    alt="Product" 
                    className="product-image"
                    style={{ maxWidth: '200px', maxHeight: '200px' }}
                  />
                  <button
                    type="button"
                    className="btn btn-danger btn-sm mt-2"
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
                    Remove Image
                  </button>
                </div>
              ) : (
                <div className="product-image-upload">
                  <label htmlFor="product-image-upload" className="btn btn-secondary">
                    {uploading ? 'Uploading...' : 'Upload Product Image'}
                  </label>
                  <input
                    type="file"
                    id="product-image-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    disabled={uploading}
                  />
                  <p className="text-muted mt-2">
                    Upload a product image (JPG, PNG, GIF, max 5MB)
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

export default ProductIdentification;
