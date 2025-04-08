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

  // CSS styles for horizontal layout
  const styles = {
    packagingClaimsContainer: {
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    claimsSearchBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      backgroundColor: 'white',
      borderRadius: '10px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    },
    searchInput: {
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      flex: '1',
      marginRight: '15px',
    },
    searchIcon: {
      position: 'absolute',
      left: '12px',
      color: '#6b7280',
    },
    formControl: {
      paddingLeft: '36px',
      borderRadius: '6px',
      border: '1px solid #d1d5db',
      padding: '8px 12px',
      width: '100%',
    },
    clearSearch: {
      position: 'absolute',
      right: '12px',
      background: 'none',
      border: 'none',
      color: '#6b7280',
      cursor: 'pointer',
    },
    selectedSummary: {
      display: 'flex',
      alignItems: 'center',
      fontWeight: '500',
    },
    selectedCount: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#2e7d32',
      color: 'white',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      fontSize: '0.85rem',
      marginRight: '8px',
    },
    claimsGridLayout: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      width: '100%',
    },
    claimsSection: {
      backgroundColor: 'white',
      borderRadius: '10px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      width: '100%',
    },
    sectionHeader: {
      padding: '12px 16px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#f9fafb',
      borderTopLeftRadius: '10px',
      borderTopRightRadius: '10px',
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: '600',
    },
    sectionIcon: {
      color: '#2e7d32',
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
    },
    selectedBadge: {
      backgroundColor: 'rgba(46, 125, 50, 0.1)',
      color: '#2e7d32',
      borderRadius: '20px',
      padding: '4px 10px',
      fontSize: '0.85rem',
      fontWeight: '500',
    },
    sectionContent: {
      padding: '16px',
      overflowX: 'auto',
      width: '100%',
    },
    highlightItem: {
      marginBottom: '12px',
    },
    infoMessage: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      backgroundColor: 'rgba(2, 136, 209, 0.08)',
      padding: '12px',
      borderRadius: '6px',
      fontSize: '0.9rem',
      color: '#0277bd',
    },
    allergenGrid: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: '8px',
      width: '100%',
    },
    claimsGrid: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: '8px',
      width: '100%',
    },
    checkboxItem: {
      padding: '6px 10px',
      borderRadius: '6px',
      transition: 'background-color 0.2s',
      width: 'auto',
      minWidth: '150px',
      maxWidth: '200px',
      flex: '1 0 auto',
      marginBottom: '4px',
    },
    selectedClaim: {
      backgroundColor: 'rgba(46, 125, 50, 0.1)',
      border: '1px solid rgba(46, 125, 50, 0.2)',
    },
    formCheck: {
      display: 'flex',
      alignItems: 'flex-start',
    },
    formCheckInput: {
      marginTop: '3px',
      marginRight: '10px',
    },
    formCheckLabel: {
      display: 'flex',
      flexDirection: 'column',
      fontSize: '0.9rem',
    },
    checkboxLabel: {
      fontWeight: '500',
      marginBottom: '2px',
      fontSize: '0.9rem',
    },
    checkboxHelp: {
      fontSize: '0.8rem',
      color: '#6b7280',
    },
    customClaimsContainer: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
    },
    customClaimsInputArea: {
      marginBottom: '16px',
      width: '100%',
    },
    customClaimsInput: {
      display: 'flex',
      gap: '10px',
      marginTop: '12px',
    },
    btnPrimary: {
      backgroundColor: '#2e7d32',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
    },
    customClaimsListContainer: {
      flex: '1',
    },
    customClaimsList: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: '8px',
      width: '100%',
    },
    customClaimItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#f9fafb',
      padding: '6px 10px',
      borderRadius: '6px',
      border: '1px solid #e5e7eb',
      minWidth: '150px',
      maxWidth: '200px',
      flex: '1 0 auto',
      marginBottom: '4px',
    },
    customClaimText: {
      fontWeight: '500',
    },
    removeButton: {
      background: 'none',
      border: 'none',
      color: '#ef4444',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '24px',
      height: '24px',
      borderRadius: '50%',
    },
    emptyClaims: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      backgroundColor: '#f9fafb',
      borderRadius: '6px',
      color: '#6b7280',
      textAlign: 'center',
    },
    emptyIcon: {
      fontSize: '1.5rem',
      marginBottom: '12px',
      opacity: '0.5',
    },
    noItemsMessage: {
      fontWeight: '500',
      marginBottom: '4px',
    },
    emptyHelp: {
      fontSize: '0.85rem',
    },
    noResults: {
      padding: '20px',
      backgroundColor: '#f9fafb',
      borderRadius: '10px',
      textAlign: 'center',
      color: '#6b7280',
      marginTop: '20px',
    },
  };

  return (
    <div style={styles.packagingClaimsContainer}>
      {/* Search bar */}
      <div style={styles.claimsSearchBar}>
        <div style={styles.searchInput}>
          <FontAwesomeIcon icon={faSearch} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search for claims..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={styles.formControl}
          />
          {searchTerm && (
            <button style={styles.clearSearch} onClick={clearSearch}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
        <div style={styles.selectedSummary}>
          <span style={styles.selectedCount}>{totalSelectedClaims}</span>
          claims selected
        </div>
      </div>

      {/* Claims grid layout - now horizontal */}
      <div style={styles.claimsGridLayout}>
        {/* Allergens Section */}
        <div style={styles.claimsSection}>
          <div style={styles.sectionHeader}>
            <div style={styles.headerLeft}>
              <FontAwesomeIcon icon={faShieldAlt} style={styles.sectionIcon} />
              <span>Allergen Claims</span>
            </div>
            <div style={styles.headerRight}>
              {countSelectedByCategory('allergens') > 0 && (
                <span style={styles.selectedBadge}>
                  {countSelectedByCategory('allergens')} selected
                </span>
              )}
            </div>
          </div>
          
          <div style={styles.sectionContent}>
            <div style={styles.highlightItem}>
              <div style={styles.infoMessage}>
                <FontAwesomeIcon icon={faInfoCircle} />
                <span>Select all allergens that apply to your product. These will be clearly displayed on your spec sheet.</span>
              </div>
            </div>
            <div style={styles.allergenGrid}>
              {filterClaimsBySearch(allergenOptions).map((allergen) => (
                <div 
                  key={allergen.id} 
                  style={{
                    ...styles.checkboxItem,
                    ...(selectedAllergens.includes(allergen.id) ? styles.selectedClaim : {})
                  }}
                >
                  <div style={styles.formCheck}>
                    <input
                      type="checkbox"
                      style={styles.formCheckInput}
                      id={allergen.id}
                      checked={selectedAllergens.includes(allergen.id)}
                      onChange={() => handleAllergenChange(allergen.id)}
                    />
                    <label style={styles.formCheckLabel} htmlFor={allergen.id}>
                      <div>
                        <span style={styles.checkboxLabel}>{allergen.label}</span>
                        <span style={styles.checkboxHelp}>{allergen.help}</span>
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dietary Claims Section */}
        <div style={styles.claimsSection}>
          <div style={styles.sectionHeader}>
            <div style={styles.headerLeft}>
              <FontAwesomeIcon icon={faHeartbeat} style={styles.sectionIcon} />
              <span>Dietary Claims</span>
            </div>
            <div style={styles.headerRight}>
              {countSelectedByCategory('dietary') > 0 && (
                <span style={styles.selectedBadge}>
                  {countSelectedByCategory('dietary')} selected
                </span>
              )}
            </div>
          </div>
          
          <div style={styles.sectionContent}>
            <div style={styles.claimsGrid}>
              {filterClaimsBySearch(packagingClaimOptions.dietary).map((claim) => (
                <div 
                  key={claim.id} 
                  style={{
                    ...styles.checkboxItem,
                    ...(selectedPackagingClaims.includes(claim.id) ? styles.selectedClaim : {})
                  }}
                >
                  <div style={styles.formCheck}>
                    <input
                      type="checkbox"
                      style={styles.formCheckInput}
                      id={claim.id}
                      checked={selectedPackagingClaims.includes(claim.id)}
                      onChange={() => handlePackagingClaimChange(claim.id)}
                    />
                    <label style={styles.formCheckLabel} htmlFor={claim.id}>
                      <div>
                        <span style={styles.checkboxLabel}>{claim.label}</span>
                        <span style={styles.checkboxHelp}>{claim.help}</span>
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Certifications Section */}
        <div style={styles.claimsSection}>
          <div style={styles.sectionHeader}>
            <div style={styles.headerLeft}>
              <FontAwesomeIcon icon={faCertificate} style={styles.sectionIcon} />
              <span>Certifications</span>
            </div>
            <div style={styles.headerRight}>
              {countSelectedByCategory('certifications') > 0 && (
                <span style={styles.selectedBadge}>
                  {countSelectedByCategory('certifications')} selected
                </span>
              )}
            </div>
          </div>
          
          <div style={styles.sectionContent}>
            <div style={styles.claimsGrid}>
              {filterClaimsBySearch(packagingClaimOptions.certifications).map((claim) => (
                <div 
                  key={claim.id} 
                  style={{
                    ...styles.checkboxItem,
                    ...(selectedPackagingClaims.includes(claim.id) ? styles.selectedClaim : {})
                  }}
                >
                  <div style={styles.formCheck}>
                    <input
                      type="checkbox"
                      style={styles.formCheckInput}
                      id={claim.id}
                      checked={selectedPackagingClaims.includes(claim.id)}
                      onChange={() => handlePackagingClaimChange(claim.id)}
                    />
                    <label style={styles.formCheckLabel} htmlFor={claim.id}>
                      <div>
                        <span style={styles.checkboxLabel}>{claim.label}</span>
                        <span style={styles.checkboxHelp}>{claim.help}</span>
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ingredients Section */}
        <div style={styles.claimsSection}>
          <div style={styles.sectionHeader}>
            <div style={styles.headerLeft}>
              <FontAwesomeIcon icon={faCheck} style={styles.sectionIcon} />
              <span>Ingredient Claims</span>
            </div>
            <div style={styles.headerRight}>
              {countSelectedByCategory('ingredients') > 0 && (
                <span style={styles.selectedBadge}>
                  {countSelectedByCategory('ingredients')} selected
                </span>
              )}
            </div>
          </div>
          
          <div style={styles.sectionContent}>
            <div style={styles.claimsGrid}>
              {filterClaimsBySearch(packagingClaimOptions.ingredients).map((claim) => (
                <div 
                  key={claim.id} 
                  style={{
                    ...styles.checkboxItem,
                    ...(selectedPackagingClaims.includes(claim.id) ? styles.selectedClaim : {})
                  }}
                >
                  <div style={styles.formCheck}>
                    <input
                      type="checkbox"
                      style={styles.formCheckInput}
                      id={claim.id}
                      checked={selectedPackagingClaims.includes(claim.id)}
                      onChange={() => handlePackagingClaimChange(claim.id)}
                    />
                    <label style={styles.formCheckLabel} htmlFor={claim.id}>
                      <div>
                        <span style={styles.checkboxLabel}>{claim.label}</span>
                        <span style={styles.checkboxHelp}>{claim.help}</span>
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sustainability Section */}
        <div style={styles.claimsSection}>
          <div style={styles.sectionHeader}>
            <div style={styles.headerLeft}>
              <FontAwesomeIcon icon={faRecycle} style={styles.sectionIcon} />
              <span>Sustainability Claims</span>
            </div>
            <div style={styles.headerRight}>
              {countSelectedByCategory('sustainability') > 0 && (
                <span style={styles.selectedBadge}>
                  {countSelectedByCategory('sustainability')} selected
                </span>
              )}
            </div>
          </div>
          
          <div style={styles.sectionContent}>
            <div style={styles.claimsGrid}>
              {filterClaimsBySearch(packagingClaimOptions.sustainability).map((claim) => (
                <div 
                  key={claim.id} 
                  style={{
                    ...styles.checkboxItem,
                    ...(selectedPackagingClaims.includes(claim.id) ? styles.selectedClaim : {})
                  }}
                >
                  <div style={styles.formCheck}>
                    <input
                      type="checkbox"
                      style={styles.formCheckInput}
                      id={claim.id}
                      checked={selectedPackagingClaims.includes(claim.id)}
                      onChange={() => handlePackagingClaimChange(claim.id)}
                    />
                    <label style={styles.formCheckLabel} htmlFor={claim.id}>
                      <div>
                        <span style={styles.checkboxLabel}>{claim.label}</span>
                        <span style={styles.checkboxHelp}>{claim.help}</span>
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Claims Section */}
        <div style={styles.claimsSection}>
          <div style={styles.sectionHeader}>
            <div style={styles.headerLeft}>
              <FontAwesomeIcon icon={faPlus} style={styles.sectionIcon} />
              <span>Custom Claims</span>
            </div>
            <div style={styles.headerRight}>
              {customClaims.length > 0 && (
                <span style={styles.selectedBadge}>
                  {customClaims.length} added
                </span>
              )}
            </div>
          </div>
          
          <div style={styles.sectionContent}>
            <div style={styles.customClaimsContainer}>
              <div style={styles.customClaimsInputArea}>
                <div style={styles.infoMessage}>
                  <FontAwesomeIcon icon={faInfoCircle} />
                  <span>Add any additional claims that are not listed in the categories above.</span>
                </div>
                <div style={styles.customClaimsInput}>
                  <input
                    type="text"
                    style={styles.formControl}
                    placeholder="Enter custom claim..."
                    value={newCustomClaim}
                    onChange={handleCustomClaimChange}
                    onKeyPress={handleKeyPress}
                  />
                  <button 
                    style={{
                      ...styles.btnPrimary,
                      opacity: !newCustomClaim.trim() ? '0.65' : '1',
                      cursor: !newCustomClaim.trim() ? 'not-allowed' : 'pointer'
                    }} 
                    onClick={addCustomClaim}
                    disabled={!newCustomClaim.trim()}
                  >
                    <FontAwesomeIcon icon={faPlus} /> Add
                  </button>
                </div>
              </div>
              
              <div style={styles.customClaimsListContainer}>
                <div style={styles.customClaimsList}>
                  {customClaims.length > 0 ? (
                    customClaims.map((claim, index) => (
                      <div key={index} style={styles.customClaimItem}>
                        <div style={styles.customClaimText}>
                          {claim}
                        </div>
                        <button 
                          style={styles.removeButton}
                          onClick={() => removeCustomClaim(index)}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={styles.emptyClaims}>
                      <FontAwesomeIcon icon={faPlus} style={styles.emptyIcon} />
                      <p style={styles.noItemsMessage}>No custom claims added yet</p>
                      <p style={styles.emptyHelp}>Add custom claims using the form above</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* No results message */}
        {searchTerm && !hasSearchResults && (
          <div style={styles.noResults}>
            No claims found matching "{searchTerm}". Try a different search term.
          </div>
        )}
      </div>
    </div>
  );
};

export default PackagingClaims;
