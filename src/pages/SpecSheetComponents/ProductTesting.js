import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFlask, 
  faVial, 
  faMicroscope, 
  faPlus, 
  faTimes, 
  faEye, 
  faLeaf, 
  faAtom
} from '@fortawesome/free-solid-svg-icons';

function ProductTesting({ specSheetId }) {
  const [organolepticSpecs, setOrganolepticSpecs] = useState([]);
  const [biologicalSpecs, setBiologicalSpecs] = useState([]);
  const [additionalSpecs, setAdditionalSpecs] = useState([]);
  
  // Define options for dropdowns
  const testOptions = {
    organoleptic: ['Color', 'Appearance', 'Taste', 'Smell', 'Texture', 'Consistency'],
    biological: ['Total Aerobic Plate Count', 'Yeast and Mold', 'E. coli', 'Salmonella', 'Listeria', 'Staphylococcus aureus', 'Coliform'],
    additional: ['pH', 'Water Activity', 'Moisture Content', 'Fat Content', 'Protein Content', 'Carbohydrate Content', 'Sodium Content']
  };
  
  const methodOptions = {
    organoleptic: ['Visual Verification', 'Sensory Panel', 'Color Meter', 'Texture Analyzer'],
    biological: ['USP <2021>', 'AOAC 2014.05', 'BAM Ch. 4', 'ISO 16649-2', 'AOAC 989.13', 'AOAC 997.02'],
    additional: ['pH Meter', 'Water Activity Meter', 'Moisture Analyzer', 'AOAC 922.06', 'AOAC 981.10', 'Calculation', 'ICP-MS']
  };
  
  const stageOptions = ['Ingredient', 'WIP', 'Finished Product'];

  // Fetch testing specs when component mounts
  useEffect(() => {
    const fetchTestingSpecs = async () => {
      if (!specSheetId) return;
      
      const { data, error } = await supabase
        .from('testing_specs')
        .select('*')
        .eq('spec_sheet_id', specSheetId);
      
      if (error) {
        console.error('Error fetching testing specs:', error);
        initializeEmptySpecs();
      } else if (data && data.length > 0) {
        // Categorize specs by test type
        const organoleptic = data.filter(spec => spec.test_type === 'Organoleptic');
        const biological = data.filter(spec => spec.test_type === 'Biological');
        const additional = data.filter(spec => spec.test_type === 'Additional');
        
        setOrganolepticSpecs(organoleptic.length > 0 ? organoleptic : [getEmptySpec('Organoleptic')]);
        setBiologicalSpecs(biological.length > 0 ? biological : [getEmptySpec('Biological')]);
        setAdditionalSpecs(additional.length > 0 ? additional : [getEmptySpec('Additional')]);
      } else {
        initializeEmptySpecs();
      }
    };
    
    fetchTestingSpecs();
  }, [specSheetId]);

  // Initialize empty specs for each category
  const initializeEmptySpecs = () => {
    setOrganolepticSpecs([getEmptySpec('Organoleptic')]);
    setBiologicalSpecs([getEmptySpec('Biological')]);
    setAdditionalSpecs([getEmptySpec('Additional')]);
  };

  // Helper function to create an empty spec
  const getEmptySpec = (testType) => {
    return {
      id: `temp-${Math.random().toString(36).substring(2, 9)}`,
      spec_sheet_id: specSheetId,
      test_type: testType,
      test_name: '',
      method: '',
      stage: '',
      limit_spec: ''
    };
  };

  // Handle changes to spec fields
  const handleSpecChange = (index, field, value, specType) => {
    let updatedSpecs;
    
    switch (specType) {
      case 'Organoleptic':
        updatedSpecs = [...organolepticSpecs];
        updatedSpecs[index][field] = value;
        setOrganolepticSpecs(updatedSpecs);
        saveSpec(updatedSpecs[index]);
        break;
      case 'Biological':
        updatedSpecs = [...biologicalSpecs];
        updatedSpecs[index][field] = value;
        setBiologicalSpecs(updatedSpecs);
        saveSpec(updatedSpecs[index]);
        break;
      case 'Additional':
        updatedSpecs = [...additionalSpecs];
        updatedSpecs[index][field] = value;
        setAdditionalSpecs(updatedSpecs);
        saveSpec(updatedSpecs[index]);
        break;
      default:
        break;
    }
  };

  // Add a new spec
  const addSpec = (specType) => {
    const newSpec = getEmptySpec(specType);
    
    switch (specType) {
      case 'Organoleptic':
        setOrganolepticSpecs([...organolepticSpecs, newSpec]);
        break;
      case 'Biological':
        setBiologicalSpecs([...biologicalSpecs, newSpec]);
        break;
      case 'Additional':
        setAdditionalSpecs([...additionalSpecs, newSpec]);
        break;
      default:
        break;
    }
  };

  // Remove a spec
  const removeSpec = async (index, specType) => {
    let specToRemove;
    let updatedSpecs;
    
    switch (specType) {
      case 'Organoleptic':
        specToRemove = organolepticSpecs[index];
        updatedSpecs = organolepticSpecs.filter((_, i) => i !== index);
        
        // Ensure we always have at least one spec
        if (updatedSpecs.length === 0) {
          updatedSpecs.push(getEmptySpec(specType));
        }
        
        setOrganolepticSpecs(updatedSpecs);
        break;
      case 'Biological':
        specToRemove = biologicalSpecs[index];
        updatedSpecs = biologicalSpecs.filter((_, i) => i !== index);
        
        if (updatedSpecs.length === 0) {
          updatedSpecs.push(getEmptySpec(specType));
        }
        
        setBiologicalSpecs(updatedSpecs);
        break;
      case 'Additional':
        specToRemove = additionalSpecs[index];
        updatedSpecs = additionalSpecs.filter((_, i) => i !== index);
        
        if (updatedSpecs.length === 0) {
          updatedSpecs.push(getEmptySpec(specType));
        }
        
        setAdditionalSpecs(updatedSpecs);
        break;
      default:
        return;
    }
    
    // If it's a saved spec (has a non-temp id), delete it from the database
    if (specToRemove.id && !specToRemove.id.startsWith('temp-')) {
      await supabase
        .from('testing_specs')
        .delete()
        .eq('id', specToRemove.id);
    }
  };

  // Save spec to database
  const saveSpec = async (spec) => {
    if (!specSheetId) return;
    
    const { id, ...specData } = spec;
    
    // If it's a temporary ID, insert a new record
    if (id.startsWith('temp-')) {
      const { data, error } = await supabase
        .from('testing_specs')
        .insert([specData])
        .select();
      
      if (error) {
        console.error('Error saving testing spec:', error);
      } else if (data && data.length > 0) {
        // Update the ID in the state
        const newId = data[0].id;
        
        switch (spec.test_type) {
          case 'Organoleptic':
            setOrganolepticSpecs(prev => 
              prev.map(item => 
                item.id === id ? { ...item, id: newId } : item
              )
            );
            break;
          case 'Biological':
            setBiologicalSpecs(prev => 
              prev.map(item => 
                item.id === id ? { ...item, id: newId } : item
              )
            );
            break;
          case 'Additional':
            setAdditionalSpecs(prev => 
              prev.map(item => 
                item.id === id ? { ...item, id: newId } : item
              )
            );
            break;
          default:
            break;
        }
      }
    } else {
      // Otherwise, update the existing record
      const { error } = await supabase
        .from('testing_specs')
        .update(specData)
        .eq('id', id);
      
      if (error) {
        console.error('Error updating testing spec:', error);
      }
    }
  };

  // Get the appropriate icon for each test type
  const getTestTypeIcon = (specType) => {
    switch (specType) {
      case 'Organoleptic':
        return faEye;
      case 'Biological':
        return faMicroscope;
      case 'Additional':
        return faAtom;
      default:
        return faFlask;
    }
  };

  // Render a spec table
  const renderSpecTable = (specs, specType) => {
    const options = {
      testOptions: testOptions[specType.toLowerCase()],
      methodOptions: methodOptions[specType.toLowerCase()],
      stageOptions: stageOptions
    };
    
    return (
      <div className="spec-table-section">
        <h4>
          <FontAwesomeIcon icon={getTestTypeIcon(specType)} /> {specType} Specs
        </h4>
        <table className="testing-table">
          <thead>
            <tr>
              <th>Test</th>
              <th>Method</th>
              <th>Stage</th>
              <th>Limit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {specs.map((spec, index) => (
              <tr key={spec.id || index}>
                <td>
                  <select
                    className="testing-select"
                    value={spec.test_name || ''}
                    onChange={(e) => handleSpecChange(index, 'test_name', e.target.value, specType)}
                  >
                    <option value="">Select Test</option>
                    {options.testOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    className="testing-select"
                    value={spec.method || ''}
                    onChange={(e) => handleSpecChange(index, 'method', e.target.value, specType)}
                  >
                    <option value="">Select Method</option>
                    {options.methodOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    className="testing-select"
                    value={spec.stage || ''}
                    onChange={(e) => handleSpecChange(index, 'stage', e.target.value, specType)}
                  >
                    <option value="">Select Stage</option>
                    {options.stageOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    className="testing-input"
                    value={spec.limit_spec || ''}
                    onChange={(e) => handleSpecChange(index, 'limit_spec', e.target.value, specType)}
                    placeholder={specType === 'Biological' ? '≤1500 CFU/g, Absent/25g' : ''}
                  />
                </td>
                <td>
                  <button 
                    className="testing-action-btn"
                    onClick={() => removeSpec(index, specType)}
                    title="Remove Test"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <button 
          className="testing-add-btn"
          onClick={() => addSpec(specType)}
        >
          <FontAwesomeIcon icon={faPlus} /> Add {specType} Test
        </button>
      </div>
    );
  };

  return (
    <div className="product-testing-container">
      {renderSpecTable(organolepticSpecs, 'Organoleptic')}
      {renderSpecTable(biologicalSpecs, 'Biological')}
      {renderSpecTable(additionalSpecs, 'Additional')}
    </div>
  );
}

export default ProductTesting;
