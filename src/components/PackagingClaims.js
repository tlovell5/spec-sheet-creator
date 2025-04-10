import React, { useContext } from 'react';
import { SpecSheetContext } from '../context/SpecSheetContext';

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
    <div className="card spec-sheet-section">
      <div className="card-header spec-sheet-section-header">
        <h2 className="spec-sheet-section-title">Packaging Claims</h2>
      </div>
      
      <div className="card-body">
        <div className="form-section mb-4">
          <h3 className="mb-3">Allergen Claims</h3>
          <p className="text-muted mb-3">Select all allergens present in the product, or select "None" if no allergens are present.</p>
          
          <div className="allergen-options">
            {allergenOptions.map(allergen => (
              <div 
                key={allergen.id}
                className={`claim-option ${(specSheetData.packagingClaims?.allergens || []).includes(allergen.id) ? 'selected' : ''}`}
                onClick={() => handleAllergenChange(allergen.id)}
              >
                <div className="custom-checkbox">
                  {(specSheetData.packagingClaims?.allergens || []).includes(allergen.id) && (
                    <span className="checkmark">✓</span>
                  )}
                </div>
                <span className="claim-label">{allergen.label}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="form-section">
          <h3 className="mb-3">Packaging Claims</h3>
          <p className="text-muted mb-3">Select all claims that will appear on the product packaging.</p>
          
          <div className="packaging-claims-options">
            {packagingClaimOptions.map(claim => (
              <div 
                key={claim.id}
                className={`claim-option ${(specSheetData.packagingClaims?.claims || []).includes(claim.id) ? 'selected' : ''}`}
                onClick={() => handleClaimChange(claim.id)}
              >
                <div className="custom-checkbox">
                  {(specSheetData.packagingClaims?.claims || []).includes(claim.id) && (
                    <span className="checkmark">✓</span>
                  )}
                </div>
                <span className="claim-label">{claim.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style jsx="true">{`
        .allergen-options,
        .packaging-claims-options {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .claim-option {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 150px;
        }
        
        .claim-option:hover {
          border-color: #2e7d32;
          background-color: rgba(46, 125, 50, 0.05);
        }
        
        .claim-option.selected {
          border-color: #2e7d32;
          background-color: rgba(46, 125, 50, 0.1);
        }
        
        .custom-checkbox {
          width: 18px;
          height: 18px;
          border: 1px solid #aaa;
          border-radius: 3px;
          margin-right: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .claim-option.selected .custom-checkbox {
          background-color: #2e7d32;
          border-color: #2e7d32;
        }
        
        .checkmark {
          color: white;
          font-size: 12px;
          line-height: 1;
        }
        
        .claim-label {
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default PackagingClaims;
