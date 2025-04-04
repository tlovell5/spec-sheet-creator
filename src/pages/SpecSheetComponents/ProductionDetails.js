import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

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
    
    // Recalculate net weight if packaging or inclusion weight changes
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
      <div className="form-row">
        <div className="form-group">
          <label>Unit UPC</label>
          <input
            type="text"
            className="form-control"
            value={unitUpc || ''}
            disabled
          />
        </div>
        <div className="form-group">
          <label>Lot Code Format</label>
          <input
            type="text"
            className="form-control"
            value={lotCodeFormat || ''}
            disabled
          />
        </div>
        <div className="form-group">
          <label>Shelf Life</label>
          <input
            type="text"
            className="form-control"
            value={`${shelfLifeYears || 0} years, ${shelfLifeMonths || 0} months`}
            disabled
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="packaging_weight_g">Packaging Weight (g)</label>
          <input
            type="number"
            id="packaging_weight_g"
            className="form-control"
            value={productionDetails.packaging_weight_g || ''}
            onChange={(e) => handleChange('packaging_weight_g', Number(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label htmlFor="inclusion_weight_g">Inclusion Weight (g)</label>
          <input
            type="number"
            id="inclusion_weight_g"
            className="form-control"
            value={productionDetails.inclusion_weight_g || ''}
            onChange={(e) => handleChange('inclusion_weight_g', Number(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label htmlFor="ingredient_weight_g">Ingredient Weight (g)</label>
          <input
            type="number"
            id="ingredient_weight_g"
            className="form-control"
            value={productionDetails.ingredient_weight_g || ''}
            disabled
          />
        </div>
        <div className="form-group">
          <label htmlFor="net_weight_g">Unit Net Weight (g)</label>
          <input
            type="number"
            id="net_weight_g"
            className="form-control"
            value={productionDetails.net_weight_g || ''}
            disabled
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label className="file-upload-label">Front Artwork</label>
          <div className="file-upload">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'front')}
              disabled={uploading.front}
              className="file-upload-input"
            />
            {uploading.front && <p>Uploading...</p>}
            {productionDetails.front_artwork_url && (
              <div className="image-preview">
                <img 
                  src={productionDetails.front_artwork_url} 
                  alt="Front Artwork" 
                  style={{ maxWidth: '200px', marginTop: '10px' }} 
                />
              </div>
            )}
          </div>
        </div>
        <div className="form-group">
          <label className="file-upload-label">Back Artwork</label>
          <div className="file-upload">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'back')}
              disabled={uploading.back}
              className="file-upload-input"
            />
            {uploading.back && <p>Uploading...</p>}
            {productionDetails.back_artwork_url && (
              <div className="image-preview">
                <img 
                  src={productionDetails.back_artwork_url} 
                  alt="Back Artwork" 
                  style={{ maxWidth: '200px', marginTop: '10px' }} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label className="file-upload-label">Lot Code Placement</label>
          <div className="file-upload">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'lotCode')}
              disabled={uploading.lotCode}
              className="file-upload-input"
            />
            {uploading.lotCode && <p>Uploading...</p>}
            {productionDetails.lot_code_placement_url && (
              <div className="image-preview">
                <img 
                  src={productionDetails.lot_code_placement_url} 
                  alt="Lot Code Placement" 
                  style={{ maxWidth: '200px', marginTop: '10px' }} 
                />
              </div>
            )}
          </div>
        </div>
        <div className="form-group">
          <label className="file-upload-label">Inclusion Image</label>
          <div className="file-upload">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'inclusion')}
              disabled={uploading.inclusion}
              className="file-upload-input"
            />
            {uploading.inclusion && <p>Uploading...</p>}
            {productionDetails.inclusion_image_url && (
              <div className="image-preview">
                <img 
                  src={productionDetails.inclusion_image_url} 
                  alt="Inclusion" 
                  style={{ maxWidth: '200px', marginTop: '10px' }} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductionDetails;
