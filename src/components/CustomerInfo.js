import React, { useState, useContext } from 'react';
import { SpecSheetContext } from '../context/SpecSheetContext';
import { supabase, STORAGE_BUCKETS, uploadFile } from '../supabaseClient';

const CustomerInfo = () => {
  const { specSheetData, setSpecSheetData } = useContext(SpecSheetContext);
  const [uploading, setUploading] = useState(false);
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
  
  // Handle logo upload
  const handleLogoUpload = async (e) => {
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
        STORAGE_BUCKETS.CUSTOMER_LOGOS
      );
      
      if (error) {
        throw error;
      }
      
      // Update spec sheet data with logo URL
      setSpecSheetData(prevData => ({
        ...prevData,
        customerInfo: {
          ...prevData.customerInfo,
          logo: data.publicUrl
        }
      }));
      
      setUploading(false);
    } catch (error) {
      console.error('Error uploading logo:', error);
      setUploadError('Failed to upload logo. Please try again.');
      setUploading(false);
    }
  };
  
  return (
    <div className="card spec-sheet-section">
      <div className="card-header spec-sheet-section-header">
        <h2 className="spec-sheet-section-title">Customer Information</h2>
      </div>
      
      <div className="card-body">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="companyName" className="form-label">Company Name</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              className="form-control"
              value={specSheetData.customerInfo.companyName || ''}
              onChange={handleInputChange}
              placeholder="Enter company name"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="companyAddress" className="form-label">Company Address</label>
            <textarea
              id="companyAddress"
              name="companyAddress"
              className="form-control"
              value={specSheetData.customerInfo.companyAddress || ''}
              onChange={handleInputChange}
              placeholder="Enter company address"
              rows="3"
            ></textarea>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="contactName" className="form-label">Contact Name</label>
            <input
              type="text"
              id="contactName"
              name="contactName"
              className="form-control"
              value={specSheetData.customerInfo.contactName || ''}
              onChange={handleInputChange}
              placeholder="Enter contact name"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={specSheetData.customerInfo.email || ''}
              onChange={handleInputChange}
              placeholder="Enter email address"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone" className="form-label">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="form-control"
              value={specSheetData.customerInfo.phone || ''}
              onChange={handleInputChange}
              placeholder="Enter phone number"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Company Logo</label>
            
            <div className="logo-upload-container">
              {specSheetData.customerInfo.logo ? (
                <div className="logo-preview">
                  <img 
                    src={specSheetData.customerInfo.logo} 
                    alt="Company Logo" 
                    className="logo-image"
                  />
                  <button
                    type="button"
                    className="btn btn-danger btn-sm mt-2"
                    onClick={() => {
                      setSpecSheetData(prevData => ({
                        ...prevData,
                        customerInfo: {
                          ...prevData.customerInfo,
                          logo: null
                        }
                      }));
                    }}
                  >
                    Remove Logo
                  </button>
                </div>
              ) : (
                <div className="logo-upload">
                  <label htmlFor="logo-upload" className="btn btn-secondary">
                    {uploading ? 'Uploading...' : 'Upload Logo'}
                  </label>
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    style={{ display: 'none' }}
                    disabled={uploading}
                  />
                  <p className="text-muted mt-2">
                    Upload a company logo (JPG, PNG, GIF, max 5MB)
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

export default CustomerInfo;
