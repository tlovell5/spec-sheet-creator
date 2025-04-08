import React, { useState, useEffect, useCallback } from 'react';
import { supabase, uploadFile, STORAGE_FOLDERS } from '../../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faInfoCircle, 
  faWeight, 
  faImage, 
  faUpload, 
  faBarcode, 
  faCalendarAlt, 
  faCode, 
  faBoxOpen, 
  faLeaf, 
  faLayerGroup, 
  faTag
} from '@fortawesome/free-solid-svg-icons';

function ProductionDetails({ 
  specSheetId, 
  unitUpc, 
  lotCodeFormat, 
  shelfLifeYears, 
  shelfLifeMonths,
  shelfLife,
  shelfLifeUnit,
  unitClaimWeight,
  weightUom,
  packagingWeightG,
  inclusionWeightG,
  ingredientWeightG,
  netWeightG,
  setSpecSheetData,
  specSheetData
}) {
  const [productionDetails, setProductionDetails] = useState({
    packaging_weight_g: packagingWeightG || 0,
    inclusion_weight_g: inclusionWeightG || 0,
    ingredient_weight_g: ingredientWeightG || 0,
    net_weight_g: netWeightG || 0,
    front_artwork_url: '',
    back_artwork_url: '',
    lot_code_placement_url: '',
    inclusion_image_url: ''
  });
  
  const [uploading, setUploading] = useState({
    front: false,
    back: false,
    lotCode: false,
    inclusion: false
  });

  // Calculate net weight whenever ingredient, packaging, or inclusion weights change
  const calculateNetWeight = useCallback(() => {
    const packaging = parseFloat(productionDetails.packaging_weight_g || 0);
    const inclusion = parseFloat(productionDetails.inclusion_weight_g || 0);
    const ingredient = parseFloat(productionDetails.ingredient_weight_g || 0);
    
    return (packaging + inclusion + ingredient).toFixed(2);
  }, [productionDetails.packaging_weight_g, productionDetails.inclusion_weight_g, productionDetails.ingredient_weight_g]);

  // Update local state when props change
  useEffect(() => {
    setProductionDetails(prevState => ({
      ...prevState,
      packaging_weight_g: packagingWeightG !== undefined ? packagingWeightG : prevState.packaging_weight_g || 0,
      inclusion_weight_g: inclusionWeightG !== undefined ? inclusionWeightG : prevState.inclusion_weight_g || 0,
      ingredient_weight_g: ingredientWeightG !== undefined ? ingredientWeightG : prevState.ingredient_weight_g || 0
    }));
  }, [packagingWeightG, inclusionWeightG, ingredientWeightG]);
  
  // Update net weight whenever weights change
  useEffect(() => {
    setProductionDetails(prevState => ({
      ...prevState,
      net_weight_g: calculateNetWeight()
    }));
  }, [calculateNetWeight]);

  // Fetch production details when component mounts
  useEffect(() => {
    const fetchProductionDetails = async () => {
      if (!specSheetId || typeof specSheetId !== 'string' || specSheetId.length < 10) {
        console.log('Invalid specSheetId, skipping database operations');
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('production_details')
          .select('*')
          .eq('spec_sheet_id', specSheetId)
          .single();
        
        if (error) {
          if (error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
            console.error('Error fetching production details:', error);
          }
          
          // If no data exists, create a new record
          const newProductionDetails = {
            spec_sheet_id: specSheetId,
            packaging_weight_g: packagingWeightG || 0,
            inclusion_weight_g: inclusionWeightG || 0,
            ingredient_weight_g: ingredientWeightG || 0,
            net_weight_g: netWeightG || 0,
            front_artwork_url: '',
            back_artwork_url: '',
            lot_code_placement_url: '',
            inclusion_image_url: ''
          };
          
          const { data: newData, error: insertError } = await supabase
            .from('production_details')
            .insert([newProductionDetails])
            .select();
          
          if (insertError) {
            console.error('Error creating production details:', insertError);
          } else if (newData && newData.length > 0) {
            setProductionDetails(newData[0]);
          }
        } else if (data) {
          setProductionDetails(data);
        }
      } catch (err) {
        console.error('Unexpected error in fetchProductionDetails:', err);
      }
    };
    
    fetchProductionDetails();
  }, [specSheetId, packagingWeightG, inclusionWeightG, ingredientWeightG, netWeightG]);

  // Update production details when they are passed from parent component
  useEffect(() => {
    if (!setSpecSheetData) return;
    
    const timer = setTimeout(() => {
      setSpecSheetData(prevData => {
        // Only update if we have data to update with
        if (productionDetails && Object.keys(productionDetails).length > 0) {
          return {
            ...prevData,
            productionDetails: {
              ...prevData.productionDetails,
              ...productionDetails
            }
          };
        }
        return prevData;
      });
    }, 0);
    
    return () => clearTimeout(timer);
  }, [productionDetails, setSpecSheetData]);

  // Helper function to convert weight to grams
  const convertToGrams = (weight, uom = 'g') => {
    if (!weight) return 0;
    
    const numWeight = Number(weight);
    
    switch (uom) {
      case 'kg':
        return numWeight * 1000;
      case 'oz':
        return numWeight * 28.3495;
      case 'lb':
        return numWeight * 453.592;
      case 'g':
      default:
        return numWeight;
    }
  };

  // Handle changes to form fields
  const handleChange = (field, value) => {
    const updatedDetails = { ...productionDetails, [field]: value };
    
    // Recalculate packaging claim weight if packaging or inclusion weight changes
    if (field === 'packaging_weight_g' || field === 'inclusion_weight_g') {
      const netWeight = 
        (updatedDetails.ingredient_weight_g || 0) + 
        (updatedDetails.packaging_weight_g || 0) + 
        (updatedDetails.inclusion_weight_g || 0);
      
      updatedDetails.net_weight_g = netWeight;
    }
    
    setProductionDetails(updatedDetails);
    saveProductionDetails(updatedDetails);
  };

  // Save production details to database
  const saveProductionDetails = async (details) => {
    if (!specSheetId || typeof specSheetId !== 'string' || specSheetId.length < 10) {
      console.log('Invalid specSheetId, skipping database operations');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('production_details')
        .update(details)
        .eq('spec_sheet_id', specSheetId);
      
      if (error) {
        console.error('Error saving production details:', error);
      }
    } catch (err) {
      console.error('Unexpected error in saveProductionDetails:', err);
    }
  };

  // Handle file uploads
  const handleFileUpload = async (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Set uploading state for the specific file type
    setUploading(prev => ({ ...prev, [fileType]: true }));
    
    try {
      // Use the enhanced upload function
      const { success, publicUrl, error } = await uploadFile(file, STORAGE_FOLDERS.PRODUCTION_DETAILS);
      
      if (!success) {
        throw error;
      }
      
      // Map file type to the corresponding field
      const fieldMap = {
        front: 'front_artwork_url',
        back: 'back_artwork_url',
        lotCode: 'lot_code_placement_url',
        inclusion: 'inclusion_image_url'
      };
      
      // Update the field with the new URL
      handleChange(fieldMap[fileType], publicUrl);
      
    } catch (error) {
      console.error(`Error uploading ${fileType} image:`, error);
      alert(`Error uploading ${fileType} image. Please try again.`);
    } finally {
      setUploading(prev => ({ ...prev, [fileType]: false }));
    }
  };

  return (
    <div className="production-details-container">
      {/* Product Information Section */}
      <div className="production-section">
        <h3 className="production-section-title">
          <FontAwesomeIcon icon={faInfoCircle} />
          Product Information
        </h3>
        <div className="production-info-grid">
          <div className="info-card">
            <div className="info-card-label">Unit UPC</div>
            <div className="info-card-value">
              <FontAwesomeIcon icon={faBarcode} className="mr-2" />
              {unitUpc || 'N/A'}
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-card-label">Lot Code Format</div>
            <div className="info-card-value">
              <FontAwesomeIcon icon={faCode} className="mr-2" />
              {lotCodeFormat || 'N/A'}
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-card-label">Shelf Life</div>
            <div className="info-card-value">
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
              {shelfLife ? `${shelfLife} ${shelfLifeUnit}` : `${shelfLifeYears || 0} years, ${shelfLifeMonths || 0} months`}
            </div>
          </div>
        </div>
      </div>
      
      {/* Weight Information Section */}
      <div className="production-section">
        <h3 className="production-section-title">
          <FontAwesomeIcon icon={faWeight} />
          Weight Information
        </h3>
        <div className="weight-grid">
          <div className="weight-card">
            <div className="weight-card-header">
              <div className="weight-card-label">Packaging Weight (g)</div>
              <FontAwesomeIcon icon={faBoxOpen} className="weight-card-icon" />
            </div>
            <input
              type="number"
              id="packaging_weight_g"
              className="weight-card-input calculated-field"
              value={productionDetails.packaging_weight_g || ''}
              readOnly
              disabled
              placeholder="Auto-calculated from Bill of Materials"
            />
            <div className="field-help">Automatically calculated from packaging weights in Bill of Materials</div>
          </div>
          
          <div className="weight-card">
            <div className="weight-card-header">
              <div className="weight-card-label">Inclusion Weight (g)</div>
              <FontAwesomeIcon icon={faLeaf} className="weight-card-icon" />
            </div>
            <input
              type="number"
              id="inclusion_weight_g"
              className="weight-card-input calculated-field"
              value={productionDetails.inclusion_weight_g || ''}
              readOnly
              disabled
              placeholder="Auto-calculated from Bill of Materials"
            />
            <div className="field-help">Automatically calculated from inclusion weights in Bill of Materials</div>
          </div>
          
          <div className="weight-card">
            <div className="weight-card-header">
              <div className="weight-card-label">Ingredient Weight (g)</div>
              <FontAwesomeIcon icon={faLayerGroup} className="weight-card-icon" />
            </div>
            <input
              type="number"
              id="ingredient_weight_g"
              className="weight-card-input calculated-field"
              value={productionDetails.ingredient_weight_g ? parseFloat(productionDetails.ingredient_weight_g).toFixed(2) : ''}
              disabled
              placeholder="Calculated automatically"
            />
            <div className="field-help">Automatically calculated from WIP weight in Bill of Materials (converted to grams)</div>
          </div>
          
          <div className="weight-card">
            <div className="weight-card-header">
              <div className="weight-card-label">Unit Net Weight (g)</div>
              <FontAwesomeIcon icon={faTag} className="weight-card-icon" />
            </div>
            <input
              type="number"
              id="net_weight_g"
              className="weight-card-input calculated-field"
              value={productionDetails.net_weight_g ? parseFloat(productionDetails.net_weight_g).toFixed(2) : ''}
              disabled
              placeholder="Calculated automatically"
            />
            <div className="field-help">Total weight: sum of Packaging, Inclusion, and Ingredient weights</div>
          </div>
        </div>
      </div>
      
      {/* Artwork & Images Section */}
      <div className="production-section">
        <h3 className="production-section-title">
          <FontAwesomeIcon icon={faImage} />
          Artwork & Images
        </h3>
        <div className="artwork-grid">
          {/* Front Artwork */}
          <div className="artwork-card">
            <div className="artwork-card-header">
              Front Artwork
            </div>
            <div className="artwork-card-content">
              {productionDetails.front_artwork_url ? (
                <div className="artwork-preview">
                  <img 
                    src={productionDetails.front_artwork_url} 
                    alt="Front Artwork" 
                  />
                </div>
              ) : (
                <div className="empty-artwork">
                  <FontAwesomeIcon icon={faImage} className="empty-artwork-icon" />
                  <div className="empty-artwork-text">No front artwork uploaded yet</div>
                </div>
              )}
              
              <div className="artwork-upload">
                <label className="artwork-upload-input">
                  <FontAwesomeIcon icon={faUpload} className="artwork-upload-icon" />
                  <span className="artwork-upload-text">Click or drag to upload front artwork</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'front')}
                    disabled={uploading.front}
                  />
                </label>
                {uploading.front && (
                  <div className="uploading-indicator">
                    <div className="uploading-spinner"></div>
                    <span>Uploading...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Back Artwork */}
          <div className="artwork-card">
            <div className="artwork-card-header">
              Back Artwork
            </div>
            <div className="artwork-card-content">
              {productionDetails.back_artwork_url ? (
                <div className="artwork-preview">
                  <img 
                    src={productionDetails.back_artwork_url} 
                    alt="Back Artwork" 
                  />
                </div>
              ) : (
                <div className="empty-artwork">
                  <FontAwesomeIcon icon={faImage} className="empty-artwork-icon" />
                  <div className="empty-artwork-text">No back artwork uploaded yet</div>
                </div>
              )}
              
              <div className="artwork-upload">
                <label className="artwork-upload-input">
                  <FontAwesomeIcon icon={faUpload} className="artwork-upload-icon" />
                  <span className="artwork-upload-text">Click or drag to upload back artwork</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'back')}
                    disabled={uploading.back}
                  />
                </label>
                {uploading.back && (
                  <div className="uploading-indicator">
                    <div className="uploading-spinner"></div>
                    <span>Uploading...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Lot Code Placement */}
          <div className="artwork-card">
            <div className="artwork-card-header">
              Lot Code Placement
            </div>
            <div className="artwork-card-content">
              {productionDetails.lot_code_placement_url ? (
                <div className="artwork-preview">
                  <img 
                    src={productionDetails.lot_code_placement_url} 
                    alt="Lot Code Placement" 
                  />
                </div>
              ) : (
                <div className="empty-artwork">
                  <FontAwesomeIcon icon={faImage} className="empty-artwork-icon" />
                  <div className="empty-artwork-text">No lot code placement image uploaded yet</div>
                </div>
              )}
              
              <div className="artwork-upload">
                <label className="artwork-upload-input">
                  <FontAwesomeIcon icon={faUpload} className="artwork-upload-icon" />
                  <span className="artwork-upload-text">Click or drag to upload lot code placement</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'lotCode')}
                    disabled={uploading.lotCode}
                  />
                </label>
                {uploading.lotCode && (
                  <div className="uploading-indicator">
                    <div className="uploading-spinner"></div>
                    <span>Uploading...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Inclusion Image */}
          <div className="artwork-card">
            <div className="artwork-card-header">
              Inclusion Image
            </div>
            <div className="artwork-card-content">
              {productionDetails.inclusion_image_url ? (
                <div className="artwork-preview">
                  <img 
                    src={productionDetails.inclusion_image_url} 
                    alt="Inclusion" 
                  />
                </div>
              ) : (
                <div className="empty-artwork">
                  <FontAwesomeIcon icon={faImage} className="empty-artwork-icon" />
                  <div className="empty-artwork-text">No inclusion image uploaded yet</div>
                </div>
              )}
              
              <div className="artwork-upload">
                <label className="artwork-upload-input">
                  <FontAwesomeIcon icon={faUpload} className="artwork-upload-icon" />
                  <span className="artwork-upload-text">Click or drag to upload inclusion image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'inclusion')}
                    disabled={uploading.inclusion}
                  />
                </label>
                {uploading.inclusion && (
                  <div className="uploading-indicator">
                    <div className="uploading-spinner"></div>
                    <span>Uploading...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductionDetails;
