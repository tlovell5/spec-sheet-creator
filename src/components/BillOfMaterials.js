import React, { useContext, useState } from 'react';
import { SpecSheetContext } from '../context/SpecSheetContext';
import WIPTable from './BillOfMaterials/WIPTable';
import IngredientsTable from './BillOfMaterials/IngredientsTable';
import InclusionsTable from './BillOfMaterials/InclusionsTable';
import PackagingTable from './BillOfMaterials/PackagingTable';
import CaseTable from './BillOfMaterials/CaseTable';
import { v4 as uuidv4 } from 'uuid';
import { calculateIngredientWeights } from '../utils/weightUtils';

const BillOfMaterials = () => {
  const { specSheetData, setSpecSheetData } = useContext(SpecSheetContext);
  
  // Get data from context or use empty arrays
  const billOfMaterials = specSheetData.billOfMaterials || {};
  
  // Local state for each table
  const [ingredients, setIngredients] = useState(billOfMaterials.ingredients || []);
  const [inclusions, setInclusions] = useState(billOfMaterials.inclusions || []);
  const [packaging, setPackaging] = useState(billOfMaterials.packaging || []);
  const [caseItems, setCaseItems] = useState(billOfMaterials.caseItems || []);
  
  // Manual save to context - only call this when user explicitly takes an action
  const saveToContext = () => {
    setSpecSheetData(prevData => ({
      ...prevData,
      billOfMaterials: {
        ...prevData.billOfMaterials,
        ingredients,
        inclusions,
        packaging,
        caseItems
      }
    }));
  };
  
  // Manual calculation of weights - only call when user explicitly requests it
  const calculateWeights = () => {
    if (!specSheetData.productIdentification?.netWeight || ingredients.length === 0) {
      return;
    }
    
    const updatedIngredients = calculateIngredientWeights(
      ingredients,
      parseFloat(specSheetData.productIdentification.netWeight),
      specSheetData.productIdentification.weightUnit || 'g'
    );
    
    setIngredients(updatedIngredients);
    
    // Save to context after calculation
    setTimeout(() => {
      saveToContext();
    }, 0);
  };
  
  // Ingredients table handlers
  const handleAddIngredient = () => {
    const newIngredient = {
      id: uuidv4(),
      name: '',
      percentage: '',
      weight: '',
      notes: ''
    };
    
    const updatedIngredients = [...ingredients, newIngredient];
    setIngredients(updatedIngredients);
    
    // Save to context after adding
    setTimeout(() => {
      saveToContext();
    }, 0);
  };
  
  const handleUpdateIngredient = (index, field, value) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: value
    };
    
    setIngredients(updatedIngredients);
    
    // Save to context after updating
    setTimeout(() => {
      saveToContext();
    }, 0);
  };
  
  const handleRemoveIngredient = (index) => {
    const updatedIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(updatedIngredients);
    
    // Save to context after removing
    setTimeout(() => {
      saveToContext();
    }, 0);
  };
  
  // Inclusions table handlers
  const handleAddInclusion = () => {
    const newInclusion = {
      id: uuidv4(),
      name: '',
      quantity: '',
      unit: 'g',
      notes: ''
    };
    
    const updatedInclusions = [...inclusions, newInclusion];
    setInclusions(updatedInclusions);
    
    // Save to context after adding
    setTimeout(() => {
      saveToContext();
    }, 0);
  };
  
  const handleUpdateInclusion = (index, field, value) => {
    const updatedInclusions = [...inclusions];
    updatedInclusions[index] = {
      ...updatedInclusions[index],
      [field]: value
    };
    
    setInclusions(updatedInclusions);
    
    // Save to context after updating
    setTimeout(() => {
      saveToContext();
    }, 0);
  };
  
  const handleRemoveInclusion = (index) => {
    const updatedInclusions = inclusions.filter((_, i) => i !== index);
    setInclusions(updatedInclusions);
    
    // Save to context after removing
    setTimeout(() => {
      saveToContext();
    }, 0);
  };
  
  // Packaging table handlers
  const handleAddPackaging = () => {
    const newPackaging = {
      id: uuidv4(),
      name: '',
      quantity: '',
      unit: 'g',
      notes: ''
    };
    
    const updatedPackaging = [...packaging, newPackaging];
    setPackaging(updatedPackaging);
    
    // Save to context after adding
    setTimeout(() => {
      saveToContext();
    }, 0);
  };
  
  const handleUpdatePackaging = (index, field, value) => {
    const updatedPackaging = [...packaging];
    updatedPackaging[index] = {
      ...updatedPackaging[index],
      [field]: value
    };
    
    setPackaging(updatedPackaging);
    
    // Save to context after updating
    setTimeout(() => {
      saveToContext();
    }, 0);
  };
  
  const handleRemovePackaging = (index) => {
    const updatedPackaging = packaging.filter((_, i) => i !== index);
    setPackaging(updatedPackaging);
    
    // Save to context after removing
    setTimeout(() => {
      saveToContext();
    }, 0);
  };
  
  // Case table handlers
  const handleAddCaseItem = () => {
    const newCaseItem = {
      id: uuidv4(),
      name: '',
      quantity: '',
      unit: 'g',
      notes: ''
    };
    
    const updatedCaseItems = [...caseItems, newCaseItem];
    setCaseItems(updatedCaseItems);
    
    // Save to context after adding
    setTimeout(() => {
      saveToContext();
    }, 0);
  };
  
  const handleUpdateCaseItem = (index, field, value) => {
    const updatedCaseItems = [...caseItems];
    updatedCaseItems[index] = {
      ...updatedCaseItems[index],
      [field]: value
    };
    
    setCaseItems(updatedCaseItems);
    
    // Save to context after updating
    setTimeout(() => {
      saveToContext();
    }, 0);
  };
  
  const handleRemoveCaseItem = (index) => {
    const updatedCaseItems = caseItems.filter((_, i) => i !== index);
    setCaseItems(updatedCaseItems);
    
    // Save to context after removing
    setTimeout(() => {
      saveToContext();
    }, 0);
  };
  
  return (
    <div className="bill-of-materials">
      <h2>Bill of Materials</h2>
      
      <div className="section">
        <h3>WIP</h3>
        <WIPTable 
          packagingClaimWeight={specSheetData.productIdentification?.netWeight}
          weightUnit={specSheetData.productIdentification?.weightUnit || 'g'}
        />
      </div>
      
      <div className="section">
        <h3>Ingredients</h3>
        <button 
          type="button" 
          className="btn btn-primary mb-2"
          onClick={calculateWeights}
        >
          Calculate Weights
        </button>
        <IngredientsTable 
          ingredients={ingredients}
          onAddIngredient={handleAddIngredient}
          onUpdateIngredient={handleUpdateIngredient}
          onRemoveIngredient={handleRemoveIngredient}
        />
      </div>
      
      <div className="section">
        <h3>Inclusions</h3>
        <InclusionsTable 
          inclusions={inclusions}
          onAddInclusion={handleAddInclusion}
          onUpdateInclusion={handleUpdateInclusion}
          onRemoveInclusion={handleRemoveInclusion}
        />
      </div>
      
      <div className="section">
        <h3>Packaging</h3>
        <PackagingTable 
          packaging={packaging}
          onAddPackaging={handleAddPackaging}
          onUpdatePackaging={handleUpdatePackaging}
          onRemovePackaging={handleRemovePackaging}
        />
      </div>
      
      <div className="section">
        <h3>Case</h3>
        <CaseTable 
          caseItems={caseItems}
          onAddCaseItem={handleAddCaseItem}
          onUpdateCaseItem={handleUpdateCaseItem}
          onRemoveCaseItem={handleRemoveCaseItem}
        />
      </div>
    </div>
  );
};

export default BillOfMaterials;
