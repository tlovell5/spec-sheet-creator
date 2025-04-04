import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBuilding, 
  faUpload, 
  faImage, 
  faTrash, 
  faSpinner, 
  faCheck, 
  faUser, 
  faEnvelope, 
  faPhone, 
  faMapMarkerAlt 
} from '@fortawesome/free-solid-svg-icons';

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
    <div className="customer-info-container">
      <div className="card-grid">
        <div className="info-card">
          <div className="info-card-title">
            <FontAwesomeIcon icon={faBuilding} />
            Company Details
          </div>
          <div className="form-group">
            <label htmlFor="companyName" className="required-field">Company Name</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={specSheetData.customerInfo.companyName || ''}
              onChange={handleInputChange}
              placeholder="Enter company name"
            />
            <span className="field-help">The official name of the customer's company</span>
          </div>
          
          <div className="form-group">
            <label htmlFor="industry">Industry</label>
            <select
              id="industry"
              name="industry"
              value={specSheetData.customerInfo.industry || ''}
              onChange={handleInputChange}
            >
              <option value="">Select Industry</option>
              <option value="Food & Beverage">Food & Beverage</option>
              <option value="Cosmetics">Cosmetics</option>
              <option value="Pharmaceuticals">Pharmaceuticals</option>
              <option value="Nutraceuticals">Nutraceuticals</option>
              <option value="Chemicals">Chemicals</option>
              <option value="Other">Other</option>
            </select>
            <span className="field-help">Select the industry this customer operates in</span>
          </div>
        </div>
        
        <div className="info-card">
          <div className="info-card-title">
            <FontAwesomeIcon icon={faUser} />
            Contact Person
          </div>
          <div className="form-group">
            <label htmlFor="contactName" className="required-field">Contact Name</label>
            <input
              type="text"
              id="contactName"
              name="contactName"
              value={specSheetData.customerInfo.contactName || ''}
              onChange={handleInputChange}
              placeholder="Enter contact person's name"
            />
            <span className="field-help">The primary point of contact at the company</span>
          </div>
          
          <div className="form-group">
            <label htmlFor="position">Position</label>
            <input
              type="text"
              id="position"
              name="position"
              value={specSheetData.customerInfo.position || ''}
              onChange={handleInputChange}
              placeholder="Enter contact's position"
            />
            <span className="field-help">Job title or role of the contact person</span>
          </div>
        </div>
      </div>
      
      <div className="card-grid">
        <div className="info-card">
          <div className="info-card-title">
            <FontAwesomeIcon icon={faEnvelope} />
            Contact Information
          </div>
          <div className="form-group">
            <label htmlFor="email" className="required-field">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={specSheetData.customerInfo.email || ''}
              onChange={handleInputChange}
              placeholder="Enter email address"
            />
            <span className="field-help">Primary email for communications</span>
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
            <span className="field-help">Best contact number</span>
          </div>
        </div>
        
        <div className="info-card">
          <div className="info-card-title">
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            Address
          </div>
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
            <span className="field-help">Full company address including city, state, and zip code</span>
          </div>
        </div>
      </div>
      
      <div className="info-card">
        <div className="info-card-title">
          <FontAwesomeIcon icon={faImage} />
          Company Logo
        </div>
        
        {!specSheetData.customerInfo.logo ? (
          <div 
            className="image-upload-area"
            onClick={() => document.getElementById('logoUpload').click()}
          >
            <FontAwesomeIcon icon={faUpload} className="image-upload-icon" />
            <p>Click to upload company logo</p>
            <p className="field-help">Recommended size: 300x150px, Max size: 5MB</p>
            <p className="field-help">Supported formats: JPG, PNG, GIF</p>
            <input
              type="file"
              id="logoUpload"
              accept="image/*"
              onChange={handleLogoUpload}
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
          <div className="logo-preview-container">
            <img 
              src={specSheetData.customerInfo.logo} 
              alt="Company Logo" 
              className="image-preview"
            />
            <button 
              className="action-button danger"
              onClick={handleRemoveLogo}
            >
              <FontAwesomeIcon icon={faTrash} />
              Remove Logo
            </button>
          </div>
        )}
      </div>
      
      <div className="info-card">
        <div className="info-card-title">
          <FontAwesomeIcon icon={faCheck} />
          Additional Information
        </div>
        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={specSheetData.customerInfo.notes || ''}
            onChange={handleInputChange}
            placeholder="Enter any additional notes about this customer"
            rows="4"
          />
          <span className="field-help">Any special considerations or important details about this customer</span>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfo;
