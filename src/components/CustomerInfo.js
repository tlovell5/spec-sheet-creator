import React, { useState, useContext } from 'react';
import { SpecSheetContext } from '../context/SpecSheetContext';
import { supabase, STORAGE_BUCKETS, uploadFile } from '../supabaseClient';
import { SectionContainer, FormInput, FileUpload } from './common';

const CustomerInfo = () => {
  const { specSheetData, setSpecSheetData } = useContext(SpecSheetContext);
  const [uploadError, setUploadError] = useState(null);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setSpecSheetData(prevData => ({
      ...prevData,
      customerInfo: {
        ...prevData.customerInfo,
        [name]: value
      }
    }));
  };
  
  // Handle logo URL update
  const handleLogoChange = (url) => {
    setSpecSheetData(prevData => ({
      ...prevData,
      customerInfo: {
        ...prevData.customerInfo,
        logo: url
      }
    }));
  };
  
  return (
    <SectionContainer id="customerInfo" title="Customer Information">
      <div className="form-row">
        <div className="form-col">
          <FormInput
            label="Company Name"
            id="companyName"
            name="companyName"
            value={specSheetData.customerInfo.companyName || ''}
            onChange={handleInputChange}
            placeholder="Enter company name"
            required
          />
        </div>
        
        <div className="form-col">
          <FormInput
            label="Contact Name"
            id="contactName"
            name="contactName"
            value={specSheetData.customerInfo.contactName || ''}
            onChange={handleInputChange}
            placeholder="Enter contact name"
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-col">
          <FormInput
            label="Contact Email"
            id="contactEmail"
            name="contactEmail"
            type="email"
            value={specSheetData.customerInfo.contactEmail || ''}
            onChange={handleInputChange}
            placeholder="Enter contact email"
          />
        </div>
        
        <div className="form-col">
          <FormInput
            label="Contact Phone"
            id="contactPhone"
            name="contactPhone"
            value={specSheetData.customerInfo.contactPhone || ''}
            onChange={handleInputChange}
            placeholder="Enter contact phone"
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-col">
          <FormInput
            label="Address"
            id="address"
            name="address"
            value={specSheetData.customerInfo.address || ''}
            onChange={handleInputChange}
            placeholder="Enter address"
          />
        </div>
        
        <div className="form-col">
          <FormInput
            label="City"
            id="city"
            name="city"
            value={specSheetData.customerInfo.city || ''}
            onChange={handleInputChange}
            placeholder="Enter city"
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-col-third">
          <FormInput
            label="State/Province"
            id="state"
            name="state"
            value={specSheetData.customerInfo.state || ''}
            onChange={handleInputChange}
            placeholder="Enter state/province"
          />
        </div>
        
        <div className="form-col-third">
          <FormInput
            label="Zip/Postal Code"
            id="zipCode"
            name="zipCode"
            value={specSheetData.customerInfo.zipCode || ''}
            onChange={handleInputChange}
            placeholder="Enter zip/postal code"
          />
        </div>
        
        <div className="form-col-third">
          <FormInput
            label="Country"
            id="country"
            name="country"
            value={specSheetData.customerInfo.country || ''}
            onChange={handleInputChange}
            placeholder="Enter country"
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-col">
          <FileUpload
            bucketName={STORAGE_BUCKETS.CUSTOMER_LOGOS}
            label="Company Logo"
            value={specSheetData.customerInfo.logo || ''}
            onChange={handleLogoChange}
            accept="image/*"
            fileNamePrefix="logo-"
            error={uploadError}
          />
        </div>
        
        <div className="form-col">
          <FormInput
            label="Website"
            id="website"
            name="website"
            value={specSheetData.customerInfo.website || ''}
            onChange={handleInputChange}
            placeholder="Enter website URL"
          />
        </div>
      </div>
    </SectionContainer>
  );
};

export default CustomerInfo;
