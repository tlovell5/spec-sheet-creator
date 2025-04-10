import React, { useContext } from 'react';
import { SpecSheetContext } from '../context/SpecSheetContext';

const ProductTesting = () => {
  const { specSheetData, setSpecSheetData } = useContext(SpecSheetContext);
  
  // Initialize testing data if not present
  const organolepticSpecs = specSheetData.productTesting?.organolepticSpecs || [];
  const biologicalSpecs = specSheetData.productTesting?.biologicalSpecs || [];
  
  // Handle organoleptic spec changes
  const handleOrganolepticChange = (index, field, value) => {
    const updatedSpecs = [...organolepticSpecs];
    
    if (!updatedSpecs[index]) {
      updatedSpecs[index] = {};
    }
    
    updatedSpecs[index][field] = value;
    
    setSpecSheetData(prevData => ({
      ...prevData,
      productTesting: {
        ...prevData.productTesting,
        organolepticSpecs: updatedSpecs
      }
    }));
  };
  
  // Add a new organoleptic spec
  const handleAddOrganolepticSpec = () => {
    const newSpec = {
      attribute: '',
      specification: '',
      method: '',
      frequency: ''
    };
    
    setSpecSheetData(prevData => ({
      ...prevData,
      productTesting: {
        ...prevData.productTesting,
        organolepticSpecs: [...(prevData.productTesting?.organolepticSpecs || []), newSpec]
      }
    }));
  };
  
  // Remove an organoleptic spec
  const handleRemoveOrganolepticSpec = (index) => {
    const updatedSpecs = [...organolepticSpecs];
    updatedSpecs.splice(index, 1);
    
    setSpecSheetData(prevData => ({
      ...prevData,
      productTesting: {
        ...prevData.productTesting,
        organolepticSpecs: updatedSpecs
      }
    }));
  };
  
  // Handle biological spec changes
  const handleBiologicalChange = (index, field, value) => {
    const updatedSpecs = [...biologicalSpecs];
    
    if (!updatedSpecs[index]) {
      updatedSpecs[index] = {};
    }
    
    updatedSpecs[index][field] = value;
    
    setSpecSheetData(prevData => ({
      ...prevData,
      productTesting: {
        ...prevData.productTesting,
        biologicalSpecs: updatedSpecs
      }
    }));
  };
  
  // Add a new biological spec
  const handleAddBiologicalSpec = () => {
    const newSpec = {
      test: '',
      specification: '',
      method: '',
      frequency: ''
    };
    
    setSpecSheetData(prevData => ({
      ...prevData,
      productTesting: {
        ...prevData.productTesting,
        biologicalSpecs: [...(prevData.productTesting?.biologicalSpecs || []), newSpec]
      }
    }));
  };
  
  // Remove a biological spec
  const handleRemoveBiologicalSpec = (index) => {
    const updatedSpecs = [...biologicalSpecs];
    updatedSpecs.splice(index, 1);
    
    setSpecSheetData(prevData => ({
      ...prevData,
      productTesting: {
        ...prevData.productTesting,
        biologicalSpecs: updatedSpecs
      }
    }));
  };
  
  // Handle general testing notes change
  const handleTestingNotesChange = (e) => {
    const { value } = e.target;
    
    setSpecSheetData(prevData => ({
      ...prevData,
      productTesting: {
        ...prevData.productTesting,
        testingNotes: value
      }
    }));
  };

  return (
    <div className="card spec-sheet-section">
      <div className="card-header spec-sheet-section-header">
        <h2 className="spec-sheet-section-title">Product Testing</h2>
      </div>
      
      <div className="card-body">
        <div className="form-section mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Organoleptic Specifications</h3>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddOrganolepticSpec}
            >
              Add Specification
            </button>
          </div>
          
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Attribute</th>
                  <th>Specification</th>
                  <th>Test Method</th>
                  <th>Frequency</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {organolepticSpecs.map((spec, index) => (
                  <tr key={index}>
                    <td>
                      <select
                        className="form-control"
                        value={spec.attribute || ''}
                        onChange={(e) => handleOrganolepticChange(index, 'attribute', e.target.value)}
                      >
                        <option value="">Select Attribute</option>
                        <option value="Appearance">Appearance</option>
                        <option value="Color">Color</option>
                        <option value="Odor">Odor</option>
                        <option value="Taste">Taste</option>
                        <option value="Texture">Texture</option>
                        <option value="Mouthfeel">Mouthfeel</option>
                        <option value="Aroma">Aroma</option>
                        <option value="Other">Other</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={spec.specification || ''}
                        onChange={(e) => handleOrganolepticChange(index, 'specification', e.target.value)}
                        placeholder="Enter specification"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={spec.method || ''}
                        onChange={(e) => handleOrganolepticChange(index, 'method', e.target.value)}
                        placeholder="Enter test method"
                      />
                    </td>
                    <td>
                      <select
                        className="form-control"
                        value={spec.frequency || ''}
                        onChange={(e) => handleOrganolepticChange(index, 'frequency', e.target.value)}
                      >
                        <option value="">Select Frequency</option>
                        <option value="Each Batch">Each Batch</option>
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Annually">Annually</option>
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemoveOrganolepticSpec(index)}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
                {organolepticSpecs.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center">
                      <em>No specifications added yet</em>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="form-section mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Biological Specifications</h3>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddBiologicalSpec}
            >
              Add Specification
            </button>
          </div>
          
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Test</th>
                  <th>Specification</th>
                  <th>Test Method</th>
                  <th>Frequency</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {biologicalSpecs.map((spec, index) => (
                  <tr key={index}>
                    <td>
                      <select
                        className="form-control"
                        value={spec.test || ''}
                        onChange={(e) => handleBiologicalChange(index, 'test', e.target.value)}
                      >
                        <option value="">Select Test</option>
                        <option value="Total Plate Count">Total Plate Count</option>
                        <option value="Yeast and Mold">Yeast and Mold</option>
                        <option value="Coliform">Coliform</option>
                        <option value="E. coli">E. coli</option>
                        <option value="Salmonella">Salmonella</option>
                        <option value="Listeria">Listeria</option>
                        <option value="Staphylococcus aureus">Staphylococcus aureus</option>
                        <option value="Water Activity">Water Activity</option>
                        <option value="pH">pH</option>
                        <option value="Other">Other</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={spec.specification || ''}
                        onChange={(e) => handleBiologicalChange(index, 'specification', e.target.value)}
                        placeholder="Enter specification"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={spec.method || ''}
                        onChange={(e) => handleBiologicalChange(index, 'method', e.target.value)}
                        placeholder="Enter test method"
                      />
                    </td>
                    <td>
                      <select
                        className="form-control"
                        value={spec.frequency || ''}
                        onChange={(e) => handleBiologicalChange(index, 'frequency', e.target.value)}
                      >
                        <option value="">Select Frequency</option>
                        <option value="Each Batch">Each Batch</option>
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Annually">Annually</option>
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemoveBiologicalSpec(index)}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
                {biologicalSpecs.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center">
                      <em>No specifications added yet</em>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="form-section">
          <h3 className="mb-3">Testing Notes</h3>
          <div className="form-row">
            <div className="form-group">
              <textarea
                className="form-control"
                value={specSheetData.productTesting?.testingNotes || ''}
                onChange={handleTestingNotesChange}
                placeholder="Enter additional testing notes or requirements"
                rows="4"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductTesting;
