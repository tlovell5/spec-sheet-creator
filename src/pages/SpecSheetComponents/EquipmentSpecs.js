import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCogs, 
  faTools, 
  faWrench, 
  faPlus, 
  faTimes, 
  faUpload, 
  faImage, 
  faRuler, 
  faSliders, 
  faCubes, 
  faClipboardList, 
  faUserCog,
  faBoxes,
  faTruck
} from '@fortawesome/free-solid-svg-icons';

function EquipmentSpecs({ specSheetId }) {
  const [equipmentSpecs, setEquipmentSpecs] = useState([]);
  const [uploading, setUploading] = useState({});

  // Fetch equipment specs when component mounts
  useEffect(() => {
    const fetchEquipmentSpecs = async () => {
      if (!specSheetId) return;
      
      const { data, error } = await supabase
        .from('equipment_specs')
        .select('*')
        .eq('spec_sheet_id', specSheetId);
      
      if (error) {
        console.error('Error fetching equipment specs:', error);
        setEquipmentSpecs([getEmptySpec()]);
      } else if (data && data.length > 0) {
        setEquipmentSpecs(data);
      } else {
        setEquipmentSpecs([getEmptySpec()]);
      }
    };
    
    fetchEquipmentSpecs();
  }, [specSheetId]);

  // Helper function to create an empty spec
  const getEmptySpec = () => {
    return {
      id: `temp-${Math.random().toString(36).substring(2, 9)}`,
      spec_sheet_id: specSheetId,
      equipment_type: '',
      model_id: '',
      part_sizes: '',
      settings: '',
      configuration: '',
      capacity: '',
      maintenance_tips: '',
      operator_notes: '',
      equipment_image_url: ''
    };
  };

  // Handle changes to spec fields
  const handleSpecChange = (index, field, value) => {
    const updatedSpecs = [...equipmentSpecs];
    updatedSpecs[index][field] = value;
    setEquipmentSpecs(updatedSpecs);
    saveSpec(updatedSpecs[index]);
  };

  // Add a new equipment spec
  const addEquipmentSpec = () => {
    setEquipmentSpecs([...equipmentSpecs, getEmptySpec()]);
  };

  // Remove an equipment spec
  const removeEquipmentSpec = async (index) => {
    const specToRemove = equipmentSpecs[index];
    const updatedSpecs = equipmentSpecs.filter((_, i) => i !== index);
    
    // Ensure we always have at least one spec
    if (updatedSpecs.length === 0) {
      updatedSpecs.push(getEmptySpec());
    }
    
    setEquipmentSpecs(updatedSpecs);
    
    // If it's a saved spec (has a non-temp id), delete it from the database
    if (specToRemove.id && !specToRemove.id.startsWith('temp-')) {
      await supabase
        .from('equipment_specs')
        .delete()
        .eq('id', specToRemove.id);
    }
  };

  // Save spec to database
  const saveSpec = async (spec) => {
    if (!specSheetId) return;
    
    const { id, ...specData } = spec;
    
    // If it's a temporary ID, insert a new record
    if (id.startsWith('temp-')) {
      const { data, error } = await supabase
        .from('equipment_specs')
        .insert([specData])
        .select();
      
      if (error) {
        console.error('Error saving equipment spec:', error);
      } else if (data && data.length > 0) {
        // Update the ID in the state
        setEquipmentSpecs(prev => 
          prev.map(item => 
            item.id === id ? { ...item, id: data[0].id } : item
          )
        );
      }
    } else {
      // Otherwise, update the existing record
      const { error } = await supabase
        .from('equipment_specs')
        .update(specData)
        .eq('id', id);
      
      if (error) {
        console.error('Error updating equipment spec:', error);
      }
    }
  };

  // Handle file uploads
  const handleFileUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Set uploading state for the specific equipment
    setUploading(prev => ({ ...prev, [index]: true }));
    
    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `equipment-specs/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('spec-sheet-assets')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('spec-sheet-assets')
        .getPublicUrl(filePath);
      
      // Update the image URL in the state
      const updatedSpecs = [...equipmentSpecs];
      updatedSpecs[index].equipment_image_url = urlData.publicUrl;
      setEquipmentSpecs(updatedSpecs);
      
      // Save to database
      saveSpec(updatedSpecs[index]);
      
    } catch (error) {
      console.error('Error uploading equipment image:', error);
      alert('Error uploading equipment image. Please try again.');
    } finally {
      setUploading(prev => ({ ...prev, [index]: false }));
    }
  };

  // Get equipment icon based on type
  const getEquipmentIcon = (type) => {
    const lowerType = (type || '').toLowerCase();
    
    if (lowerType.includes('mixer')) return faTools;
    if (lowerType.includes('filler')) return faCubes;
    if (lowerType.includes('packag')) return faBoxes;
    if (lowerType.includes('conveyor')) return faTruck;
    
    return faCogs;
  };

  return (
    <div className="equipment-specs-container">
      <div className="equipment-specs-header">
        <h3 className="equipment-specs-title">
          <FontAwesomeIcon icon={faCogs} /> Equipment Specifications
        </h3>
      </div>
      
      <div className="equipment-cards">
        {equipmentSpecs.map((spec, index) => (
          <div className="equipment-card" key={spec.id || index}>
            <div className="equipment-card-header">
              <div className="equipment-card-header-left">
                <FontAwesomeIcon 
                  icon={getEquipmentIcon(spec.equipment_type)} 
                  className="equipment-card-header-icon" 
                />
                {spec.equipment_type || 'New Equipment'}
              </div>
              <button 
                className="equipment-action-btn"
                onClick={() => removeEquipmentSpec(index)}
                title="Remove Equipment"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="equipment-card-content">
              <div className="equipment-card-row">
                <div className="equipment-card-field">
                  <label className="equipment-card-label">Equipment Type</label>
                  <input
                    type="text"
                    className="equipment-card-input"
                    value={spec.equipment_type || ''}
                    onChange={(e) => handleSpecChange(index, 'equipment_type', e.target.value)}
                    placeholder="Mixer, Filler, etc."
                  />
                </div>
                <div className="equipment-card-field">
                  <label className="equipment-card-label">Model/ID</label>
                  <input
                    type="text"
                    className="equipment-card-input"
                    value={spec.model_id || ''}
                    onChange={(e) => handleSpecChange(index, 'model_id', e.target.value)}
                    placeholder="Model number or ID"
                  />
                </div>
              </div>
              
              <div className="equipment-card-row">
                <div className="equipment-card-field">
                  <label className="equipment-card-label">
                    <FontAwesomeIcon icon={faRuler} style={{ marginRight: '5px' }} />
                    Part Sizes
                  </label>
                  <input
                    type="text"
                    className="equipment-card-input"
                    value={spec.part_sizes || ''}
                    onChange={(e) => handleSpecChange(index, 'part_sizes', e.target.value)}
                    placeholder="Dimensions, sizes"
                  />
                </div>
                <div className="equipment-card-field">
                  <label className="equipment-card-label">
                    <FontAwesomeIcon icon={faSliders} style={{ marginRight: '5px' }} />
                    Settings
                  </label>
                  <input
                    type="text"
                    className="equipment-card-input"
                    value={spec.settings || ''}
                    onChange={(e) => handleSpecChange(index, 'settings', e.target.value)}
                    placeholder="Speed, temperature, etc."
                  />
                </div>
              </div>
              
              <div className="equipment-card-row">
                <div className="equipment-card-field">
                  <label className="equipment-card-label">Configuration</label>
                  <input
                    type="text"
                    className="equipment-card-input"
                    value={spec.configuration || ''}
                    onChange={(e) => handleSpecChange(index, 'configuration', e.target.value)}
                    placeholder="Setup configuration"
                  />
                </div>
                <div className="equipment-card-field">
                  <label className="equipment-card-label">Capacity</label>
                  <input
                    type="text"
                    className="equipment-card-input"
                    value={spec.capacity || ''}
                    onChange={(e) => handleSpecChange(index, 'capacity', e.target.value)}
                    placeholder="Production capacity"
                  />
                </div>
              </div>
              
              <div className="equipment-card-field">
                <label className="equipment-card-label">
                  <FontAwesomeIcon icon={faWrench} style={{ marginRight: '5px' }} />
                  Maintenance Tips
                </label>
                <textarea
                  className="equipment-card-textarea"
                  value={spec.maintenance_tips || ''}
                  onChange={(e) => handleSpecChange(index, 'maintenance_tips', e.target.value)}
                  placeholder="Maintenance instructions and tips"
                  rows={3}
                />
              </div>
              
              <div className="equipment-card-field">
                <label className="equipment-card-label">
                  <FontAwesomeIcon icon={faUserCog} style={{ marginRight: '5px' }} />
                  Operator Notes
                </label>
                <textarea
                  className="equipment-card-textarea"
                  value={spec.operator_notes || ''}
                  onChange={(e) => handleSpecChange(index, 'operator_notes', e.target.value)}
                  placeholder="Notes for equipment operators"
                  rows={3}
                />
              </div>
              
              <div className="equipment-image-section">
                <label className="equipment-card-label">
                  <FontAwesomeIcon icon={faImage} style={{ marginRight: '5px' }} />
                  Equipment Image
                </label>
                
                {spec.equipment_image_url ? (
                  <div className="equipment-image-preview">
                    <img 
                      src={spec.equipment_image_url} 
                      alt="Equipment" 
                    />
                  </div>
                ) : (
                  <div className="equipment-empty-image">
                    <FontAwesomeIcon icon={faImage} className="equipment-empty-icon" />
                    <div className="equipment-empty-text">No image uploaded</div>
                  </div>
                )}
                
                <div className="equipment-image-upload">
                  <div className="equipment-upload-btn">
                    <FontAwesomeIcon icon={faUpload} className="equipment-upload-icon" />
                    <span>{uploading[index] ? 'Uploading...' : 'Upload equipment image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, index)}
                      disabled={uploading[index]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button 
        className="equipment-add-btn"
        onClick={addEquipmentSpec}
      >
        <FontAwesomeIcon icon={faPlus} /> Add Equipment
      </button>
    </div>
  );
}

export default EquipmentSpecs;
