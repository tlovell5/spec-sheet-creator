import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBox, 
  faBoxes, 
  faPallet, 
  faWeightHanging, 
  faBarcode, 
  faTag, 
  faRuler, 
  faLayerGroup, 
  faImage, 
  faUpload, 
  faWarehouse
} from '@fortawesome/free-solid-svg-icons';

function PackoutDetails({ specSheetId, unitsPerCase, casesPerPallet, caseUpc }) {
  const [packoutDetails, setPackoutDetails] = useState({
    case_configuration: '',
    case_label_size: '',
    case_label_placement: '',
    total_case_weight_lbs: 0,
    ti_hi: '',
    pallet_configuration: '',
    pallet_weight_lbs: 0,
    single_layer_config_url: '',
    two_layer_config_url: '',
    full_pallet_config_url: ''
  });
  
  const [uploading, setUploading] = useState({
    singleLayer: false,
    twoLayer: false,
    fullPallet: false
  });
  
  const [bomData, setBomData] = useState({
    caseItems: [],
    unitNetWeight: 0
  });

  // Fetch packout details when component mounts
  useEffect(() => {
    const fetchPackoutDetails = async () => {
      if (!specSheetId) return;
      
      // Fetch packout details
      const { data, error } = await supabase
        .from('packout_details')
        .select('*')
        .eq('spec_sheet_id', specSheetId)
        .single();
      
      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          console.error('Error fetching packout details:', error);
        }
        
        // If no data exists, create a new record
        const newPackoutDetails = {
          spec_sheet_id: specSheetId,
          case_configuration: '',
          case_label_size: '',
          case_label_placement: '',
          total_case_weight_lbs: 0,
          ti_hi: '',
          pallet_configuration: '',
          pallet_weight_lbs: 0,
          single_layer_config_url: '',
          two_layer_config_url: '',
          full_pallet_config_url: ''
        };
        
        const { data: newData, error: insertError } = await supabase
          .from('packout_details')
          .insert([newPackoutDetails])
          .select();
        
        if (insertError) {
          console.error('Error creating packout details:', insertError);
        } else if (newData && newData.length > 0) {
          setPackoutDetails(newData[0]);
        }
      } else if (data) {
        setPackoutDetails(data);
      }
      
      // Fetch BOM data for calculations
      await fetchBOMData();
    };
    
    fetchPackoutDetails();
  }, [specSheetId]);

  // Fetch BOM data for calculations
  const fetchBOMData = async () => {
    if (!specSheetId) return;
    
    // Fetch case items from bill_of_materials
    const { data: caseData, error: caseError } = await supabase
      .from('bill_of_materials')
      .select('*')
      .eq('spec_sheet_id', specSheetId)
      .eq('item_type', 'Case');
    
    if (caseError) {
      console.error('Error fetching case data:', caseError);
    }
    
    // Fetch production details to get unit net weight
    const { data: prodData, error: prodError } = await supabase
      .from('production_details')
      .select('net_weight_g')
      .eq('spec_sheet_id', specSheetId)
      .single();
    
    if (prodError && prodError.code !== 'PGRST116') {
      console.error('Error fetching production details:', prodError);
    }
    
    setBomData({
      caseItems: caseData || [],
      unitNetWeight: prodData?.net_weight_g || 0
    });
    
    // Calculate total case weight and pallet weight
    calculateWeights(caseData || [], prodData?.net_weight_g || 0);
  };

  // Calculate total case weight and pallet weight
  const calculateWeights = (caseItems, unitNetWeight) => {
    if (!unitsPerCase) return;
    
    // Calculate total case weight in lbs
    // Formula: (Units per Case × Unit Net Weight (g)) + Sum(Case table Weight (g))
    // Convert total from grams to lbs (1 g = 0.00220462 lbs)
    const unitWeightContribution = unitsPerCase * unitNetWeight;
    const caseWeightContribution = caseItems.reduce((sum, item) => {
      return sum + (Number(item.weight_g) || 0);
    }, 0);
    
    const totalCaseWeightG = unitWeightContribution + caseWeightContribution;
    const totalCaseWeightLbs = totalCaseWeightG * 0.00220462;
    
    // Calculate pallet weight in lbs
    // Formula: total case weight × Cases per Pallet
    const palletWeightLbs = casesPerPallet ? totalCaseWeightLbs * casesPerPallet : 0;
    
    // Update state and save to database
    setPackoutDetails(prev => ({
      ...prev,
      total_case_weight_lbs: totalCaseWeightLbs,
      pallet_weight_lbs: palletWeightLbs
    }));
    
    savePackoutDetails({
      ...packoutDetails,
      total_case_weight_lbs: totalCaseWeightLbs,
      pallet_weight_lbs: palletWeightLbs
    });
  };

  // Recalculate weights when units per case or cases per pallet changes
  useEffect(() => {
    calculateWeights(bomData.caseItems, bomData.unitNetWeight);
  }, [unitsPerCase, casesPerPallet]);

  // Handle changes to form fields
  const handleChange = (field, value) => {
    const updatedDetails = { ...packoutDetails, [field]: value };
    setPackoutDetails(updatedDetails);
    savePackoutDetails(updatedDetails);
  };

  // Save packout details to database
  const savePackoutDetails = async (details) => {
    if (!specSheetId) return;
    
    const { error } = await supabase
      .from('packout_details')
      .update(details)
      .eq('spec_sheet_id', specSheetId);
    
    if (error) {
      console.error('Error saving packout details:', error);
    }
  };

  // Handle file uploads
  const handleFileUpload = async (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Set uploading state for the specific file type
    setUploading(prev => ({ ...prev, [fileType]: true }));
    
    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `packout-details/${fileName}`;
      
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
      
      // Map file type to the corresponding field
      const fieldMap = {
        singleLayer: 'single_layer_config_url',
        twoLayer: 'two_layer_config_url',
        fullPallet: 'full_pallet_config_url'
      };
      
      // Update the field with the new URL
      handleChange(fieldMap[fileType], urlData.publicUrl);
      
    } catch (error) {
      console.error(`Error uploading ${fileType} image:`, error);
      alert(`Error uploading ${fileType} image. Please try again.`);
    } finally {
      setUploading(prev => ({ ...prev, [fileType]: false }));
    }
  };

  return (
    <div className="packout-details-container">
      {/* Case Information Section */}
      <div className="packout-section">
        <h3 className="packout-section-title">
          <FontAwesomeIcon icon={faBox} /> Case Information
        </h3>
        
        <div className="case-info-grid">
          <div className="case-card">
            <div className="case-card-label">
              <FontAwesomeIcon icon={faBoxes} /> Case Materials
            </div>
            <div className="case-materials">
              {bomData.caseItems.length > 0 ? (
                <ul>
                  {bomData.caseItems.map((item, index) => (
                    <li key={index}>
                      <span className="material-name">{item.description}</span>
                      <span className="material-details">{item.qty} ea, {item.weight_g}g</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No case materials defined in Bill of Materials</p>
              )}
            </div>
          </div>
          
          <div className="case-card">
            <div className="case-card-label">
              <FontAwesomeIcon icon={faLayerGroup} /> Units per Case
            </div>
            <div className="case-card-value">
              {unitsPerCase || 'Not specified'}
            </div>
          </div>
          
          <div className="case-card">
            <div className="case-card-label">
              <FontAwesomeIcon icon={faBarcode} /> Case UPC
            </div>
            <div className="case-card-value">
              {caseUpc || 'Not specified'}
            </div>
          </div>
          
          <div className="case-card">
            <div className="case-card-label">
              <FontAwesomeIcon icon={faWeightHanging} /> Total Case Weight (lbs)
            </div>
            <div className="case-card-value">
              {packoutDetails.total_case_weight_lbs 
                ? packoutDetails.total_case_weight_lbs.toFixed(2) 
                : '0.00'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Case Configuration Section */}
      <div className="packout-section">
        <h3 className="packout-section-title">
          <FontAwesomeIcon icon={faBox} /> Case Configuration
        </h3>
        
        <div className="config-grid">
          <div className="config-card">
            <div className="config-card-header">
              <div className="config-card-label">Case Configuration</div>
              <FontAwesomeIcon icon={faBox} className="config-card-icon" />
            </div>
            <input
              type="text"
              id="case_configuration"
              className="config-card-input"
              value={packoutDetails.case_configuration || ''}
              onChange={(e) => handleChange('case_configuration', e.target.value)}
              placeholder="Enter case configuration"
            />
          </div>
          
          <div className="config-card">
            <div className="config-card-header">
              <div className="config-card-label">Case Label Size</div>
              <FontAwesomeIcon icon={faTag} className="config-card-icon" />
            </div>
            <select
              id="case_label_size"
              className="config-card-select"
              value={packoutDetails.case_label_size || ''}
              onChange={(e) => handleChange('case_label_size', e.target.value)}
            >
              <option value="">Select Size</option>
              <option value="2x2">2x2</option>
              <option value="4x6">4x6</option>
            </select>
          </div>
          
          <div className="config-card">
            <div className="config-card-header">
              <div className="config-card-label">Case Label Placement</div>
              <FontAwesomeIcon icon={faRuler} className="config-card-icon" />
            </div>
            <input
              type="text"
              id="case_label_placement"
              className="config-card-input"
              value={packoutDetails.case_label_placement || ''}
              onChange={(e) => handleChange('case_label_placement', e.target.value)}
              placeholder="Enter label placement"
            />
          </div>
        </div>
      </div>
      
      {/* Pallet Configuration Section */}
      <div className="packout-section">
        <h3 className="packout-section-title">
          <FontAwesomeIcon icon={faPallet} /> Pallet Configuration
        </h3>
        
        <div className="config-grid">
          <div className="config-card">
            <div className="config-card-header">
              <div className="config-card-label">TI/HI</div>
              <FontAwesomeIcon icon={faLayerGroup} className="config-card-icon" />
            </div>
            <input
              type="text"
              id="ti_hi"
              className="config-card-input"
              value={packoutDetails.ti_hi || ''}
              onChange={(e) => handleChange('ti_hi', e.target.value)}
              placeholder="e.g., 5x10"
            />
          </div>
          
          <div className="config-card">
            <div className="config-card-header">
              <div className="config-card-label">Pallet Configuration</div>
              <FontAwesomeIcon icon={faWarehouse} className="config-card-icon" />
            </div>
            <input
              type="text"
              id="pallet_configuration"
              className="config-card-input"
              value={packoutDetails.pallet_configuration || ''}
              onChange={(e) => handleChange('pallet_configuration', e.target.value)}
              placeholder="Enter pallet configuration"
            />
          </div>
          
          <div className="config-card">
            <div className="config-card-header">
              <div className="config-card-label">Pallet Weight (lbs)</div>
              <FontAwesomeIcon icon={faWeightHanging} className="config-card-icon" />
            </div>
            <input
              type="number"
              id="pallet_weight_lbs"
              className="config-card-input"
              value={packoutDetails.pallet_weight_lbs ? packoutDetails.pallet_weight_lbs.toFixed(2) : ''}
              disabled
              style={{ backgroundColor: 'var(--gray-100)' }}
            />
          </div>
        </div>
      </div>
      
      {/* Pallet Configuration Images Section */}
      <div className="packout-section">
        <h3 className="packout-section-title">
          <FontAwesomeIcon icon={faImage} /> Pallet Configuration Images
        </h3>
        
        <div className="pallet-config-grid">
          {/* Single Layer Configuration */}
          <div className="pallet-image-card">
            <div className="pallet-image-header">
              Single Layer Configuration
            </div>
            <div className="pallet-image-content">
              {packoutDetails.single_layer_config_url ? (
                <div className="pallet-image-preview">
                  <img 
                    src={packoutDetails.single_layer_config_url} 
                    alt="Single Layer Configuration" 
                  />
                </div>
              ) : (
                <div className="empty-pallet-image">
                  <FontAwesomeIcon icon={faImage} className="empty-pallet-icon" />
                  <div className="empty-pallet-text">No image uploaded</div>
                </div>
              )}
              
              <div className="pallet-image-upload">
                <div className="pallet-upload-input">
                  <FontAwesomeIcon icon={faUpload} className="pallet-upload-icon" />
                  <div className="pallet-upload-text">
                    {uploading.singleLayer ? 'Uploading...' : 'Click to upload image'}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'singleLayer')}
                    disabled={uploading.singleLayer}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Two Layer Configuration */}
          <div className="pallet-image-card">
            <div className="pallet-image-header">
              Two Layer Configuration
            </div>
            <div className="pallet-image-content">
              {packoutDetails.two_layer_config_url ? (
                <div className="pallet-image-preview">
                  <img 
                    src={packoutDetails.two_layer_config_url} 
                    alt="Two Layer Configuration" 
                  />
                </div>
              ) : (
                <div className="empty-pallet-image">
                  <FontAwesomeIcon icon={faImage} className="empty-pallet-icon" />
                  <div className="empty-pallet-text">No image uploaded</div>
                </div>
              )}
              
              <div className="pallet-image-upload">
                <div className="pallet-upload-input">
                  <FontAwesomeIcon icon={faUpload} className="pallet-upload-icon" />
                  <div className="pallet-upload-text">
                    {uploading.twoLayer ? 'Uploading...' : 'Click to upload image'}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'twoLayer')}
                    disabled={uploading.twoLayer}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Full Pallet Configuration */}
          <div className="pallet-image-card">
            <div className="pallet-image-header">
              Full Pallet Configuration
            </div>
            <div className="pallet-image-content">
              {packoutDetails.full_pallet_config_url ? (
                <div className="pallet-image-preview">
                  <img 
                    src={packoutDetails.full_pallet_config_url} 
                    alt="Full Pallet Configuration" 
                  />
                </div>
              ) : (
                <div className="empty-pallet-image">
                  <FontAwesomeIcon icon={faImage} className="empty-pallet-icon" />
                  <div className="empty-pallet-text">No image uploaded</div>
                </div>
              )}
              
              <div className="pallet-image-upload">
                <div className="pallet-upload-input">
                  <FontAwesomeIcon icon={faUpload} className="pallet-upload-icon" />
                  <div className="pallet-upload-text">
                    {uploading.fullPallet ? 'Uploading...' : 'Click to upload image'}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'fullPallet')}
                    disabled={uploading.fullPallet}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PackoutDetails;
