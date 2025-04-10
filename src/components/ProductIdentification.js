import React, { useState, useContext, useEffect } from 'react';
import { SpecSheetContext } from '../context/SpecSheetContext';
import { STORAGE_BUCKETS } from '../supabaseClient';
import { SectionContainer, FormInput, FormSelect, FileUpload } from './common';

const ProductIdentification = () => {
  const { specSheetData, setSpecSheetData } = useContext(SpecSheetContext);
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
  
  // Weight unit options
  const weightUnitOptions = [
    { value: 'g', label: 'Grams (g)' },
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'oz', label: 'Ounces (oz)' },
    { value: 'lbs', label: 'Pounds (lbs)' }
  ];
  
  return (
    <SectionContainer id="productIdentification" title="Product Identification">
      <div className="form-row">
        <div className="form-col">
          <FormInput
            label="Product Name"
            id="productName"
            name="productName"
            value={specSheetData.productIdentification.productName || ''}
            onChange={handleInputChange}
            placeholder="Enter product name"
            required
          />
        </div>
        
        <div className="form-col">
          <FormInput
            label="Product Code"
            id="productCode"
            name="productCode"
            value={specSheetData.productIdentification.productCode || ''}
            onChange={handleInputChange}
            placeholder="Enter product code"
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-col">
          <FormInput
            label="UPC"
            id="upc"
            name="upc"
            value={specSheetData.productIdentification.upc || ''}
            onChange={handleInputChange}
            placeholder="Enter UPC"
          />
        </div>
        
        <div className="form-col">
          <FormInput
            label="SKU"
            id="sku"
            name="sku"
            value={specSheetData.productIdentification.sku || ''}
            onChange={handleInputChange}
            placeholder="Enter SKU"
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-col-third">
          <FormInput
            label="Net Weight"
            id="netWeight"
            name="netWeight"
            type="number"
            value={specSheetData.productIdentification.netWeight || ''}
            onChange={handleInputChange}
            placeholder="Enter net weight"
          />
        </div>
        
        <div className="form-col-third">
          <FormSelect
            label="Net Weight Unit"
            id="netWeightUnit"
            name="netWeightUnit"
            options={weightUnitOptions}
            value={specSheetData.productIdentification.netWeightUnit || ''}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="form-col-third">
          <FormInput
            label="Gross Weight"
            id="grossWeight"
            name="grossWeight"
            type="number"
            value={specSheetData.productIdentification.grossWeight || ''}
            onChange={handleInputChange}
            placeholder="Enter gross weight"
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-col-third">
          <FormSelect
            label="Gross Weight Unit"
            id="grossWeightUnit"
            name="grossWeightUnit"
            options={weightUnitOptions}
            value={specSheetData.productIdentification.grossWeightUnit || ''}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="form-col-third">
          <FormInput
            label="Packaging Claim Weight"
            id="packagingClaimWeight"
            name="packagingClaimWeight"
            type="number"
            value={specSheetData.productIdentification.packagingClaimWeight || ''}
            onChange={handleInputChange}
            placeholder="Enter packaging claim weight"
          />
        </div>
        
        <div className="form-col-third">
          <FormSelect
            label="Packaging Claim Weight Unit"
            id="packagingClaimWeightUnit"
            name="packagingClaimWeightUnit"
            options={weightUnitOptions}
            value={specSheetData.productIdentification.packagingClaimWeightUnit || ''}
            onChange={handleInputChange}
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-col-third">
          <FormInput
            label="Units Per Case"
            id="unitsPerCase"
            name="unitsPerCase"
            type="number"
            value={specSheetData.productIdentification.unitsPerCase || ''}
            onChange={handleInputChange}
            placeholder="Enter units per case"
          />
        </div>
        
        <div className="form-col-third">
          <FormInput
            label="Cases Per Pallet"
            id="casesPerPallet"
            name="casesPerPallet"
            type="number"
            value={specSheetData.productIdentification.casesPerPallet || ''}
            onChange={handleInputChange}
            placeholder="Enter cases per pallet"
          />
        </div>
        
        <div className="form-col-third">
          <FormInput
            label="Units Per Pallet"
            id="unitsPerPallet"
            name="unitsPerPallet"
            type="number"
            value={specSheetData.productIdentification.unitsPerPallet || ''}
            onChange={handleInputChange}
            placeholder="Auto-calculated"
            inputProps={{ readOnly: true }}
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-col">
          <FileUpload
            bucketName={STORAGE_BUCKETS.PRODUCT_IMAGES}
            label="Product Image"
            value={specSheetData.productIdentification.productImage || ''}
            onChange={handleImageChange}
            accept="image/*"
            fileNamePrefix="product-"
            error={uploadError}
          />
        </div>
        
        <div className="form-col">
          <FormInput
            label="Product Description"
            id="productDescription"
            name="productDescription"
            value={specSheetData.productIdentification.productDescription || ''}
            onChange={handleInputChange}
            placeholder="Enter product description"
          />
        </div>
      </div>
    </SectionContainer>
  );
};

export default ProductIdentification;
