import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBlender, faPlus, faTrash, faUpload, faImage, faExternalLinkAlt, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';

const MixInstructions = ({ specSheetData, setSpecSheetData }) => {
  const [uploading, setUploading] = useState(null); // Tracks which step is uploading
  const [uploadError, setUploadError] = useState('');
  
  const handleAddStep = () => {
    setSpecSheetData(prevData => ({
      ...prevData,
      mixInstructions: {
        ...prevData.mixInstructions,
        steps: [
          ...(prevData.mixInstructions.steps || []),
          {
            stepNumber: (prevData.mixInstructions.steps?.length || 0) + 1,
            description: '',
            image: ''
          }
        ]
      }
    }));
  };
  
  const handleRemoveStep = (index) => {
    setSpecSheetData(prevData => {
      const newSteps = [...(prevData.mixInstructions.steps || [])];
      newSteps.splice(index, 1);
      
      // Renumber steps
      newSteps.forEach((step, i) => {
        step.stepNumber = i + 1;
      });
      
      return {
        ...prevData,
        mixInstructions: {
          ...prevData.mixInstructions,
          steps: newSteps
        }
      };
    });
  };
  
  const handleMoveStep = (index, direction) => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === specSheetData.mixInstructions.steps.length - 1)
    ) {
      return;
    }
    
    setSpecSheetData(prevData => {
      const newSteps = [...(prevData.mixInstructions.steps || [])];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      // Swap steps
      [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
      
      // Renumber steps
      newSteps.forEach((step, i) => {
        step.stepNumber = i + 1;
      });
      
      return {
        ...prevData,
        mixInstructions: {
          ...prevData.mixInstructions,
          steps: newSteps
        }
      };
    });
  };
  
  const handleStepChange = (index, field, value) => {
    setSpecSheetData(prevData => {
      const newSteps = [...(prevData.mixInstructions.steps || [])];
      newSteps[index] = {
        ...newSteps[index],
        [field]: value
      };
      
      return {
        ...prevData,
        mixInstructions: {
          ...prevData.mixInstructions,
          steps: newSteps
        }
      };
    });
  };
  
  const handleImageUpload = async (e, index) => {
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
    
    setUploading(index);
    setUploadError('');
    
    try {
      // Create a unique filename
      const fileName = `${Date.now()}-step${index + 1}-${file.name}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('spec-sheet-assets')
        .upload(`mix-instructions/${fileName}`, file);
        
      if (error) throw error;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('spec-sheet-assets')
        .getPublicUrl(`mix-instructions/${fileName}`);
      
      // Update the step image
      handleStepChange(index, 'image', publicUrlData.publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError('Error uploading image. Please try again.');
    } finally {
      setUploading(null);
    }
  };
  
  const handleRemoveImage = (index) => {
    handleStepChange(index, 'image', '');
  };

  return (
    <div className="spec-sheet-section">
      <div className="section-header">
        <FontAwesomeIcon icon={faBlender} className="section-icon" />
        <h2>Mixing Instructions</h2>
      </div>
      <div className="section-content">
        <div className="mix-instructions-container">
          {specSheetData.mixInstructions.steps?.map((step, index) => (
            <div key={index} className="mix-step">
              <div className="step-header">
                <div className="step-number">Step {step.stepNumber}</div>
                <div className="step-actions">
                  <button 
                    className="btn-icon" 
                    onClick={() => handleMoveStep(index, 'up')}
                    disabled={index === 0}
                    title="Move Up"
                  >
                    <FontAwesomeIcon icon={faArrowUp} />
                  </button>
                  <button 
                    className="btn-icon" 
                    onClick={() => handleMoveStep(index, 'down')}
                    disabled={index === specSheetData.mixInstructions.steps.length - 1}
                    title="Move Down"
                  >
                    <FontAwesomeIcon icon={faArrowDown} />
                  </button>
                  <button 
                    className="btn-icon delete" 
                    onClick={() => handleRemoveStep(index)}
                    title="Remove Step"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
              
              <div className="step-content">
                <div className="form-group">
                  <label htmlFor={`step-${index}-description`}>Description</label>
                  <textarea
                    id={`step-${index}-description`}
                    value={step.description || ''}
                    onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                    placeholder="Describe this step..."
                    rows="3"
                  />
                </div>
                
                <div className="form-group">
                  <div className="file-upload">
                    <label className="file-upload-label">Step Image</label>
                    <label className="file-upload-input">
                      <FontAwesomeIcon icon={faUpload} /> 
                      <span>Click or drag to upload image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, index)}
                        style={{ display: 'none' }}
                      />
                    </label>
                    {uploadError && uploading === index && (
                      <div className="error-message">{uploadError}</div>
                    )}
                  </div>
                  
                  {step.image ? (
                    <div className="image-preview-container">
                      <div className="image-preview">
                        <img src={step.image} alt={`Step ${step.stepNumber}`} />
                        
                        {uploading === index && (
                          <div className="uploading-overlay">
                            <div className="uploading-spinner"></div>
                            <div className="uploading-text">Uploading...</div>
                          </div>
                        )}
                        
                        <div className="image-actions">
                          <button 
                            className="image-action-button" 
                            onClick={() => window.open(step.image, '_blank')}
                            title="View Full Size"
                          >
                            <FontAwesomeIcon icon={faExternalLinkAlt} />
                          </button>
                          <button 
                            className="image-action-button delete" 
                            onClick={() => handleRemoveImage(index)}
                            title="Remove Image"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </div>
                      <div className="image-caption">Step {step.stepNumber} Image</div>
                    </div>
                  ) : (
                    <div className="image-preview-container">
                      <div className="image-placeholder">
                        <FontAwesomeIcon icon={faImage} />
                        <span>No image uploaded for this step</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          <div className="add-step-container">
            <button className="btn btn-primary" onClick={handleAddStep}>
              <FontAwesomeIcon icon={faPlus} /> Add Step
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MixInstructions;
