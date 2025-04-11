import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import LoadingSpinner from './LoadingSpinner';

/**
 * Reusable file upload component that works with Supabase storage
 * @param {Object} props - Component props
 * @param {string} props.bucketName - Supabase storage bucket name
 * @param {string} props.label - Input label
 * @param {string} props.value - Current file URL
 * @param {function} props.onChange - Function called when file is uploaded (receives URL)
 * @param {string} props.accept - Accepted file types (e.g., "image/*")
 * @param {boolean} props.required - Whether the file is required
 * @param {string} props.error - Error message
 * @param {string} props.className - Additional CSS class
 * @param {string} props.fileNamePrefix - Prefix for uploaded file names
 * @param {string} props.size - Component size (sm, md, lg)
 */
const FileUpload = ({
  bucketName,
  label,
  value,
  onChange,
  accept = "image/*",
  required = false,
  error,
  className = '',
  fileNamePrefix = '',
  size = 'md'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [fileName, setFileName] = useState('');
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setFileName(file.name);
    setIsUploading(true);
    setUploadError('');
    
    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const uniqueName = `${fileNamePrefix}${Date.now()}.${fileExt}`;
      
      // Upload file to Supabase
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(uniqueName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        throw error;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);
      
      // Call onChange with the public URL
      onChange(publicUrl);
    } catch (error) {
      console.error(`Error uploading file to ${bucketName}:`, error);
      setUploadError(`Error uploading file: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleRemoveFile = async () => {
    if (!value) return;
    
    try {
      // Extract file path from URL
      const url = new URL(value);
      const pathMatch = url.pathname.match(new RegExp(`${bucketName}/(.*)`));
      
      if (pathMatch && pathMatch[1]) {
        const filePath = pathMatch[1];
        
        // Delete file from Supabase
        const { error } = await supabase.storage
          .from(bucketName)
          .remove([filePath]);
        
        if (error) {
          throw error;
        }
      }
      
      // Clear the value
      onChange('');
      setFileName('');
    } catch (error) {
      console.error(`Error removing file from ${bucketName}:`, error);
      setUploadError(`Error removing file: ${error.message || 'Unknown error'}`);
    }
  };
  
  const displayError = error || uploadError;
  const isInvalid = !!displayError;
  
  return (
    <div className={`form-group compact compact-file-upload ${className}`}>
      {label && (
        <label className="form-label file-upload-label">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      
      <div className={`file-upload-container ${isInvalid ? 'is-invalid' : ''}`}>
        {value ? (
          <div className="file-upload-preview">
            {accept.includes('image/') ? (
              <div className="preview-with-controls">
                <img 
                  src={value} 
                  alt="Preview" 
                  className="file-preview-image" 
                />
                <button 
                  type="button" 
                  className="btn btn-sm btn-danger file-remove-btn" 
                  onClick={handleRemoveFile}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="file-info-with-controls">
                <span className="file-name">{fileName || 'Uploaded file'}</span>
                <button 
                  type="button" 
                  className="btn btn-sm btn-danger" 
                  onClick={handleRemoveFile}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="file-upload-input">
            <input
              type="file"
              accept={accept}
              onChange={handleFileChange}
              required={required}
              disabled={isUploading}
              className="file-input"
              id={`file-upload-${label?.toLowerCase().replace(/\s+/g, '-')}`}
            />
            <label 
              htmlFor={`file-upload-${label?.toLowerCase().replace(/\s+/g, '-')}`}
              className={`file-upload-button btn btn-sm btn-secondary btn-${size}`}
            >
              {isUploading ? (
                <div className="upload-progress">
                  <LoadingSpinner size="small" text="" />
                  <span>Uploading...</span>
                </div>
              ) : (
                <span>Choose a file</span>
              )}
            </label>
          </div>
        )}
      </div>
      
      {isInvalid && <div className="invalid-feedback">{displayError}</div>}
    </div>
  );
};

export default FileUpload;
