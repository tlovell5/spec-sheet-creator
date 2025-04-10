import React, { useContext } from 'react';
import { SpecSheetContext } from '../context/SpecSheetContext';
import { SectionContainer } from './common';

const PackagingClaims = () => {
  const { specSheetData, setSpecSheetData } = useContext(SpecSheetContext);
  
  // Allergen options
  const allergenOptions = [
    { id: 'none', label: 'None' },
    { id: 'milk', label: 'Milk' },
    { id: 'eggs', label: 'Eggs' },
    { id: 'fish', label: 'Fish' },
    { id: 'shellfish', label: 'Shellfish' },
    { id: 'tree_nuts', label: 'Tree Nuts' },
    { id: 'peanuts', label: 'Peanuts' },
    { id: 'wheat', label: 'Wheat' },
    { id: 'soybeans', label: 'Soybeans' },
    { id: 'sesame', label: 'Sesame' }
  ];
  
  // Packaging claim options
  const packagingClaimOptions = [
    { id: 'gluten_free', label: 'Gluten Free' },
    { id: 'organic', label: 'Organic' },
    { id: 'non_gmo', label: 'Non-GMO' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'kosher', label: 'Kosher' },
    { id: 'halal', label: 'Halal' },
    { id: 'sugar_free', label: 'Sugar Free' },
    { id: 'dairy_free', label: 'Dairy Free' },
    { id: 'nut_free', label: 'Nut Free' },
    { id: 'soy_free', label: 'Soy Free' },
    { id: 'egg_free', label: 'Egg Free' },
    { id: 'no_artificial_colors', label: 'No Artificial Colors' },
    { id: 'no_artificial_flavors', label: 'No Artificial Flavors' },
    { id: 'no_preservatives', label: 'No Preservatives' }
  ];
  
  // Handle allergen selection
  const handleAllergenChange = (allergenId) => {
    let updatedAllergens = [...(specSheetData.packagingClaims?.allergens || [])];
    
    // Special handling for "None" option
    if (allergenId === 'none') {
      // If "None" is being selected, clear all other selections
      updatedAllergens = ['none'];
    } else {
      // If any other allergen is being selected, remove "None" if it's selected
      updatedAllergens = updatedAllergens.filter(id => id !== 'none');
      
      // Toggle the selected allergen
      if (updatedAllergens.includes(allergenId)) {
        updatedAllergens = updatedAllergens.filter(id => id !== allergenId);
      } else {
        updatedAllergens.push(allergenId);
      }
    }
    
    setSpecSheetData(prevData => ({
      ...prevData,
      packagingClaims: {
        ...prevData.packagingClaims,
        allergens: updatedAllergens
      }
    }));
  };
  
  // Handle packaging claim selection
  const handleClaimChange = (claimId) => {
    let updatedClaims = [...(specSheetData.packagingClaims?.claims || [])];
    
    // Toggle the selected claim
    if (updatedClaims.includes(claimId)) {
      updatedClaims = updatedClaims.filter(id => id !== claimId);
    } else {
      updatedClaims.push(claimId);
    }
    
    setSpecSheetData(prevData => ({
      ...prevData,
      packagingClaims: {
        ...prevData.packagingClaims,
        claims: updatedClaims
      }
    }));
  };

  return (
    <SectionContainer id="packagingClaims" title="Packaging Claims">
      <div className="subsection">
        <h3 className="subsection-title">Allergen Claims</h3>
        <p className="subsection-description">Select all allergens present in the product, or select "None" if no allergens are present.</p>
        
        <div className="checkbox-grid">
          {allergenOptions.map(allergen => (
            <div className="checkbox-item" key={allergen.id}>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={(specSheetData.packagingClaims?.allergens || []).includes(allergen.id)}
                  onChange={() => handleAllergenChange(allergen.id)}
                  className="checkbox-input"
                />
                <span className="checkbox-text">{allergen.label}</span>
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="subsection">
        <h3 className="subsection-title">Product Claims</h3>
        <p className="subsection-description">Select all claims that apply to this product.</p>
        
        <div className="checkbox-grid">
          {packagingClaimOptions.map(claim => (
            <div className="checkbox-item" key={claim.id}>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={(specSheetData.packagingClaims?.claims || []).includes(claim.id)}
                  onChange={() => handleClaimChange(claim.id)}
                  className="checkbox-input"
                />
                <span className="checkbox-text">{claim.label}</span>
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="subsection">
        <h3 className="subsection-title">Additional Claims</h3>
        <p className="subsection-description">Enter any additional claims or certifications.</p>
        
        <textarea
          className="form-control"
          value={specSheetData.packagingClaims?.additionalClaims || ''}
          onChange={(e) => {
            setSpecSheetData(prevData => ({
              ...prevData,
              packagingClaims: {
                ...prevData.packagingClaims,
                additionalClaims: e.target.value
              }
            }));
          }}
          placeholder="Enter additional claims or certifications"
          rows="3"
        ></textarea>
      </div>
    </SectionContainer>
  );
};

export default PackagingClaims;
