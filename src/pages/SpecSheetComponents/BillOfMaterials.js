import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFlask,
  faLeaf,
  faCubes,
  faPlus,
  faTrash,
  faBarcode,
  faFileAlt,
  faWineBottle,
  faBoxes,
  faCookie
} from '@fortawesome/free-solid-svg-icons';

function BillOfMaterials({ specSheetId, wipId, unitClaimWeight, weightUom, specSheetData, setSpecSheetData }) {
  // State for different tables
  const [wipData, setWipData] = useState({ wip_id: wipId || '', weight: 0, description: '' });
  const [ingredients, setIngredients] = useState([]);
  const [inclusions, setInclusions] = useState([]);
  const [packaging, setPackaging] = useState([]);
  const [caseItems, setCaseItems] = useState([]);
  
  // State for calculations
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [weightInLbs, setWeightInLbs] = useState(0);
  const [totalPackagingWeight, setTotalPackagingWeight] = useState(0);
  
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
        
        setIngredients(ingredientItems.length > 0 ? ingredientItems : [createEmptyIngredient()]);
        setInclusions(inclusionItems.length > 0 ? inclusionItems : [createEmptyInclusion()]);
        setPackaging(packagingItems.length > 0 ? packagingItems : [createEmptyPackaging()]);
        setCaseItems(caseItems.length > 0 ? caseItems : [createEmptyCase()]);
      } else {
        // Initialize with empty rows if no data
        setIngredients([createEmptyIngredient()]);
        setInclusions([createEmptyInclusion()]);
        setPackaging([createEmptyPackaging()]);
        setCaseItems([createEmptyCase()]);
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
    const totalPct = calculateTotalPercentage();
    const totalWt = calculateTotalWeight();
    
    setTotalPercentage(totalPct);
    setTotalWeight(totalWt);
  }, [ingredients]);
  
  // Calculate total packaging weight and update parent component
  useEffect(() => {
    // Calculate total packaging weight
    const packagingTotal = packaging.reduce((sum, item) => {
      return sum + (parseFloat(item.weight) || 0);
    }, 0);
    
    // Calculate total inclusion weight
    const inclusionTotal = inclusions.reduce((sum, item) => {
      return sum + (parseFloat(item.weight) || 0);
    }, 0);
    
    // Get ingredient weight from ProductIdentification netWeight (in lbs)
    const ingredientWeightLbs = parseFloat(specSheetData?.productIdentification?.netWeight) || 0;
    
    // Convert ingredient weight to grams for consistency
    const ingredientWeightG = ingredientWeightLbs * 453.592;
    
    // Calculate total net weight (sum of all weights)
    const totalNetWeight = packagingTotal + inclusionTotal + ingredientWeightG;
    
    setTotalPackagingWeight(packagingTotal);
    
    // Update the parent component's state with all the weight values
    if (setSpecSheetData) {
      setSpecSheetData(prevData => {
        // Create a new object with updated values
        const updatedData = {
          ...prevData,
          productIdentification: {
            ...prevData.productIdentification,
            // Don't update netWeight here to avoid circular updates
          }
        };
        
        // Ensure productionDetails exists
        if (!updatedData.productionDetails) {
          updatedData.productionDetails = {};
        }
        
        // Update production details with calculated weights
        updatedData.productionDetails = {
          ...updatedData.productionDetails,
          packaging_weight_g: packagingTotal,
          inclusion_weight_g: inclusionTotal,
          ingredient_weight_g: ingredientWeightG,
          net_weight_g: totalNetWeight // Sum of all weights
        };
        
        return updatedData;
      });
    }
  }, [packaging, inclusions, specSheetData?.productIdentification?.netWeight, setSpecSheetData]);
  
  // Helper functions to create empty rows
  const createEmptyIngredient = () => {
    return {
      id: `temp-${Math.random().toString(36).substring(2, 9)}`,
      spec_sheet_id: specSheetId,
      item_type: 'Ingredient',
      itemCode: '',
      description: '',
      percentage: 0,
      weight: 0,
      allergens: '',
      countryOfOrigin: ''
    };
  };
  
  const createEmptyInclusion = () => {
    return {
      id: `temp-${Math.random().toString(36).substring(2, 9)}`,
      spec_sheet_id: specSheetId,
      item_type: 'Inclusion',
      sku: '',
      description: '',
      quantity: 0,
      weight: 0,
      allergens: '',
      countryOfOrigin: ''
    };
  };
  
  const createEmptyPackaging = () => {
    return {
      id: `temp-${Math.random().toString(36).substring(2, 9)}`,
      spec_sheet_id: specSheetId,
      item_type: 'Packaging',
      sku: '',
      description: '',
      qty: 0,
      weight: 0,
      length: 0,
      width: 0,
      height: 0,
      supplier: ''
    };
  };
  
  const createEmptyCase = () => {
    return {
      id: `temp-${Math.random().toString(36).substring(2, 9)}`,
      spec_sheet_id: specSheetId,
      item_type: 'Case',
      sku: '',
      description: '',
      qty: 0,
      weight: 0,
      length: 0,
      width: 0,
      height: 0,
      supplier: ''
    };
  };
  
  // Calculate total percentage of ingredients
  const calculateTotalPercentage = () => {
    return ingredients.reduce((total, ingredient) => {
      return total + (parseFloat(ingredient.percentage) || 0);
    }, 0);
  };

  // Calculate total weight of ingredients
  const calculateTotalWeight = () => {
    return ingredients.reduce((total, ingredient) => {
      return total + (parseFloat(ingredient.weight) || 0);
    }, 0);
  };
  
  // Handle changes to ingredient rows
  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: value
    };
    
    // Recalculate weight based on percentage and packaging claim weight
    if (field === 'percentage') {
      updatedIngredients[index].weight = calculateIngredientWeight(value);
    }
    
    setIngredients(updatedIngredients);
    saveIngredient(updatedIngredients[index]);
  };
  
  // Handle changes to inclusion rows
  const handleInclusionChange = (index, field, value) => {
    const updatedInclusions = [...inclusions];
    updatedInclusions[index] = {
      ...updatedInclusions[index],
      [field]: value
    };
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
  const handleAddIngredient = () => {
    setIngredients([...ingredients, createEmptyIngredient()]);
  };

  const addInclusion = () => {
    setInclusions([...inclusions, createEmptyInclusion()]);
  };
  
  const addPackaging = () => {
    setPackaging([...packaging, createEmptyPackaging()]);
  };
  
  const addCase = () => {
    setCaseItems([...caseItems, createEmptyCase()]);
  };
  
  // Remove rows
  const handleRemoveIngredient = (index) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients.splice(index, 1);
    
    // Ensure we always have at least one row
    if (updatedIngredients.length === 0) {
      updatedIngredients.push(createEmptyIngredient());
    }
    
    setIngredients(updatedIngredients);
    
    // If it's a saved item (has a non-temp id), delete it from the database
    if (ingredients[index].id && !ingredients[index].id.startsWith('temp-')) {
      supabase
        .from('bill_of_materials')
        .delete()
        .eq('id', ingredients[index].id);
    }
  };

  const removeInclusion = async (index) => {
    const inclusionToRemove = inclusions[index];
    const updatedInclusions = inclusions.filter((_, i) => i !== index);
    
    if (updatedInclusions.length === 0) {
      updatedInclusions.push(createEmptyInclusion());
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
      updatedPackaging.push(createEmptyPackaging());
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
      updatedCases.push(createEmptyCase());
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

  // Calculate ingredient weight based on percentage of packaging claim weight
  const calculateIngredientWeight = (percentage) => {
    if (!specSheetData?.productIdentification?.netWeight) return 0;
    
    const netWeight = parseFloat(specSheetData.productIdentification.netWeight) || 0;
    const unit = specSheetData.productIdentification.weightUom || 'g';
    const totalWeightLbs = convertToLbs(netWeight, unit);
    
    // Calculate weight based on percentage
    const percentValue = parseFloat(percentage) || 0;
    const weight = (percentValue / 100) * totalWeightLbs;
    
    return parseFloat(weight) || 0;
  };

  const convertToLbs = (weight, unit) => {
    switch (unit) {
      case 'g':
        return weight / 453.592; // grams to lbs
      case 'kg':
        return weight * 2.20462; // kg to lbs
      case 'oz':
        return weight / 16; // oz to lbs
      case 'lb':
        // Already in lbs
        return weight;
      default:
        return 0;
    }
  };

  const handleWipDescriptionChange = (e) => {
    setWipData(prev => ({ ...prev, description: e.target.value }));
  };

  return (
    <div className="bill-of-materials-container">
      <style>
        {`
          .bill-of-materials-container {
            font-family: 'Roboto', sans-serif;
            max-width: 100%;
            padding: 0;
            margin: 0;
          }
          
          .bom-section {
            margin-bottom: 1.5rem;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          }
          
          .bom-section h4 {
            background-color: #f8f9fa;
            padding: 10px 12px;
            margin: 0;
            border-bottom: 1px solid #e0e0e0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 1rem;
            color: #495057;
          }
          
          .form-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }
          
          .form-table th {
            background-color: #f8f9fa;
            font-weight: 600;
            text-align: left;
            padding: 8px 10px;
            border-bottom: 2px solid #dee2e6;
            color: #495057;
            font-size: 0.85rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .form-table td {
            padding: 6px 8px;
            border-bottom: 1px solid #e9ecef;
            vertical-align: middle;
            font-size: 0.9rem;
          }
          
          .form-table tr:last-child td {
            border-bottom: none;
          }
          
          .form-table input, .form-table select {
            width: 100%;
            padding: 6px 8px;
            border: 1px solid #ced4da;
            border-radius: 4px;
            font-size: 0.85rem;
          }
          
          .form-table input:focus, .form-table select:focus {
            border-color: #80bdff;
            outline: 0;
            box-shadow: 0 0 0 0.15rem rgba(0,123,255,.25);
          }
          
          .add-button {
            background-color: #28a745;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 4px 8px;
            font-size: 0.8rem;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }
          
          .add-button:hover {
            background-color: #218838;
          }
          
          .remove-button {
            background-color: #dc3545;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 3px 6px;
            font-size: 0.75rem;
            cursor: pointer;
          }
          
          .remove-button:hover {
            background-color: #c82333;
          }
          
          .total-row td {
            font-weight: bold;
            background-color: #f8f9fa;
          }
        `}
      </style>
      {/* WIP Table */}
      <div className="bom-section">
        <h4>
          <span><FontAwesomeIcon icon={faFlask} /> Work in Progress (WIP)</span>
        </h4>
        <table className="form-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: '20%' }}>WIP ID</th>
              <th style={{ width: '60%' }}>Description</th>
              <th style={{ width: '20%' }}>Weight (lbs)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={wipData.wip_id || ''}
                  readOnly
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={wipData.description}
                  onChange={handleWipDescriptionChange}
                  placeholder="Enter WIP description"
                />
              </td>
              <td>
                <input
                  type="number"
                  className="form-control calculated-field"
                  value={(() => {
                    try {
                      // Direct calculation for display
                      if (specSheetData?.productIdentification?.netWeight) {
                        const netWeight = specSheetData.productIdentification.netWeight;
                        const unit = specSheetData.productIdentification.weightUom || 'g';
                        const convertedWeight = convertToLbs(netWeight, unit);
                        return convertedWeight > 0 ? convertedWeight.toFixed(4) : '';
                      } else if (wipData.weight) {
                        return Number(wipData.weight).toFixed(4);
                      } else {
                        return '';
                      }
                    } catch (error) {
                      console.error('Error converting weight:', error);
                      return '';
                    }
                  })()}
                  readOnly
                />
              </td>
            </tr>
          </tbody>
        </table>
        <div className="table-notes">
          <div className="table-note-row">
            <div className="table-note-cell" style={{ width: '20%' }}></div>
            <div className="table-note-cell" style={{ width: '60%' }}></div>
            <div className="table-note-cell" style={{ width: '20%' }}>
              <span className="field-help">Auto-calculated from Packaging Claim Weight</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Ingredients Table */}
      <div className="bom-section">
        <h4>
          <span><FontAwesomeIcon icon={faLeaf} /> Ingredients</span>
          <button 
            className="add-button"
            onClick={handleAddIngredient}
          >
            <FontAwesomeIcon icon={faPlus} /> Add
          </button>
        </h4>
        <table className="form-table">
          <thead>
            <tr>
              <th style={{ width: '5%' }}>#</th>
              <th style={{ width: '15%' }}>Item Code</th>
              <th style={{ width: '30%' }}>Description</th>
              <th style={{ width: '10%' }}>%</th>
              <th style={{ width: '10%' }}>Weight (lbs)</th>
              <th style={{ width: '15%' }}>Allergens</th>
              <th style={{ width: '10%' }}>Country of Origin</th>
              <th style={{ width: '5%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ingredient, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={ingredient.itemCode || ''}
                    onChange={(e) => handleIngredientChange(index, 'itemCode', e.target.value)}
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
                    value={ingredient.percentage > 0 ? ingredient.percentage : ''}
                    onChange={(e) => handleIngredientChange(index, 'percentage', parseFloat(e.target.value))}
                    step="0.01"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={ingredient.weight > 0 ? ingredient.weight.toFixed(4) : ''}
                    readOnly
                  />
                </td>
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
                    value={ingredient.countryOfOrigin || ''}
                    onChange={(e) => handleIngredientChange(index, 'countryOfOrigin', e.target.value)}
                  />
                </td>
                <td>
                  <button 
                    className="remove-button"
                    onClick={() => handleRemoveIngredient(index)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan="3"><strong>Total:</strong></td>
              <td>
                <strong 
                  className={totalPercentage !== 100 ? 'error-text' : ''}
                >
                  {totalPercentage > 0 ? totalPercentage.toFixed(2) : '0'}%
                </strong>
              </td>
              <td>
                <strong>{totalWeight > 0 ? totalWeight.toFixed(4) : '0'} lbs</strong>
              </td>
              <td colSpan="3"></td>
            </tr>
          </tbody>
        </table>
        
        {totalPercentage !== 100 && (
          <div className="error-message">
            Total percentage must equal 100%. Current total: {totalPercentage.toFixed(2)}%
          </div>
        )}
      </div>
      
      {/* Inclusions Table */}
      <div className="bom-section">
        <h4>
          <span><FontAwesomeIcon icon={faCookie} /> Inclusions</span>
          <button 
            className="add-button"
            onClick={addInclusion}
          >
            <FontAwesomeIcon icon={faPlus} /> Add
          </button>
        </h4>
        <table className="form-table">
          <thead>
            <tr>
              <th style={{ width: '5%' }}>#</th>
              <th style={{ width: '15%' }}>Item Code</th>
              <th style={{ width: '25%' }}>Description</th>
              <th style={{ width: '10%' }}>QTY (ea)</th>
              <th style={{ width: '10%' }}>Weight (g)</th>
              <th style={{ width: '15%' }}>Allergens</th>
              <th style={{ width: '15%' }}>Country of Origin</th>
              <th style={{ width: '5%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inclusions.map((inclusion, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
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
                    value={inclusion.quantity > 0 ? inclusion.quantity : ''}
                    onChange={(e) => handleInclusionChange(index, 'quantity', parseFloat(e.target.value))}
                    step="0.01"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={inclusion.weight > 0 ? inclusion.weight : ''}
                    onChange={(e) => handleInclusionChange(index, 'weight', parseFloat(e.target.value))}
                    step="0.01"
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
                    value={inclusion.countryOfOrigin || ''}
                    onChange={(e) => handleInclusionChange(index, 'countryOfOrigin', e.target.value)}
                  />
                </td>
                <td>
                  <button 
                    className="remove-button"
                    onClick={() => removeInclusion(index)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Packaging Table */}
      <div className="bom-section">
        <h4>
          <span><FontAwesomeIcon icon={faWineBottle} /> Packaging</span>
          <button 
            className="add-button"
            onClick={addPackaging}
          >
            <FontAwesomeIcon icon={faPlus} /> Add
          </button>
        </h4>
        <table className="form-table">
          <thead>
            <tr>
              <th style={{ width: '5%' }}>#</th>
              <th style={{ width: '15%' }}>Item Code</th>
              <th style={{ width: '30%' }}>Description</th>
              <th style={{ width: '10%' }}>QTY (ea)</th>
              <th style={{ width: '10%' }}>Weight (g)</th>
              <th colSpan="3" style={{ width: '30%' }}>Dimensions (in)</th>
              <th style={{ width: '10%' }}>Supplier</th>
              <th style={{ width: '5%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {packaging.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
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
                    value={item.qty > 0 ? item.qty : ''}
                    onChange={(e) => handlePackagingChange(index, 'qty', parseFloat(e.target.value))}
                    step="1"
                    min="1"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={item.weight > 0 ? item.weight : ''}
                    onChange={(e) => handlePackagingChange(index, 'weight', parseFloat(e.target.value))}
                    step="0.01"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={item.length > 0 ? item.length : ''}
                    onChange={(e) => handlePackagingChange(index, 'length', parseFloat(e.target.value))}
                    step="0.01"
                    placeholder="L"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={item.width > 0 ? item.width : ''}
                    onChange={(e) => handlePackagingChange(index, 'width', parseFloat(e.target.value))}
                    step="0.01"
                    placeholder="W"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={item.height > 0 ? item.height : ''}
                    onChange={(e) => handlePackagingChange(index, 'height', parseFloat(e.target.value))}
                    step="0.01"
                    placeholder="H"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={item.supplier || ''}
                    onChange={(e) => handlePackagingChange(index, 'supplier', e.target.value)}
                  />
                </td>
                <td>
                  <button 
                    className="remove-button"
                    onClick={() => removePackaging(index)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan="4"><strong>Total:</strong></td>
              <td>
                <strong>{totalPackagingWeight > 0 ? totalPackagingWeight.toFixed(2) : '0'} g</strong>
              </td>
              <td colSpan="5"></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Case Table */}
      <div className="bom-section">
        <h4>
          <span>
            <FontAwesomeIcon icon={faBoxes} /> Case
          </span>
          <button className="add-button" onClick={addCase}>
            <FontAwesomeIcon icon={faPlus} /> Add
          </button>
        </h4>
        <table className="form-table">
          <thead>
            <tr>
              <th style={{ width: '5%' }}>#</th>
              <th style={{ width: '15%' }}>Item Code</th>
              <th style={{ width: '30%' }}>Description</th>
              <th style={{ width: '10%' }}>QTY (ea)</th>
              <th style={{ width: '10%' }}>Weight (g)</th>
              <th colSpan="3" style={{ width: '30%' }}>Dimensions (in)</th>
              <th style={{ width: '10%' }}>Supplier</th>
              <th style={{ width: '5%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {caseItems.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={item.sku || ''}
                    onChange={(e) => handleCaseChange(index, 'sku', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={item.description || ''}
                    onChange={(e) => handleCaseChange(index, 'description', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={item.qty > 0 ? item.qty : ''}
                    onChange={(e) => handleCaseChange(index, 'qty', parseFloat(e.target.value))}
                    step="1"
                    min="1"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={item.weight > 0 ? item.weight : ''}
                    onChange={(e) => handleCaseChange(index, 'weight', parseFloat(e.target.value))}
                    step="0.01"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={item.length > 0 ? item.length : ''}
                    onChange={(e) => handleCaseChange(index, 'length', parseFloat(e.target.value))}
                    step="0.01"
                    placeholder="L"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={item.width > 0 ? item.width : ''}
                    onChange={(e) => handleCaseChange(index, 'width', parseFloat(e.target.value))}
                    step="0.01"
                    placeholder="W"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={item.height > 0 ? item.height : ''}
                    onChange={(e) => handleCaseChange(index, 'height', parseFloat(e.target.value))}
                    step="0.01"
                    placeholder="H"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={item.supplier || ''}
                    onChange={(e) => handleCaseChange(index, 'supplier', e.target.value)}
                  />
                </td>
                <td>
                  <button 
                    className="remove-button"
                    onClick={() => removeCase(index)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BillOfMaterials;
