import React, { useState, useContext } from 'react';
import { SpecSheetContext } from '../context/SpecSheetContext';
import { STORAGE_BUCKETS, uploadFile } from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const MixInstructions = () => {
  const { specSheetData, setSpecSheetData } = useContext(SpecSheetContext);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(null);
  
  // Initialize steps if not already present
  const steps = specSheetData.mixInstructions?.steps || [];
  
  // Add a new step
  const handleAddStep = () => {
    const newStep = {
      id: uuidv4(),
      stepNumber: steps.length + 1,
      instruction: '',
      image: null,
      imageName: null,
      notes: ''
    };
    
    setSpecSheetData(prevData => ({
      ...prevData,
      mixInstructions: {
        ...prevData.mixInstructions,
        steps: [...(prevData.mixInstructions?.steps || []), newStep]
      }
    }));
  };
  
  // Remove a step
  const handleRemoveStep = (index) => {
    const updatedSteps = [...steps];
    updatedSteps.splice(index, 1);
    
    // Renumber remaining steps
    const renumberedSteps = updatedSteps.map((step, idx) => ({
      ...step,
      stepNumber: idx + 1
    }));
    
    setSpecSheetData(prevData => ({
      ...prevData,
      mixInstructions: {
        ...prevData.mixInstructions,
        steps: renumberedSteps
      }
    }));
  };
  
  // Move step up
  const handleMoveStepUp = (index) => {
    if (index === 0) return; // Already at the top
    
    const updatedSteps = [...steps];
    const temp = updatedSteps[index];
    updatedSteps[index] = updatedSteps[index - 1];
    updatedSteps[index - 1] = temp;
    
    // Renumber steps
    const renumberedSteps = updatedSteps.map((step, idx) => ({
      ...step,
      stepNumber: idx + 1
    }));
    
    setSpecSheetData(prevData => ({
      ...prevData,
      mixInstructions: {
        ...prevData.mixInstructions,
        steps: renumberedSteps
      }
    }));
  };
  
  // Move step down
  const handleMoveStepDown = (index) => {
    if (index === steps.length - 1) return; // Already at the bottom
    
    const updatedSteps = [...steps];
    const temp = updatedSteps[index];
    updatedSteps[index] = updatedSteps[index + 1];
    updatedSteps[index + 1] = temp;
    
    // Renumber steps
    const renumberedSteps = updatedSteps.map((step, idx) => ({
      ...step,
      stepNumber: idx + 1
    }));
    
    setSpecSheetData(prevData => ({
      ...prevData,
      mixInstructions: {
        ...prevData.mixInstructions,
        steps: renumberedSteps
      }
    }));
  };
  
  // Handle step field changes
  const handleStepChange = (index, field, value) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = {
      ...updatedSteps[index],
      [field]: value
    };
    
    setSpecSheetData(prevData => ({
      ...prevData,
      mixInstructions: {
        ...prevData.mixInstructions,
        steps: updatedSteps
      }
    }));
  };
  
  // Handle step image upload
  const handleStepImageUpload = async (e, index) => {
    try {
      setUploading(true);
      setUploadError(null);
      setCurrentStepIndex(index);
      
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
        STORAGE_BUCKETS.MIX_INSTRUCTION_IMAGES
      );
      
      if (error) {
        throw error;
      }
      
      // Update step with image URL
      const updatedSteps = [...steps];
      updatedSteps[index] = {
        ...updatedSteps[index],
        image: data.publicUrl,
        imageName: file.name
      };
      
      setSpecSheetData(prevData => ({
        ...prevData,
        mixInstructions: {
          ...prevData.mixInstructions,
          steps: updatedSteps
        }
      }));
      
      setUploading(false);
      setCurrentStepIndex(null);
    } catch (error) {
      console.error('Error uploading step image:', error);
      setUploadError('Failed to upload image. Please try again.');
      setUploading(false);
      setCurrentStepIndex(null);
    }
  };
  
  // Remove step image
  const handleRemoveStepImage = (index) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = {
      ...updatedSteps[index],
      image: null,
      imageName: null
    };
    
    setSpecSheetData(prevData => ({
      ...prevData,
      mixInstructions: {
        ...prevData.mixInstructions,
        steps: updatedSteps
      }
    }));
  };
  
  // Handle general notes change
  const handleGeneralNotesChange = (e) => {
    const { value } = e.target;
    
    setSpecSheetData(prevData => ({
      ...prevData,
      mixInstructions: {
        ...prevData.mixInstructions,
        generalNotes: value
      }
    }));
  };

  return (
    <div className="card spec-sheet-section">
      <div className="card-header spec-sheet-section-header">
        <h2 className="spec-sheet-section-title">Mix Instructions</h2>
      </div>
      
      <div className="card-body">
        <div className="form-section mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Steps</h3>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddStep}
            >
              Add Step
            </button>
          </div>
          
          {steps.length === 0 ? (
            <div className="text-center p-4 bg-light rounded">
              <p className="mb-0">No steps added yet. Click "Add Step" to begin.</p>
            </div>
          ) : (
            <div className="mix-steps-container">
              {steps.map((step, index) => (
                <div key={step.id} className="mix-step-card mb-4">
                  <div className="mix-step-header d-flex justify-content-between align-items-center">
                    <h4>Step {step.stepNumber}</h4>
                    <div className="mix-step-actions">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm mr-2"
                        onClick={() => handleMoveStepUp(index)}
                        disabled={index === 0}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm mr-2"
                        onClick={() => handleMoveStepDown(index)}
                        disabled={index === steps.length - 1}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemoveStep(index)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  
                  <div className="mix-step-content">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor={`step-instruction-${index}`} className="form-label">Instruction</label>
                        <textarea
                          id={`step-instruction-${index}`}
                          className="form-control"
                          value={step.instruction || ''}
                          onChange={(e) => handleStepChange(index, 'instruction', e.target.value)}
                          placeholder="Enter step instruction"
                          rows="3"
                        ></textarea>
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor={`step-notes-${index}`} className="form-label">Notes</label>
                        <textarea
                          id={`step-notes-${index}`}
                          className="form-control"
                          value={step.notes || ''}
                          onChange={(e) => handleStepChange(index, 'notes', e.target.value)}
                          placeholder="Enter additional notes for this step"
                          rows="2"
                        ></textarea>
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Step Image</label>
                        
                        <div className="step-image-container">
                          {step.image ? (
                            <div className="step-image-preview">
                              <img 
                                src={step.image} 
                                alt={`Step ${step.stepNumber}`} 
                                className="step-image"
                                style={{ maxWidth: '200px', maxHeight: '200px' }}
                              />
                              <button
                                type="button"
                                className="btn btn-danger btn-sm mt-2"
                                onClick={() => handleRemoveStepImage(index)}
                              >
                                Remove Image
                              </button>
                            </div>
                          ) : (
                            <div className="step-image-upload">
                              <label htmlFor={`step-image-upload-${index}`} className="btn btn-secondary">
                                {uploading && currentStepIndex === index ? 'Uploading...' : 'Upload Image'}
                              </label>
                              <input
                                type="file"
                                id={`step-image-upload-${index}`}
                                accept="image/*"
                                onChange={(e) => handleStepImageUpload(e, index)}
                                style={{ display: 'none' }}
                                disabled={uploading}
                              />
                              <p className="text-muted mt-2">
                                Upload an image for this step (JPG, PNG, GIF, max 5MB)
                              </p>
                            </div>
                          )}
                          
                          {uploadError && currentStepIndex === index && (
                            <div className="text-danger mt-2">
                              {uploadError}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="form-section">
          <h3 className="mb-3">General Notes</h3>
          <div className="form-row">
            <div className="form-group">
              <textarea
                className="form-control"
                value={specSheetData.mixInstructions?.generalNotes || ''}
                onChange={handleGeneralNotesChange}
                placeholder="Enter general notes about the mixing process"
                rows="4"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx="true">{`
        .mix-step-card {
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 15px;
          background-color: #f9f9f9;
        }
        
        .mix-step-header {
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        
        .mix-step-header h4 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }
        
        .step-image {
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 5px;
          background-color: white;
        }
      `}</style>
    </div>
  );
};

export default MixInstructions;
