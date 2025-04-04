import React, { useState, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignature, faUpload, faTrash, faPen, faEnvelope, faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';

function Signatures({ specSheetId }) {
  const [signatures, setSignatures] = useState({
    customer: { role: 'Customer', signed_by: '', signature_image_url: '', signed_at: null },
    quality_manager: { role: 'Quality Manager', signed_by: '', signature_image_url: '', signed_at: null },
    production_manager: { role: 'Production Manager', signed_by: '', signature_image_url: '', signed_at: null }
  });
  
  const [uploading, setUploading] = useState({
    customer: false,
    quality_manager: false,
    production_manager: false
  });
  
  const [signatureIds, setSignatureIds] = useState({
    customer: null,
    quality_manager: null,
    production_manager: null
  });

  const [uploadError, setUploadError] = useState('');
  const [requestStatus, setRequestStatus] = useState('');
  const emailInputRef = useRef(null);
  
  const handleInputChange = (e, role) => {
    const { name, value } = e.target;
    setSignatures(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [name]: value
      }
    }));
  };

  const handleSignatureUpload = async (e, role) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    const fileExt = file.name.split('.').pop();
    const allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
    if (!allowedTypes.includes(fileExt.toLowerCase())) {
      setUploadError('Invalid file type. Please upload an image file (jpg, jpeg, png, gif).');
      return;
    }
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('File size too large. Maximum size is 2MB.');
      return;
    }
    
    setUploading(prev => ({ ...prev, [role]: true }));
    setUploadError('');
    
    try {
      // Create a unique filename
      const fileName = `${Date.now()}-${role}-${file.name}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('spec-sheet-assets')
        .upload(`signatures/${fileName}`, file);
        
      if (error) throw error;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('spec-sheet-assets')
        .getPublicUrl(`signatures/${fileName}`);
      
      // Update the signature URL and timestamp
      const now = new Date().toISOString();
      handleInputChange({ target: { name: 'signature_image_url', value: publicUrlData.publicUrl } }, role);
      handleInputChange({ target: { name: 'signed_at', value: now } }, role);
      
      // Save to database
      await saveSignature(role);
    } catch (error) {
      console.error('Error uploading signature:', error);
      setUploadError('Error uploading signature. Please try again.');
    } finally {
      setUploading(prev => ({ ...prev, [role]: false }));
    }
  };
  
  const handleRemoveSignature = (role) => {
    setSignatures(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        signature_image_url: '',
        signed_at: ''
      }
    }));
  };
  
  const handleRequestSignature = async (role) => {
    const email = emailInputRef.current?.value;
    if (!email) {
      setRequestStatus('Please enter an email address.');
      return;
    }
    
    setRequestStatus('');
    
    try {
      // Here you would implement the email request logic
      // For now, we'll just simulate a successful request
      
      // Update the signature data to indicate a pending signature
      setSignatures(prev => ({
        ...prev,
        [role]: {
          ...prev[role],
          requestSent: true,
          requestDate: new Date().toISOString().split('T')[0],
          requestEmail: email
        }
      }));
      
      setRequestStatus('Signature request sent successfully!');
      
      // Clear the email input
      if (emailInputRef.current) {
        emailInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error sending signature request:', error);
      setRequestStatus('Error sending signature request. Please try again.');
    }
  };

  // Fetch signatures when component mounts
  const fetchSignatures = async () => {
    if (!specSheetId) return;
    
    const { data, error } = await supabase
      .from('signatures')
      .select('*')
      .eq('spec_sheet_id', specSheetId);
    
    if (error) {
      console.error('Error fetching signatures:', error);
      return;
    }
    
    if (data && data.length > 0) {
      // Process signatures by role
      const updatedSignatures = { ...signatures };
      const updatedIds = { ...signatureIds };
      
      data.forEach(sig => {
        switch (sig.role) {
          case 'Customer':
            updatedSignatures.customer = sig;
            updatedIds.customer = sig.id;
            break;
          case 'Quality Manager':
            updatedSignatures.quality_manager = sig;
            updatedIds.quality_manager = sig.id;
            break;
          case 'Production Manager':
            updatedSignatures.production_manager = sig;
            updatedIds.production_manager = sig.id;
            break;
          default:
            break;
        }
      });
      
      setSignatures(updatedSignatures);
      setSignatureIds(updatedIds);
    }
  };

  // Save signature to database
  const saveSignature = async (role) => {
    if (!specSheetId) return;
    
    const signature = {
      ...signatures[role],
      spec_sheet_id: specSheetId
    };
    
    // If we have an ID, update the record, otherwise insert a new one
    if (signatureIds[role]) {
      const { error } = await supabase
        .from('signatures')
        .update(signature)
        .eq('id', signatureIds[role]);
      
      if (error) {
        console.error(`Error updating ${role} signature:`, error);
      }
    } else {
      const { data, error } = await supabase
        .from('signatures')
        .insert([signature])
        .select();
      
      if (error) {
        console.error(`Error saving ${role} signature:`, error);
      } else if (data && data.length > 0) {
        // Store the new ID
        setSignatureIds(prev => ({
          ...prev,
          [role]: data[0].id
        }));
        
        // Log the signature activity
        await supabase
          .from('activity_logs')
          .insert([{
            spec_sheet_id: specSheetId,
            user_id: 'current_user', // Replace with actual user ID
            action: 'SIGNED',
            notes: `${signature.role} signed the spec sheet`
          }]);
        
        // If all roles have signed, update the spec sheet status to Approved
        checkAllSignatures();
      }
    }
  };

  // Check if all required signatures are present
  const checkAllSignatures = async () => {
    const allSigned = 
      signatures.customer.signature_image_url && 
      signatures.quality_manager.signature_image_url && 
      signatures.production_manager.signature_image_url;
    
    if (allSigned) {
      // Update spec sheet status to Approved
      const { error } = await supabase
        .from('spec_sheets')
        .update({ status: 'Approved' })
        .eq('id', specSheetId);
      
      if (error) {
        console.error('Error updating spec sheet status:', error);
      } else {
        // Log the approval
        await supabase
          .from('activity_logs')
          .insert([{
            spec_sheet_id: specSheetId,
            user_id: 'current_user', // Replace with actual user ID
            action: 'APPROVED',
            notes: 'Spec sheet approved with all required signatures'
          }]);
      }
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not signed';
    
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderSignatureBlock = (role, title) => {
    const signatureData = signatures[role];
    
    return (
      <div className="signature-item">
        <div className="signature-header">{title}</div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor={`${role}-name`}>Name</label>
            <input
              type="text"
              id={`${role}-name`}
              name="signed_by"
              value={signatureData.signed_by || ''}
              onChange={(e) => handleInputChange(e, role)}
              placeholder="Enter name"
            />
          </div>
          <div className="form-group">
            <label>Date Signed</label>
            <div>{formatDate(signatureData.signed_at)}</div>
          </div>
        </div>
        
        {signatureData.signature_image_url ? (
          <div className="image-preview-container">
            <div className="signature-preview">
              <img src={signatureData.signature_image_url} alt={`${title} Signature`} />
              
              {uploading[role] && (
                <div className="uploading-overlay">
                  <div className="uploading-spinner"></div>
                  <div className="uploading-text">Uploading...</div>
                </div>
              )}
              
              <div className="image-actions">
                <button 
                  className="image-action-button delete" 
                  onClick={() => handleRemoveSignature(role)}
                  title="Remove Signature"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
            <div className="image-caption">
              Signed on {new Date(signatureData.signed_at).toLocaleDateString()}
            </div>
          </div>
        ) : (
          <div className="signature-actions">
            <div className="file-upload">
              <label className="file-upload-input">
                <FontAwesomeIcon icon={faPen} /> 
                <span>Upload signature</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleSignatureUpload(e, role)}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            
            <div className="signature-request">
              <div className="request-form">
                <input
                  type="email"
                  ref={emailInputRef}
                  placeholder="Enter email to request signature"
                  className="form-control"
                />
                <button 
                  className="btn btn-primary" 
                  onClick={() => handleRequestSignature(role)}
                  disabled={false}
                >
                  <FontAwesomeIcon icon={faEnvelope} /> Request Signature
                </button>
              </div>
              {requestStatus && <div className="request-status">{requestStatus}</div>}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="signatures-container">
      <p className="signatures-info">
        All required signatures must be collected before the spec sheet can be approved.
      </p>
      
      <div className="signature-container">
        {renderSignatureBlock('customer', 'Customer Signature')}
        {renderSignatureBlock('quality_manager', 'Quality Manager Signature')}
        {renderSignatureBlock('production_manager', 'Production Manager Signature')}
      </div>
    </div>
  );
}

export default Signatures;
