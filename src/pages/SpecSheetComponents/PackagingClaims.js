import React, { useState, useEffect } from 'react';
import { 
  faShieldAlt, 
  faLeaf, 
  faCheck, 
  faPlus, 
  faTimes, 
  faSearch, 
  faInfoCircle,
  faAward,
  faHeartbeat,
  faRecycle,
  faWheatAlt,
  faCertificate,
  faSeedling
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const PackagingClaims = ({ formData = {}, setFormData }) => {
  // State for allergens and packaging claims
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [selectedPackagingClaims, setSelectedPackagingClaims] = useState([]);
  const [customClaims, setCustomClaims] = useState([]);
  const [newCustomClaim, setNewCustomClaim] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Load data from formData on component mount
  useEffect(() => {
    if (formData && formData.allergens) {
      setSelectedAllergens(formData.allergens);
    }
    if (formData && formData.packagingClaims) {
      setSelectedPackagingClaims(formData.packagingClaims);
    }
    if (formData && formData.customClaims) {
      setCustomClaims(formData.customClaims);
    }
  }, [formData]);

  // Update formData when selections change
  useEffect(() => {
    if (setFormData) {
      setFormData({
        ...formData,
        allergens: selectedAllergens,
        packagingClaims: selectedPackagingClaims,
        customClaims: customClaims
      });
    }
  }, [selectedAllergens, selectedPackagingClaims, customClaims, setFormData, formData]);

  // Allergen options
  const allergenOptions = [
    { id: 'contains-milk', label: 'Contains Milk', help: 'Product contains milk or milk derivatives' },
    { id: 'contains-eggs', label: 'Contains Eggs', help: 'Product contains eggs or egg derivatives' },
    { id: 'contains-fish', label: 'Contains Fish', help: 'Product contains fish or fish derivatives' },
    { id: 'contains-shellfish', label: 'Contains Shellfish', help: 'Product contains shellfish or shellfish derivatives' },
    { id: 'contains-tree-nuts', label: 'Contains Tree Nuts', help: 'Product contains tree nuts or tree nut derivatives' },
    { id: 'contains-peanuts', label: 'Contains Peanuts', help: 'Product contains peanuts or peanut derivatives' },
    { id: 'contains-wheat', label: 'Contains Wheat', help: 'Product contains wheat or wheat derivatives' },
    { id: 'contains-soybeans', label: 'Contains Soybeans', help: 'Product contains soybeans or soybean derivatives' },
    { id: 'contains-sesame', label: 'Contains Sesame', help: 'Product contains sesame or sesame derivatives' },
  ];

  // Packaging claim options by category
  const packagingClaimOptions = {
    dietary: [
      { id: 'gluten-free', label: 'Gluten Free', help: 'Product does not contain gluten' },
      { id: 'vegan', label: 'Vegan', help: 'Product contains no animal products' },
      { id: 'vegetarian', label: 'Vegetarian', help: 'Product contains no meat' },
      { id: 'dairy-free', label: 'Dairy Free', help: 'Product contains no dairy' },
      { id: 'kosher', label: 'Kosher', help: 'Product meets kosher dietary requirements' },
      { id: 'halal', label: 'Halal', help: 'Product meets halal dietary requirements' },
      { id: 'non-gmo', label: 'Non-GMO', help: 'Product contains no genetically modified organisms' },
      { id: 'keto-friendly', label: 'Keto Friendly', help: 'Product is suitable for ketogenic diets' },
      { id: 'paleo-friendly', label: 'Paleo Friendly', help: 'Product is suitable for paleolithic diets' },
    ],
    certifications: [
      { id: 'usda-organic', label: 'USDA Organic', help: 'Product is certified organic by USDA' },
      { id: 'fair-trade', label: 'Fair Trade', help: 'Product is certified fair trade' },
      { id: 'rainforest-alliance', label: 'Rainforest Alliance', help: 'Product is Rainforest Alliance certified' },
      { id: 'b-corp', label: 'B Corp', help: 'Company is B Corporation certified' },
    ],
    ingredients: [
      { id: 'no-artificial-flavors', label: 'No Artificial Flavors', help: 'Product contains no artificial flavors' },
      { id: 'no-artificial-colors', label: 'No Artificial Colors', help: 'Product contains no artificial colors' },
      { id: 'no-preservatives', label: 'No Preservatives', help: 'Product contains no preservatives' },
      { id: 'no-added-sugar', label: 'No Added Sugar', help: 'Product contains no added sugar' },
      { id: 'no-high-fructose-corn-syrup', label: 'No High Fructose Corn Syrup', help: 'Product contains no high fructose corn syrup' },
    ],
    sustainability: [
      { id: 'recyclable-packaging', label: 'Recyclable Packaging', help: 'Packaging can be recycled' },
      { id: 'biodegradable-packaging', label: 'Biodegradable Packaging', help: 'Packaging is biodegradable' },
      { id: 'compostable-packaging', label: 'Compostable Packaging', help: 'Packaging is compostable' },
      { id: 'carbon-neutral', label: 'Carbon Neutral', help: 'Product has a net zero carbon footprint' },
      { id: 'sustainably-sourced', label: 'Sustainably Sourced', help: 'Ingredients are sustainably sourced' },
    ],
  };

  // Handle allergen checkbox change
  const handleAllergenChange = (allergerId) => {
    if (selectedAllergens.includes(allergerId)) {
      setSelectedAllergens(selectedAllergens.filter(id => id !== allergerId));
    } else {
      setSelectedAllergens([...selectedAllergens, allergerId]);
    }
  };

  // Handle packaging claim checkbox change
  const handlePackagingClaimChange = (claimId) => {
    if (selectedPackagingClaims.includes(claimId)) {
      setSelectedPackagingClaims(selectedPackagingClaims.filter(id => id !== claimId));
    } else {
      setSelectedPackagingClaims([...selectedPackagingClaims, claimId]);
    }
  };

  // Add custom claim
  const addCustomClaim = () => {
    if (newCustomClaim.trim() !== '') {
      setCustomClaims([...customClaims, newCustomClaim.trim()]);
      setNewCustomClaim('');
    }
  };

  // Remove custom claim
  const removeCustomClaim = (index) => {
    const updatedClaims = [...customClaims];
    updatedClaims.splice(index, 1);
    setCustomClaims(updatedClaims);
  };

  // Handle custom claim input change
  const handleCustomClaimChange = (e) => {
    setNewCustomClaim(e.target.value);
  };

  // Handle custom claim input key press (Enter)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomClaim();
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Filter claims based on search term
  const filterClaimsBySearch = (claims) => {
    if (!searchTerm) return claims;
    
    return claims.filter(claim => 
      claim.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
      claim.help.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Count total selected claims
  const totalSelectedClaims = selectedAllergens.length + selectedPackagingClaims.length + customClaims.length;

  // Get all claims for search filtering
  const getAllClaimsForSearch = () => {
    const allClaims = [
      ...allergenOptions.map(claim => ({ ...claim, category: 'allergens' })),
      ...Object.entries(packagingClaimOptions).flatMap(([category, claims]) => 
        claims.map(claim => ({ ...claim, category }))
      )
    ];
    
    if (searchTerm) {
      return allClaims.filter(claim => 
        claim.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
        claim.help.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return [];
  };

  // Get filtered claims
  const filteredClaims = getAllClaimsForSearch();
  
  // Check if any claims match the search
  const hasSearchResults = searchTerm ? filteredClaims.length > 0 : true;

  // Count selected claims by category
  const countSelectedByCategory = (category) => {
    if (category === 'allergens') {
      return selectedAllergens.length;
    }
    
    return packagingClaimOptions[category]?.filter(claim => 
      selectedPackagingClaims.includes(claim.id)
    ).length || 0;
  };

  return (
    <div className="packaging-claims-container">
      {/* Search bar */}
      <div className="claims-search-bar">
        <div className="search-input">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Search for claims..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="form-control"
          />
          {searchTerm && (
            <button className="clear-search" onClick={clearSearch}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
        <div className="selected-summary">
          <span className="selected-count">{totalSelectedClaims}</span>
          claims selected
        </div>
      </div>

      {/* Claims grid layout */}
      <div className="claims-grid-layout">
        {/* Allergens Section */}
        <div className="claims-section">
          <div className="section-header">
            <div className="header-left">
              <FontAwesomeIcon icon={faShieldAlt} className="section-icon" />
              <span>Allergen Claims</span>
            </div>
            <div className="header-right">
              {countSelectedByCategory('allergens') > 0 && (
                <span className="selected-badge">
                  {countSelectedByCategory('allergens')} selected
                </span>
              )}
            </div>
          </div>
          
          <div className="section-content">
            <div className="highlight-item">
              <div className="info-message">
                <FontAwesomeIcon icon={faInfoCircle} />
                <span>Select all allergens that apply to your product. These will be clearly displayed on your spec sheet.</span>
              </div>
            </div>
            <div className="allergen-grid">
              {filterClaimsBySearch(allergenOptions).map((allergen) => (
                <div 
                  key={allergen.id} 
                  className={`checkbox-item ${selectedAllergens.includes(allergen.id) ? 'selected-claim' : ''}`}
                >
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={allergen.id}
                      checked={selectedAllergens.includes(allergen.id)}
                      onChange={() => handleAllergenChange(allergen.id)}
                    />
                    <label className="form-check-label" htmlFor={allergen.id}>
                      <div>
                        <span className="checkbox-label">{allergen.label}</span>
                        <span className="checkbox-help">{allergen.help}</span>
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dietary Claims Section */}
        <div className="claims-section">
          <div className="section-header">
            <div className="header-left">
              <FontAwesomeIcon icon={faHeartbeat} className="section-icon" />
              <span>Dietary Claims</span>
            </div>
            <div className="header-right">
              {countSelectedByCategory('dietary') > 0 && (
                <span className="selected-badge">
                  {countSelectedByCategory('dietary')} selected
                </span>
              )}
            </div>
          </div>
          
          <div className="section-content">
            <div className="claims-grid">
              {filterClaimsBySearch(packagingClaimOptions.dietary).map((claim) => (
                <div 
                  key={claim.id} 
                  className={`checkbox-item ${selectedPackagingClaims.includes(claim.id) ? 'selected-claim' : ''}`}
                >
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={claim.id}
                      checked={selectedPackagingClaims.includes(claim.id)}
                      onChange={() => handlePackagingClaimChange(claim.id)}
                    />
                    <label className="form-check-label" htmlFor={claim.id}>
                      <div>
                        <span className="checkbox-label">{claim.label}</span>
                        <span className="checkbox-help">{claim.help}</span>
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Certifications Section */}
        <div className="claims-section">
          <div className="section-header">
            <div className="header-left">
              <FontAwesomeIcon icon={faCertificate} className="section-icon" />
              <span>Certifications</span>
            </div>
            <div className="header-right">
              {countSelectedByCategory('certifications') > 0 && (
                <span className="selected-badge">
                  {countSelectedByCategory('certifications')} selected
                </span>
              )}
            </div>
          </div>
          
          <div className="section-content">
            <div className="claims-grid">
              {filterClaimsBySearch(packagingClaimOptions.certifications).map((claim) => (
                <div 
                  key={claim.id} 
                  className={`checkbox-item ${selectedPackagingClaims.includes(claim.id) ? 'selected-claim' : ''}`}
                >
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={claim.id}
                      checked={selectedPackagingClaims.includes(claim.id)}
                      onChange={() => handlePackagingClaimChange(claim.id)}
                    />
                    <label className="form-check-label" htmlFor={claim.id}>
                      <div>
                        <span className="checkbox-label">{claim.label}</span>
                        <span className="checkbox-help">{claim.help}</span>
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ingredients Section */}
        <div className="claims-section">
          <div className="section-header">
            <div className="header-left">
              <FontAwesomeIcon icon={faCheck} className="section-icon" />
              <span>Ingredient Claims</span>
            </div>
            <div className="header-right">
              {countSelectedByCategory('ingredients') > 0 && (
                <span className="selected-badge">
                  {countSelectedByCategory('ingredients')} selected
                </span>
              )}
            </div>
          </div>
          
          <div className="section-content">
            <div className="claims-grid">
              {filterClaimsBySearch(packagingClaimOptions.ingredients).map((claim) => (
                <div 
                  key={claim.id} 
                  className={`checkbox-item ${selectedPackagingClaims.includes(claim.id) ? 'selected-claim' : ''}`}
                >
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={claim.id}
                      checked={selectedPackagingClaims.includes(claim.id)}
                      onChange={() => handlePackagingClaimChange(claim.id)}
                    />
                    <label className="form-check-label" htmlFor={claim.id}>
                      <div>
                        <span className="checkbox-label">{claim.label}</span>
                        <span className="checkbox-help">{claim.help}</span>
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sustainability Section */}
        <div className="claims-section">
          <div className="section-header">
            <div className="header-left">
              <FontAwesomeIcon icon={faRecycle} className="section-icon" />
              <span>Sustainability Claims</span>
            </div>
            <div className="header-right">
              {countSelectedByCategory('sustainability') > 0 && (
                <span className="selected-badge">
                  {countSelectedByCategory('sustainability')} selected
                </span>
              )}
            </div>
          </div>
          
          <div className="section-content">
            <div className="claims-grid">
              {filterClaimsBySearch(packagingClaimOptions.sustainability).map((claim) => (
                <div 
                  key={claim.id} 
                  className={`checkbox-item ${selectedPackagingClaims.includes(claim.id) ? 'selected-claim' : ''}`}
                >
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={claim.id}
                      checked={selectedPackagingClaims.includes(claim.id)}
                      onChange={() => handlePackagingClaimChange(claim.id)}
                    />
                    <label className="form-check-label" htmlFor={claim.id}>
                      <div>
                        <span className="checkbox-label">{claim.label}</span>
                        <span className="checkbox-help">{claim.help}</span>
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Claims Section */}
        <div className="claims-section">
          <div className="section-header">
            <div className="header-left">
              <FontAwesomeIcon icon={faPlus} className="section-icon" />
              <span>Custom Claims</span>
            </div>
            <div className="header-right">
              {customClaims.length > 0 && (
                <span className="selected-badge">
                  {customClaims.length} added
                </span>
              )}
            </div>
          </div>
          
          <div className="section-content">
            <div className="custom-claims-container">
              <div className="custom-claims-input-area">
                <div className="info-message">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  <span>Add any additional claims that are not listed in the categories above.</span>
                </div>
                <div className="custom-claims-input">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter custom claim..."
                    value={newCustomClaim}
                    onChange={handleCustomClaimChange}
                    onKeyPress={handleKeyPress}
                  />
                  <button 
                    className="btn btn-primary" 
                    onClick={addCustomClaim}
                    disabled={!newCustomClaim.trim()}
                  >
                    <FontAwesomeIcon icon={faPlus} /> Add
                  </button>
                </div>
              </div>
              
              <div className="custom-claims-list-container">
                <div className="custom-claims-list">
                  {customClaims.length > 0 ? (
                    customClaims.map((claim, index) => (
                      <div key={index} className="custom-claim-item">
                        <div className="custom-claim-text">
                          {claim}
                        </div>
                        <button 
                          className="remove-button"
                          onClick={() => removeCustomClaim(index)}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="empty-claims">
                      <FontAwesomeIcon icon={faPlus} className="empty-icon" />
                      <p className="no-items-message">No custom claims added yet</p>
                      <p className="empty-help">Add custom claims using the form on the left</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* No results message */}
        {searchTerm && !hasSearchResults && (
          <div className="no-results">
            No claims found matching "{searchTerm}". Try a different search term.
          </div>
        )}
      </div>
    </div>
  );
};

export default PackagingClaims;
