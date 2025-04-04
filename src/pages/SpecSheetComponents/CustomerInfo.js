import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faUpload, faImage, faTrash, faSpinner, faCheck } from '@fortawesome/free-solid-svg-icons';

const CustomerInfo = ({ specSheetData, setSpecSheetData }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
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

  const handleLogoUpload = async (e) => {
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
      const { data, error } = await supabase.storage
        .from('spec-sheet-assets')
        .upload(`logos/${fileName}`, file);
        
      if (error) throw error;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('spec-sheet-assets')
        .getPublicUrl(`logos/${fileName}`);
      
      // Update the spec sheet data
      setSpecSheetData(prevData => ({
        ...prevData,
        customerInfo: {
          ...prevData.customerInfo,
          logo: publicUrlData.publicUrl
        }
      }));
    } catch (error) {
      console.error('Error uploading logo:', error);
      setUploadError('Error uploading logo. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  const handleRemoveLogo = () => {
    setSpecSheetData(prevData => ({
      ...prevData,
      customerInfo: {
        ...prevData.customerInfo,
        logo: ''
      }
    }));
  };

  return (
    <div className="spec-sheet-section">
      <div className="section-header">
        <FontAwesomeIcon icon={faBuilding} className="section-icon" />
        <h2>Customer Information</h2>
      </div>
      <div className="section-content">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="companyName">Company Name</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={specSheetData.customerInfo.companyName || ''}
              onChange={handleInputChange}
              placeholder="Enter company name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="contactName">Contact Name</label>
            <input
              type="text"
              id="contactName"
              name="contactName"
              value={specSheetData.customerInfo.contactName || ''}
              onChange={handleInputChange}
              placeholder="Enter contact name"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={specSheetData.customerInfo.email || ''}
              onChange={handleInputChange}
              placeholder="Enter email address"
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={specSheetData.customerInfo.phone || ''}
              onChange={handleInputChange}
              placeholder="Enter phone number"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={specSheetData.customerInfo.address || ''}
              onChange={handleInputChange}
              placeholder="Enter company address"
              rows="3"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <div className="file-upload">
              <label className="file-upload-label">Company Logo</label>
              <label className="file-upload-input">
                <FontAwesomeIcon icon={faUpload} /> 
                <span>Click or drag to upload logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ display: 'none' }}
                />
              </label>
              {uploadError && <div className="error-message">{uploadError}</div>}
            </div>
            
            {specSheetData.customerInfo.logo ? (
              <div className="image-preview-container">
                <div className="logo-preview">
                  <img src={specSheetData.customerInfo.logo} alt="Company Logo" />
                  
                  {uploading && (
                    <div className="uploading-overlay">
                      <div className="uploading-spinner"></div>
                      <div className="uploading-text">Uploading...</div>
                    </div>
                  )}
                  
                  <div className="image-actions">
                    <button 
                      className="image-action-button delete" 
                      onClick={handleRemoveLogo}
                      title="Remove Logo"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
                <div className="image-caption">Company Logo</div>
              </div>
            ) : (
              <div className="image-preview-container">
                <div className="image-placeholder">
                  <FontAwesomeIcon icon={faImage} />
                  <span>No logo uploaded</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfo;
