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
        .upload(`logos/${fileName}`, file, {
          upsert: true,
          cacheControl: '3600'
        });
        
      if (error) {
        console.error('Error uploading logo:', error);
        throw error;
      }
      
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
      {/* Two-column layout for main customer information */}
      <div className="customer-info-layout">
        {/* Left column: Company details and logo */}
        <div className="customer-info-column">
          <div className="info-card company-card">
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
                className="form-control"
              />
              <span className="field-help">The official name of the customer's company</span>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="industry">Industry</label>
                <select
                  id="industry"
                  name="industry"
                  value={specSheetData.customerInfo.industry || ''}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="">Select Industry</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Cosmetics">Cosmetics</option>
                  <option value="Pharmaceuticals">Pharmaceuticals</option>
                  <option value="Nutraceuticals">Nutraceuticals</option>
                  <option value="Chemicals">Chemicals</option>
                  <option value="Other">Other</option>
                </select>
                <span className="field-help">Industry classification</span>
              </div>
              
              <div className="form-group">
                <label htmlFor="customerType">Customer Type</label>
                <select
                  id="customerType"
                  name="customerType"
                  value={specSheetData.customerInfo.customerType || ''}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="">Select Type</option>
                  <option value="Direct">Direct</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Contract">Contract</option>
                  <option value="Retail">Retail</option>
                </select>
                <span className="field-help">Type of customer relationship</span>
              </div>
            </div>
            
            {/* Logo upload area */}
            <div className="logo-section">
              <div className="section-divider">
                <span>Company Logo</span>
              </div>
              
              {!specSheetData.customerInfo.logo ? (
                <div 
                  className="image-upload-area logo-upload"
                  onClick={() => document.getElementById('logoUpload').click()}
                >
                  <FontAwesomeIcon icon={faUpload} className="image-upload-icon" />
                  <p>Click to upload company logo</p>
                  <p className="field-help">Recommended: 300×150px (Max: 5MB)</p>
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
          </div>
        </div>
        
        {/* Right column: Contact information */}
        <div className="customer-info-column">
          <div className="info-card contact-card">
            <div className="info-card-title">
              <FontAwesomeIcon icon={faUser} />
              Primary Contact
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contactName" className="required-field">Contact Name</label>
                <input
                  type="text"
                  id="contactName"
                  name="contactName"
                  value={specSheetData.customerInfo.contactName || ''}
                  onChange={handleInputChange}
                  placeholder="Enter contact name"
                  className="form-control"
                />
                <span className="field-help">Primary point of contact</span>
              </div>
              
              <div className="form-group">
                <label htmlFor="position">Position</label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={specSheetData.customerInfo.position || ''}
                  onChange={handleInputChange}
                  placeholder="Enter position/title"
                  className="form-control"
                />
                <span className="field-help">Job title or role</span>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email" className="required-field">Email</label>
                <div className="input-with-icon">
                  <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={specSheetData.customerInfo.email || ''}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    className="form-control"
                  />
                </div>
                <span className="field-help">Primary contact email</span>
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <div className="input-with-icon">
                  <FontAwesomeIcon icon={faPhone} className="input-icon" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={specSheetData.customerInfo.phone || ''}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className="form-control"
                  />
                </div>
                <span className="field-help">Best contact number</span>
              </div>
            </div>
            
            <div className="section-divider">
              <span>Company Address</span>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="street">Street Address</label>
                <div className="input-with-icon">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="input-icon" />
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={specSheetData.customerInfo.street || ''}
                    onChange={handleInputChange}
                    placeholder="Enter street address"
                    className="form-control"
                  />
                </div>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={specSheetData.customerInfo.city || ''}
                  onChange={handleInputChange}
                  placeholder="Enter city"
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="state">State/Province</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={specSheetData.customerInfo.state || ''}
                  onChange={handleInputChange}
                  placeholder="Enter state/province"
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="zipCode">Zip/Postal Code</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={specSheetData.customerInfo.zipCode || ''}
                  onChange={handleInputChange}
                  placeholder="Enter zip/postal code"
                  className="form-control"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input
                type="text"
                id="country"
                name="country"
                value={specSheetData.customerInfo.country || ''}
                onChange={handleInputChange}
                placeholder="Enter country"
                className="form-control"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Notes section - full width */}
      <div className="info-card notes-card">
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
            rows="3"
            className="form-control"
          />
          <span className="field-help">Special considerations or important details about this customer</span>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfo;
