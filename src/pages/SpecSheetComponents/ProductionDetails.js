import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
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
  unitClaimWeight
}) {
  const [productionDetails, setProductionDetails] = useState({
    packaging_weight_g: 0,
    inclusion_weight_g: 0,
    ingredient_weight_g: 0,
    net_weight_g: 0,
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

  // Fetch production details when component mounts
  useEffect(() => {
    const fetchProductionDetails = async () => {
      if (!specSheetId) return;
      
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
        const ingredientWeightG = convertToGrams(unitClaimWeight);
        
        const newProductionDetails = {
          spec_sheet_id: specSheetId,
          packaging_weight_g: 0,
          inclusion_weight_g: 0,
          ingredient_weight_g: ingredientWeightG,
          net_weight_g: ingredientWeightG,
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
    };
    
    fetchProductionDetails();
  }, [specSheetId, unitClaimWeight]);

  // Update ingredient weight when unit claim weight changes
  useEffect(() => {
    if (unitClaimWeight) {
      const ingredientWeightG = convertToGrams(unitClaimWeight);
      
      setProductionDetails(prev => {
        const netWeight = ingredientWeightG + 
          (prev.packaging_weight_g || 0) + 
          (prev.inclusion_weight_g || 0);
        
        return {
          ...prev,
          ingredient_weight_g: ingredientWeightG,
          net_weight_g: netWeight
        };
      });
      
      // Save the updated values
      saveProductionDetails({
        ...productionDetails,
        ingredient_weight_g: ingredientWeightG,
        net_weight_g: ingredientWeightG + 
          (productionDetails.packaging_weight_g || 0) + 
          (productionDetails.inclusion_weight_g || 0)
      });
    }
  }, [unitClaimWeight]);

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
    if (!specSheetId) return;
    
    const { error } = await supabase
      .from('production_details')
      .update(details)
      .eq('spec_sheet_id', specSheetId);
    
    if (error) {
      console.error('Error saving production details:', error);
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
      const filePath = `production-details/${fileName}`;
      
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
        front: 'front_artwork_url',
        back: 'back_artwork_url',
        lotCode: 'lot_code_placement_url',
        inclusion: 'inclusion_image_url'
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
              {`${shelfLifeYears || 0} years, ${shelfLifeMonths || 0} months`}
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
              className="weight-card-input"
              value={productionDetails.packaging_weight_g || ''}
              onChange={(e) => handleChange('packaging_weight_g', Number(e.target.value))}
              placeholder="Enter weight in grams"
            />
          </div>
          
          <div className="weight-card">
            <div className="weight-card-header">
              <div className="weight-card-label">Inclusion Weight (g)</div>
              <FontAwesomeIcon icon={faLeaf} className="weight-card-icon" />
            </div>
            <input
              type="number"
              id="inclusion_weight_g"
              className="weight-card-input"
              value={productionDetails.inclusion_weight_g || ''}
              onChange={(e) => handleChange('inclusion_weight_g', Number(e.target.value))}
              placeholder="Enter weight in grams"
            />
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
              value={productionDetails.ingredient_weight_g || ''}
              disabled
              placeholder="Calculated automatically"
            />
          </div>
          
          <div className="weight-card">
            <div className="weight-card-header">
              <div className="weight-card-label">Unit Packaging Claim Weight (g)</div>
              <FontAwesomeIcon icon={faTag} className="weight-card-icon" />
            </div>
            <input
              type="number"
              id="net_weight_g"
              className="weight-card-input calculated-field"
              value={productionDetails.net_weight_g || ''}
              disabled
              placeholder="Calculated automatically"
            />
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
