import React, { useContext } from 'react';
import { SpecSheetContext } from '../context/SpecSheetContext';
import { v4 as uuidv4 } from 'uuid';

const EquipmentSpecifications = () => {
  const { specSheetData, setSpecSheetData } = useContext(SpecSheetContext);
  
  // Initialize equipment data if not present
  const equipment = specSheetData.equipmentSpecifications?.equipment || [];
  
  // Handle equipment field changes
  const handleEquipmentChange = (index, field, value) => {
    const updatedEquipment = [...equipment];
    
    if (!updatedEquipment[index]) {
      updatedEquipment[index] = {};
    }
    
    updatedEquipment[index][field] = value;
    
    setSpecSheetData(prevData => ({
      ...prevData,
      equipmentSpecifications: {
        ...prevData.equipmentSpecifications,
        equipment: updatedEquipment
      }
    }));
  };
  
  // Add new equipment
  const handleAddEquipment = () => {
    const newEquipment = {
      id: uuidv4(),
      name: '',
      model: '',
      settings: '',
      setupNotes: ''
    };
    
    setSpecSheetData(prevData => ({
      ...prevData,
      equipmentSpecifications: {
        ...prevData.equipmentSpecifications,
        equipment: [...(prevData.equipmentSpecifications?.equipment || []), newEquipment]
      }
    }));
  };
  
  // Remove equipment
  const handleRemoveEquipment = (index) => {
    const updatedEquipment = [...equipment];
    updatedEquipment.splice(index, 1);
    
    setSpecSheetData(prevData => ({
      ...prevData,
      equipmentSpecifications: {
        ...prevData.equipmentSpecifications,
        equipment: updatedEquipment
      }
    }));
  };
  
  // Handle general equipment notes change
  const handleEquipmentNotesChange = (e) => {
    const { value } = e.target;
    
    setSpecSheetData(prevData => ({
      ...prevData,
      equipmentSpecifications: {
        ...prevData.equipmentSpecifications,
        generalNotes: value
      }
    }));
  };

  return (
    <div className="card spec-sheet-section">
      <div className="card-header spec-sheet-section-header">
        <h2 className="spec-sheet-section-title">Equipment Specifications</h2>
      </div>
      
      <div className="card-body">
        <div className="form-section mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Equipment</h3>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddEquipment}
            >
              Add Equipment
            </button>
          </div>
          
          {equipment.length === 0 ? (
            <div className="text-center p-4 bg-light rounded">
              <p className="mb-0">No equipment added yet. Click "Add Equipment" to begin.</p>
            </div>
          ) : (
            <div className="equipment-container">
              {equipment.map((item, index) => (
                <div key={item.id} className="equipment-card mb-4">
                  <div className="equipment-header d-flex justify-content-between align-items-center">
                    <h4>{item.name || `Equipment ${index + 1}`}</h4>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveEquipment(index)}
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="equipment-content">
                    <div className="form-row d-flex">
                      <div className="form-group mr-3" style={{ flex: 1 }}>
                        <label htmlFor={`equipment-name-${index}`} className="form-label">Equipment Name</label>
                        <input
                          type="text"
                          id={`equipment-name-${index}`}
                          className="form-control"
                          value={item.name || ''}
                          onChange={(e) => handleEquipmentChange(index, 'name', e.target.value)}
                          placeholder="Enter equipment name"
                        />
                      </div>
                      
                      <div className="form-group" style={{ flex: 1 }}>
                        <label htmlFor={`equipment-model-${index}`} className="form-label">Model/Type</label>
                        <input
                          type="text"
                          id={`equipment-model-${index}`}
                          className="form-control"
                          value={item.model || ''}
                          onChange={(e) => handleEquipmentChange(index, 'model', e.target.value)}
                          placeholder="Enter model or type"
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor={`equipment-settings-${index}`} className="form-label">Settings</label>
                        <textarea
                          id={`equipment-settings-${index}`}
                          className="form-control"
                          value={item.settings || ''}
                          onChange={(e) => handleEquipmentChange(index, 'settings', e.target.value)}
                          placeholder="Enter equipment settings (temperature, speed, etc.)"
                          rows="3"
                        ></textarea>
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor={`equipment-setup-${index}`} className="form-label">Setup Notes</label>
                        <textarea
                          id={`equipment-setup-${index}`}
                          className="form-control"
                          value={item.setupNotes || ''}
                          onChange={(e) => handleEquipmentChange(index, 'setupNotes', e.target.value)}
                          placeholder="Enter setup instructions or notes"
                          rows="3"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="form-section">
          <h3 className="mb-3">General Equipment Notes</h3>
          <div className="form-row">
            <div className="form-group">
              <textarea
                className="form-control"
                value={specSheetData.equipmentSpecifications?.generalNotes || ''}
                onChange={handleEquipmentNotesChange}
                placeholder="Enter general equipment notes or requirements"
                rows="4"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx="true">{`
        .equipment-card {
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 15px;
          background-color: #f9f9f9;
        }
        
        .equipment-header {
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        
        .equipment-header h4 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default EquipmentSpecifications;
