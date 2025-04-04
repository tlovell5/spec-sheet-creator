import React, { useState, useEffect } from 'react';

function PackagingClaims({ data, onChange }) {
  // Define allergen options
  const allergenOptions = [
    'Milk', 'Eggs', 'Fish', 'Crustacean Shellfish', 'Tree Nuts', 
    'Peanuts', 'Wheat', 'Soybeans', 'Sesame'
  ];

  // Define packaging claim options
  const packagingClaimOptions = [
    'Gluten Free', 'Vegan', 'Vegetarian', 'Organic', 'Non-GMO', 
    'Kosher', 'Halal', 'No Artificial Flavors', 'No Artificial Colors', 
    'No Preservatives', 'Sustainably Sourced', 'Fair Trade'
  ];

  // Initialize state for allergens and packaging claims
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [selectedPackagingClaims, setSelectedPackagingClaims] = useState([]);
  const [noAllergens, setNoAllergens] = useState(false);

  // Load data from props when component mounts or data changes
  useEffect(() => {
    if (data) {
      // Parse JSON strings if they exist
      if (data.allergens) {
        try {
          const allergens = typeof data.allergens === 'string' 
            ? JSON.parse(data.allergens) 
            : data.allergens;
          
          setSelectedAllergens(allergens);
          
          // Check if "None" is selected
          setNoAllergens(allergens.includes('None'));
        } catch (error) {
          console.error('Error parsing allergens:', error);
          setSelectedAllergens([]);
        }
      }

      if (data.packaging_claims) {
        try {
          const claims = typeof data.packaging_claims === 'string' 
            ? JSON.parse(data.packaging_claims) 
            : data.packaging_claims;
          
          setSelectedPackagingClaims(claims);
        } catch (error) {
          console.error('Error parsing packaging claims:', error);
          setSelectedPackagingClaims([]);
        }
      }
    }
  }, [data]);

  // Handle allergen checkbox changes
  const handleAllergenChange = (allergen) => {
    let updatedAllergens;

    if (allergen === 'None') {
      // If "None" is selected, clear all other selections
      if (!noAllergens) {
        updatedAllergens = ['None'];
        setNoAllergens(true);
      } else {
        updatedAllergens = [];
        setNoAllergens(false);
      }
    } else {
      // If any other allergen is selected, remove "None" if it's selected
      if (selectedAllergens.includes(allergen)) {
        updatedAllergens = selectedAllergens.filter(a => a !== allergen);
      } else {
        updatedAllergens = [...selectedAllergens.filter(a => a !== 'None'), allergen];
        setNoAllergens(false);
      }
    }

    setSelectedAllergens(updatedAllergens);
    onChange('packagingClaims', 'allergens', JSON.stringify(updatedAllergens));
  };

  // Handle packaging claim checkbox changes
  const handlePackagingClaimChange = (claim) => {
    let updatedClaims;

    if (selectedPackagingClaims.includes(claim)) {
      updatedClaims = selectedPackagingClaims.filter(c => c !== claim);
    } else {
      updatedClaims = [...selectedPackagingClaims, claim];
    }

    setSelectedPackagingClaims(updatedClaims);
    onChange('packagingClaims', 'packaging_claims', JSON.stringify(updatedClaims));
  };

  return (
    <div className="packaging-claims-container">
      <div className="allergen-claims-section">
        <h4>Allergen Claims</h4>
        <p>Select all allergens that apply to this product:</p>
        
        <div className="checkbox-group">
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="allergen-none"
              checked={noAllergens}
              onChange={() => handleAllergenChange('None')}
            />
            <label htmlFor="allergen-none">None</label>
          </div>
          
          {allergenOptions.map(allergen => (
            <div className="checkbox-item" key={`allergen-${allergen}`}>
              <input
                type="checkbox"
                id={`allergen-${allergen}`}
                checked={selectedAllergens.includes(allergen)}
                onChange={() => handleAllergenChange(allergen)}
                disabled={noAllergens}
              />
              <label htmlFor={`allergen-${allergen}`}>{allergen}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="packaging-claims-section">
        <h4>Packaging Claims</h4>
        <p>Select all claims that apply to this product:</p>
        
        <div className="checkbox-group">
          {packagingClaimOptions.map(claim => (
            <div className="checkbox-item" key={`claim-${claim}`}>
              <input
                type="checkbox"
                id={`claim-${claim}`}
                checked={selectedPackagingClaims.includes(claim)}
                onChange={() => handlePackagingClaimChange(claim)}
              />
              <label htmlFor={`claim-${claim}`}>{claim}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PackagingClaims;
