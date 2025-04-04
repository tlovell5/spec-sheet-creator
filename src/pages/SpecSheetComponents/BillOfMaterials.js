import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

function BillOfMaterials({ specSheetId, wipId, unitClaimWeight, weightUom }) {
  // State for different tables
  const [wipData, setWipData] = useState({ wip_id: wipId || '', weight: 0 });
  const [ingredients, setIngredients] = useState([]);
  const [inclusions, setInclusions] = useState([]);
  const [packaging, setPackaging] = useState([]);
  const [caseItems, setCaseItems] = useState([]);
  
  // State for calculations
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [weightInLbs, setWeightInLbs] = useState(0);
  
  // Load BOM data when component mounts
  useEffect(() => {
    const fetchBOMData = async () => {
      if (!specSheetId) return;
      
      const { data, error } = await supabase
        .from('bill_of_materials')
        .select('*')
        .eq('spec_sheet_id', specSheetId);
      
      if (error) {
        console.error('Error fetching BOM data:', error);
        return;
      }
      
      // Process and categorize items
      if (data && data.length > 0) {
        const ingredientItems = data.filter(item => item.item_type === 'Ingredient');
        const inclusionItems = data.filter(item => item.item_type === 'Inclusion');
        const packagingItems = data.filter(item => item.item_type === 'Packaging');
        const caseItems = data.filter(item => item.item_type === 'Case');
        
        setIngredients(ingredientItems.length > 0 ? ingredientItems : [getEmptyIngredient()]);
        setInclusions(inclusionItems.length > 0 ? inclusionItems : [getEmptyInclusion()]);
        setPackaging(packagingItems.length > 0 ? packagingItems : [getEmptyPackaging()]);
        setCaseItems(caseItems.length > 0 ? caseItems : [getEmptyCase()]);
      } else {
        // Initialize with empty rows if no data
        setIngredients([getEmptyIngredient()]);
        setInclusions([getEmptyInclusion()]);
        setPackaging([getEmptyPackaging()]);
        setCaseItems([getEmptyCase()]);
      }
    };
    
    fetchBOMData();
  }, [specSheetId]);
  
  // Update WIP data when wipId changes
  useEffect(() => {
    setWipData(prev => ({ ...prev, wip_id: wipId || '' }));
  }, [wipId]);
  
  // Convert unit claim weight to lbs for calculations
  useEffect(() => {
    if (!unitClaimWeight) {
      setWeightInLbs(0);
      return;
    }
    
    let weight = Number(unitClaimWeight);
    
    // Convert to lbs based on the unit of measure
    switch (weightUom) {
      case 'g':
        weight = weight / 453.592; // grams to lbs
        break;
      case 'kg':
        weight = weight * 2.20462; // kg to lbs
        break;
      case 'oz':
        weight = weight / 16; // oz to lbs
        break;
      case 'lb':
        // Already in lbs
        break;
      default:
        weight = 0;
    }
    
    setWeightInLbs(weight);
    setWipData(prev => ({ ...prev, weight: weight }));
  }, [unitClaimWeight, weightUom]);
  
  // Calculate totals for ingredients
  useEffect(() => {
    // Calculate total percentage
    const totalPct = ingredients.reduce((sum, item) => {
      return sum + (Number(item.percentage) || 0);
    }, 0);
    
    setTotalPercentage(totalPct);
    
    // Calculate total weight
    const totalWt = ingredients.reduce((sum, item) => {
      return sum + (Number(item.weight) || 0);
    }, 0);
    
    setTotalWeight(totalWt);
  }, [ingredients]);
  
  // Helper functions to create empty rows
  function getEmptyIngredient() {
    return {
      id: `temp-${Math.random().toString(36).substring(2, 9)}`,
      spec_sheet_id: specSheetId,
      item_type: 'Ingredient',
      sku: '',
      description: '',
      percentage: 0,
      weight: 0,
      uom: 'lbs',
      allergens: '',
      country_of_origin: ''
    };
  }
  
  function getEmptyInclusion() {
    return {
      id: `temp-${Math.random().toString(36).substring(2, 9)}`,
      spec_sheet_id: specSheetId,
      item_type: 'Inclusion',
      sku: '',
      description: '',
      qty: 0,
      uom: 'ea',
      weight_g: 0,
      allergens: '',
      country_of_origin: ''
    };
  }
  
  function getEmptyPackaging() {
    return {
      id: `temp-${Math.random().toString(36).substring(2, 9)}`,
      spec_sheet_id: specSheetId,
      item_type: 'Packaging',
      sku: '',
      description: '',
      length_in: 0,
      width_in: 0,
      height_in: 0,
      qty: 0,
      weight_g: 0
    };
  }
  
  function getEmptyCase() {
    return {
      id: `temp-${Math.random().toString(36).substring(2, 9)}`,
      spec_sheet_id: specSheetId,
      item_type: 'Case',
      sku: '',
      description: '',
      length_in: 0,
      width_in: 0,
      height_in: 0,
      qty: 0,
      weight_g: 0
    };
  }
  
  // Handle changes to ingredient rows
  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index][field] = value;
    
    // If percentage changes, recalculate weight
    if (field === 'percentage') {
      const percentage = Number(value) || 0;
      const weight = (percentage / 100) * weightInLbs;
      updatedIngredients[index].weight = weight.toFixed(4);
    }
    
    setIngredients(updatedIngredients);
    saveIngredient(updatedIngredients[index]);
  };
  
  // Handle changes to inclusion rows
  const handleInclusionChange = (index, field, value) => {
    const updatedInclusions = [...inclusions];
    updatedInclusions[index][field] = value;
    setInclusions(updatedInclusions);
    saveInclusion(updatedInclusions[index]);
  };
  
  // Handle changes to packaging rows
  const handlePackagingChange = (index, field, value) => {
    const updatedPackaging = [...packaging];
    updatedPackaging[index][field] = value;
    setPackaging(updatedPackaging);
    savePackaging(updatedPackaging[index]);
  };
  
  // Handle changes to case rows
  const handleCaseChange = (index, field, value) => {
    const updatedCases = [...caseItems];
    updatedCases[index][field] = value;
    setCaseItems(updatedCases);
    saveCase(updatedCases[index]);
  };
  
  // Add new rows
  const addIngredient = () => {
    setIngredients([...ingredients, getEmptyIngredient()]);
  };
  
  const addInclusion = () => {
    setInclusions([...inclusions, getEmptyInclusion()]);
  };
  
  const addPackaging = () => {
    setPackaging([...packaging, getEmptyPackaging()]);
  };
  
  const addCase = () => {
    setCaseItems([...caseItems, getEmptyCase()]);
  };
  
  // Remove rows
  const removeIngredient = async (index) => {
    const ingredientToRemove = ingredients[index];
    const updatedIngredients = ingredients.filter((_, i) => i !== index);
    
    // Ensure we always have at least one row
    if (updatedIngredients.length === 0) {
      updatedIngredients.push(getEmptyIngredient());
    }
    
    setIngredients(updatedIngredients);
    
    // If it's a saved item (has a non-temp id), delete it from the database
    if (ingredientToRemove.id && !ingredientToRemove.id.startsWith('temp-')) {
      await supabase
        .from('bill_of_materials')
        .delete()
        .eq('id', ingredientToRemove.id);
    }
  };
  
  const removeInclusion = async (index) => {
    const inclusionToRemove = inclusions[index];
    const updatedInclusions = inclusions.filter((_, i) => i !== index);
    
    if (updatedInclusions.length === 0) {
      updatedInclusions.push(getEmptyInclusion());
    }
    
    setInclusions(updatedInclusions);
    
    if (inclusionToRemove.id && !inclusionToRemove.id.startsWith('temp-')) {
      await supabase
        .from('bill_of_materials')
        .delete()
        .eq('id', inclusionToRemove.id);
    }
  };
  
  const removePackaging = async (index) => {
    const packagingToRemove = packaging[index];
    const updatedPackaging = packaging.filter((_, i) => i !== index);
    
    if (updatedPackaging.length === 0) {
      updatedPackaging.push(getEmptyPackaging());
    }
    
    setPackaging(updatedPackaging);
    
    if (packagingToRemove.id && !packagingToRemove.id.startsWith('temp-')) {
      await supabase
        .from('bill_of_materials')
        .delete()
        .eq('id', packagingToRemove.id);
    }
  };
  
  const removeCase = async (index) => {
    const caseToRemove = caseItems[index];
    const updatedCases = caseItems.filter((_, i) => i !== index);
    
    if (updatedCases.length === 0) {
      updatedCases.push(getEmptyCase());
    }
    
    setCaseItems(updatedCases);
    
    if (caseToRemove.id && !caseToRemove.id.startsWith('temp-')) {
      await supabase
        .from('bill_of_materials')
        .delete()
        .eq('id', caseToRemove.id);
    }
  };
  
  // Save items to database
  const saveIngredient = async (ingredient) => {
    if (!specSheetId) return;
    
    const { id, ...itemData } = ingredient;
    
    // If it's a temporary ID, insert a new record
    if (id.startsWith('temp-')) {
      const { data, error } = await supabase
        .from('bill_of_materials')
        .insert([itemData])
        .select();
      
      if (error) {
        console.error('Error saving ingredient:', error);
      } else if (data && data.length > 0) {
        // Update the ID in the state
        setIngredients(prev => 
          prev.map(item => 
            item.id === id ? { ...item, id: data[0].id } : item
          )
        );
      }
    } else {
      // Otherwise, update the existing record
      const { error } = await supabase
        .from('bill_of_materials')
        .update(itemData)
        .eq('id', id);
      
      if (error) {
        console.error('Error updating ingredient:', error);
      }
    }
  };
  
  const saveInclusion = async (inclusion) => {
    if (!specSheetId) return;
    
    const { id, ...itemData } = inclusion;
    
    if (id.startsWith('temp-')) {
      const { data, error } = await supabase
        .from('bill_of_materials')
        .insert([itemData])
        .select();
      
      if (error) {
        console.error('Error saving inclusion:', error);
      } else if (data && data.length > 0) {
        setInclusions(prev => 
          prev.map(item => 
            item.id === id ? { ...item, id: data[0].id } : item
          )
        );
      }
    } else {
      const { error } = await supabase
        .from('bill_of_materials')
        .update(itemData)
        .eq('id', id);
      
      if (error) {
        console.error('Error updating inclusion:', error);
      }
    }
  };
  
  const savePackaging = async (packagingItem) => {
    if (!specSheetId) return;
    
    const { id, ...itemData } = packagingItem;
    
    if (id.startsWith('temp-')) {
      const { data, error } = await supabase
        .from('bill_of_materials')
        .insert([itemData])
        .select();
      
      if (error) {
        console.error('Error saving packaging:', error);
      } else if (data && data.length > 0) {
        setPackaging(prev => 
          prev.map(item => 
            item.id === id ? { ...item, id: data[0].id } : item
          )
        );
      }
    } else {
      const { error } = await supabase
        .from('bill_of_materials')
        .update(itemData)
        .eq('id', id);
      
      if (error) {
        console.error('Error updating packaging:', error);
      }
    }
  };
  
  const saveCase = async (caseItem) => {
    if (!specSheetId) return;
    
    const { id, ...itemData } = caseItem;
    
    if (id.startsWith('temp-')) {
      const { data, error } = await supabase
        .from('bill_of_materials')
        .insert([itemData])
        .select();
      
      if (error) {
        console.error('Error saving case:', error);
      } else if (data && data.length > 0) {
        setCaseItems(prev => 
          prev.map(item => 
            item.id === id ? { ...item, id: data[0].id } : item
          )
        );
      }
    } else {
      const { error } = await supabase
        .from('bill_of_materials')
        .update(itemData)
        .eq('id', id);
      
      if (error) {
        console.error('Error updating case:', error);
      }
    }
  };

  return (
    <div className="bill-of-materials-container">
      {/* WIP Table */}
      <div className="bom-section">
        <h4>WIP</h4>
        <table className="form-table">
          <thead>
            <tr>
              <th>WIP ID</th>
              <th>WIP Weight (lbs)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{wipData.wip_id || 'N/A'}</td>
              <td>{wipData.weight ? wipData.weight.toFixed(4) : '0.0000'}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Ingredients Table */}
      <div className="bom-section">
        <h4>Ingredients</h4>
        <table className="form-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Description</th>
              <th>%</th>
              <th>Weight (lbs)</th>
              <th>UOM</th>
              <th>Allergens</th>
              <th>Country of Origin</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ingredient, index) => (
              <tr key={ingredient.id || index}>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={ingredient.sku || ''}
                    onChange={(e) => handleIngredientChange(index, 'sku', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={ingredient.description || ''}
                    onChange={(e) => handleIngredientChange(index, 'description', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={ingredient.percentage || ''}
                    onChange={(e) => handleIngredientChange(index, 'percentage', e.target.value)}
                    step="0.01"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={ingredient.weight || ''}
                    readOnly
                  />
                </td>
                <td>lbs</td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={ingredient.allergens || ''}
                    onChange={(e) => handleIngredientChange(index, 'allergens', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={ingredient.country_of_origin || ''}
                    onChange={(e) => handleIngredientChange(index, 'country_of_origin', e.target.value)}
                  />
                </td>
                <td>
                  <button 
                    className="remove-row-button"
                    onClick={() => removeIngredient(index)}
                  >
                    X
                  </button>
                </td>
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan="2"><strong>Total</strong></td>
              <td>
                <strong 
                  className={totalPercentage !== 100 ? 'error-text' : ''}
                >
                  {totalPercentage.toFixed(2)}%
                </strong>
              </td>
              <td>
                <strong>{totalWeight.toFixed(4)}</strong>
              </td>
              <td colSpan="4"></td>
            </tr>
          </tbody>
        </table>
        
        {totalPercentage !== 100 && (
          <div className="error-message">
            Total percentage must equal 100%. Current total: {totalPercentage.toFixed(2)}%
          </div>
        )}
        
        <button 
          className="add-row-button"
          onClick={addIngredient}
        >
          Add Ingredient
        </button>
      </div>
      
      {/* Inclusions Table */}
      <div className="bom-section">
        <h4>Inclusions</h4>
        <table className="form-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Description</th>
              <th>QTY</th>
              <th>UOM</th>
              <th>Weight (g)</th>
              <th>Allergens</th>
              <th>Country of Origin</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inclusions.map((inclusion, index) => (
              <tr key={inclusion.id || index}>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={inclusion.sku || ''}
                    onChange={(e) => handleInclusionChange(index, 'sku', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={inclusion.description || ''}
                    onChange={(e) => handleInclusionChange(index, 'description', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={inclusion.qty || ''}
                    onChange={(e) => handleInclusionChange(index, 'qty', e.target.value)}
                  />
                </td>
                <td>ea</td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={inclusion.weight_g || ''}
                    onChange={(e) => handleInclusionChange(index, 'weight_g', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={inclusion.allergens || ''}
                    onChange={(e) => handleInclusionChange(index, 'allergens', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={inclusion.country_of_origin || ''}
                    onChange={(e) => handleInclusionChange(index, 'country_of_origin', e.target.value)}
                  />
                </td>
                <td>
                  <button 
                    className="remove-row-button"
                    onClick={() => removeInclusion(index)}
                  >
                    X
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <button 
          className="add-row-button"
          onClick={addInclusion}
        >
          Add Inclusion
        </button>
      </div>
      
      {/* Packaging Table */}
      <div className="bom-section">
        <h4>Packaging</h4>
        <table className="form-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Description</th>
              <th>Length (in)</th>
              <th>Width (in)</th>
              <th>Height (in)</th>
              <th>QTY (ea)</th>
              <th>Weight (g)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {packaging.map((item, index) => (
              <tr key={item.id || index}>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={item.sku || ''}
                    onChange={(e) => handlePackagingChange(index, 'sku', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={item.description || ''}
                    onChange={(e) => handlePackagingChange(index, 'description', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={item.length_in || ''}
                    onChange={(e) => handlePackagingChange(index, 'length_in', e.target.value)}
                    step="0.01"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={item.width_in || ''}
                    onChange={(e) => handlePackagingChange(index, 'width_in', e.target.value)}
                    step="0.01"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={item.height_in || ''}
                    onChange={(e) => handlePackagingChange(index, 'height_in', e.target.value)}
                    step="0.01"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={item.qty || ''}
                    onChange={(e) => handlePackagingChange(index, 'qty', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={item.weight_g || ''}
                    onChange={(e) => handlePackagingChange(index, 'weight_g', e.target.value)}
                  />
                </td>
                <td>
                  <button 
                    className="remove-row-button"
                    onClick={() => removePackaging(index)}
                  >
                    X
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <button 
          className="add-row-button"
          onClick={addPackaging}
        >
          Add Packaging
        </button>
      </div>
      
      {/* Case Table */}
      <div className="bom-section">
        <h4>Case</h4>
        <table className="form-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Description</th>
              <th>Length (in)</th>
              <th>Width (in)</th>
              <th>Height (in)</th>
              <th>QTY (ea)</th>
              <th>Weight (g)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {caseItems.map((item, index) => (
              <tr key={item.id || index}>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={item.sku || ''}
                    onChange={(e) => handleCaseChange(index, 'sku', e.target.value)}
                  />
                </td>
                <td>
                  <select
                    className="form-control"
                    value={item.description || ''}
                    onChange={(e) => handleCaseChange(index, 'description', e.target.value)}
                  >
                    <option value="">Select Type</option>
                    <option value="Box">Box</option>
                    <option value="Tray">Tray</option>
                    <option value="Divider">Divider</option>
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={item.length_in || ''}
                    onChange={(e) => handleCaseChange(index, 'length_in', e.target.value)}
                    step="0.01"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={item.width_in || ''}
                    onChange={(e) => handleCaseChange(index, 'width_in', e.target.value)}
                    step="0.01"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={item.height_in || ''}
                    onChange={(e) => handleCaseChange(index, 'height_in', e.target.value)}
                    step="0.01"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={item.qty || ''}
                    onChange={(e) => handleCaseChange(index, 'qty', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={item.weight_g || ''}
                    onChange={(e) => handleCaseChange(index, 'weight_g', e.target.value)}
                  />
                </td>
                <td>
                  <button 
                    className="remove-row-button"
                    onClick={() => removeCase(index)}
                  >
                    X
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <button 
          className="add-row-button"
          onClick={addCase}
        >
          Add Case Item
        </button>
      </div>
    </div>
  );
}

export default BillOfMaterials;
