import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

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

  return (
    <div className="equipment-specs-container">
      <table className="form-table">
        <thead>
          <tr>
            <th>Equipment Type</th>
            <th>Model/ID</th>
            <th>Part Sizes</th>
            <th>Settings</th>
            <th>Configuration</th>
            <th>Capacity</th>
            <th>Maintenance Tips</th>
            <th>Operator Notes</th>
            <th>Picture</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {equipmentSpecs.map((spec, index) => (
            <tr key={spec.id || index}>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={spec.equipment_type || ''}
                  onChange={(e) => handleSpecChange(index, 'equipment_type', e.target.value)}
                  placeholder="Mixer, Filler, etc."
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={spec.model_id || ''}
                  onChange={(e) => handleSpecChange(index, 'model_id', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={spec.part_sizes || ''}
                  onChange={(e) => handleSpecChange(index, 'part_sizes', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={spec.settings || ''}
                  onChange={(e) => handleSpecChange(index, 'settings', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={spec.configuration || ''}
                  onChange={(e) => handleSpecChange(index, 'configuration', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={spec.capacity || ''}
                  onChange={(e) => handleSpecChange(index, 'capacity', e.target.value)}
                />
              </td>
              <td>
                <textarea
                  className="form-control"
                  value={spec.maintenance_tips || ''}
                  onChange={(e) => handleSpecChange(index, 'maintenance_tips', e.target.value)}
                  rows={2}
                />
              </td>
              <td>
                <textarea
                  className="form-control"
                  value={spec.operator_notes || ''}
                  onChange={(e) => handleSpecChange(index, 'operator_notes', e.target.value)}
                  rows={2}
                />
              </td>
              <td>
                <div className="file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, index)}
                    disabled={uploading[index]}
                    className="file-upload-input"
                  />
                  {uploading[index] && <p>Uploading...</p>}
                  {spec.equipment_image_url && (
                    <div className="image-preview">
                      <img 
                        src={spec.equipment_image_url} 
                        alt="Equipment" 
                        style={{ maxWidth: '100px', marginTop: '10px' }} 
                      />
                    </div>
                  )}
                </div>
              </td>
              <td>
                <button 
                  className="remove-row-button"
                  onClick={() => removeEquipmentSpec(index)}
                >
                  X
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <button 
        className="add-row-button"
        onClick={addEquipmentSpec}
      >
        Add Equipment
      </button>
    </div>
  );
}

export default EquipmentSpecs;
