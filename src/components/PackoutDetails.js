import React, { useContext, useEffect, useState } from 'react';
import { SpecSheetContext } from '../context/SpecSheetContext';
import { calculateTotalCaseWeight, calculatePalletWeight } from '../utils/weightUtils';

const PackoutDetails = () => {
  const { specSheetData, setSpecSheetData } = useContext(SpecSheetContext);
  const [totalCaseWeight, setTotalCaseWeight] = useState(0);
  const [totalPalletWeight, setTotalPalletWeight] = useState(0);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setSpecSheetData(prevData => ({
      ...prevData,
      packoutDetails: {
        ...prevData.packoutDetails,
        [name]: value
      }
    }));
  };
  
  // Calculate total case weight when relevant data changes
  useEffect(() => {
    if (
      specSheetData.productIdentification?.netWeight &&
      specSheetData.productIdentification?.unitsPerCase
    ) {
      // Get unit net weight in grams
      const unitNetWeight = parseFloat(specSheetData.productIdentification.netWeight) || 0;
      const unitWeightUnit = specSheetData.productIdentification.weightUnit || 'g';
      const unitsPerCase = parseInt(specSheetData.productIdentification.unitsPerCase) || 0;
      
      // Calculate case weight (sum of all case items)
      const caseWeight = (specSheetData.billOfMaterials?.caseItems || []).reduce((sum, item) => {
        return sum + (parseFloat(item.weight) || 0);
      }, 0);
      
      // Calculate total case weight
      const totalWeight = calculateTotalCaseWeight(unitNetWeight, unitsPerCase, caseWeight);
      setTotalCaseWeight(totalWeight);
      
      // Update context with calculated weight
      setSpecSheetData(prevData => ({
        ...prevData,
        packoutDetails: {
          ...prevData.packoutDetails,
          totalCaseWeightLbs: totalWeight.toFixed(2)
        }
      }));
    }
  }, [
    specSheetData.productIdentification?.netWeight,
    specSheetData.productIdentification?.weightUnit,
    specSheetData.productIdentification?.unitsPerCase,
    specSheetData.billOfMaterials?.caseItems,
    setSpecSheetData
  ]);
  
  // Calculate total pallet weight when case weight or cases per pallet changes
  useEffect(() => {
    if (
      specSheetData.packoutDetails?.totalCaseWeightLbs &&
      specSheetData.productIdentification?.casesPerPallet
    ) {
      const caseWeightLbs = parseFloat(specSheetData.packoutDetails.totalCaseWeightLbs) || 0;
      const casesPerPallet = parseInt(specSheetData.productIdentification.casesPerPallet) || 0;
      
      // Calculate pallet weight
      const palletWeight = calculatePalletWeight(caseWeightLbs, casesPerPallet);
      setTotalPalletWeight(palletWeight);
      
      // Update context with calculated weight
      setSpecSheetData(prevData => ({
        ...prevData,
        packoutDetails: {
          ...prevData.packoutDetails,
          totalPalletWeightLbs: palletWeight.toFixed(2)
        }
      }));
    }
  }, [
    specSheetData.packoutDetails?.totalCaseWeightLbs,
    specSheetData.productIdentification?.casesPerPallet,
    setSpecSheetData
  ]);

  return (
    <div className="card spec-sheet-section">
      <div className="card-header spec-sheet-section-header">
        <h2 className="spec-sheet-section-title">Packout Details</h2>
      </div>
      
      <div className="card-body">
        <div className="form-section mb-4">
          <h3 className="mb-3">Case Configuration</h3>
          
          <div className="form-row d-flex">
            <div className="form-group mr-3" style={{ flex: 1 }}>
              <label htmlFor="caseLength" className="form-label">Case Length (in)</label>
              <input
                type="number"
                id="caseLength"
                name="caseLength"
                className="form-control"
                value={specSheetData.packoutDetails?.caseLength || ''}
                onChange={handleInputChange}
                placeholder="Enter case length"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="form-group mr-3" style={{ flex: 1 }}>
              <label htmlFor="caseWidth" className="form-label">Case Width (in)</label>
              <input
                type="number"
                id="caseWidth"
                name="caseWidth"
                className="form-control"
                value={specSheetData.packoutDetails?.caseWidth || ''}
                onChange={handleInputChange}
                placeholder="Enter case width"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="caseHeight" className="form-label">Case Height (in)</label>
              <input
                type="number"
                id="caseHeight"
                name="caseHeight"
                className="form-control"
                value={specSheetData.packoutDetails?.caseHeight || ''}
                onChange={handleInputChange}
                placeholder="Enter case height"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          
          <div className="form-row d-flex">
            <div className="form-group mr-3" style={{ flex: 1 }}>
              <label htmlFor="caseTi" className="form-label">Case Ti (cases per layer)</label>
              <input
                type="number"
                id="caseTi"
                name="caseTi"
                className="form-control"
                value={specSheetData.packoutDetails?.caseTi || ''}
                onChange={handleInputChange}
                placeholder="Enter Ti"
                min="0"
                step="1"
              />
            </div>
            
            <div className="form-group mr-3" style={{ flex: 1 }}>
              <label htmlFor="caseHi" className="form-label">Case Hi (layers per pallet)</label>
              <input
                type="number"
                id="caseHi"
                name="caseHi"
                className="form-control"
                value={specSheetData.packoutDetails?.caseHi || ''}
                onChange={handleInputChange}
                placeholder="Enter Hi"
                min="0"
                step="1"
              />
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="totalCaseWeightLbs" className="form-label">Total Case Weight (lbs)</label>
              <input
                type="text"
                id="totalCaseWeightLbs"
                name="totalCaseWeightLbs"
                className="form-control"
                value={specSheetData.packoutDetails?.totalCaseWeightLbs || ''}
                readOnly
                placeholder="Calculated automatically"
              />
            </div>
          </div>
        </div>
        
        <div className="form-section mb-4">
          <h3 className="mb-3">Pallet Information</h3>
          
          <div className="form-row d-flex">
            <div className="form-group mr-3" style={{ flex: 1 }}>
              <label htmlFor="palletType" className="form-label">Pallet Type</label>
              <select
                id="palletType"
                name="palletType"
                className="form-control"
                value={specSheetData.packoutDetails?.palletType || 'Standard'}
                onChange={handleInputChange}
              >
                <option value="Standard">Standard</option>
                <option value="Euro">Euro</option>
                <option value="CHEP">CHEP</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
            
            <div className="form-group mr-3" style={{ flex: 1 }}>
              <label htmlFor="palletLength" className="form-label">Pallet Length (in)</label>
              <input
                type="number"
                id="palletLength"
                name="palletLength"
                className="form-control"
                value={specSheetData.packoutDetails?.palletLength || ''}
                onChange={handleInputChange}
                placeholder="Enter pallet length"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="palletWidth" className="form-label">Pallet Width (in)</label>
              <input
                type="number"
                id="palletWidth"
                name="palletWidth"
                className="form-control"
                value={specSheetData.packoutDetails?.palletWidth || ''}
                onChange={handleInputChange}
                placeholder="Enter pallet width"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          
          <div className="form-row d-flex">
            <div className="form-group mr-3" style={{ flex: 1 }}>
              <label htmlFor="palletHeight" className="form-label">Pallet Height (in)</label>
              <input
                type="number"
                id="palletHeight"
                name="palletHeight"
                className="form-control"
                value={specSheetData.packoutDetails?.palletHeight || ''}
                onChange={handleInputChange}
                placeholder="Enter pallet height"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="form-group mr-3" style={{ flex: 1 }}>
              <label htmlFor="palletWeight" className="form-label">Pallet Weight (lbs)</label>
              <input
                type="number"
                id="palletWeight"
                name="palletWeight"
                className="form-control"
                value={specSheetData.packoutDetails?.palletWeight || ''}
                onChange={handleInputChange}
                placeholder="Enter pallet weight"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="totalPalletWeightLbs" className="form-label">Total Pallet Weight (lbs)</label>
              <input
                type="text"
                id="totalPalletWeightLbs"
                name="totalPalletWeightLbs"
                className="form-control"
                value={specSheetData.packoutDetails?.totalPalletWeightLbs || ''}
                readOnly
                placeholder="Calculated automatically"
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3 className="mb-3">Shipping Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="shippingNotes" className="form-label">Shipping Notes</label>
              <textarea
                id="shippingNotes"
                name="shippingNotes"
                className="form-control"
                value={specSheetData.packoutDetails?.shippingNotes || ''}
                onChange={handleInputChange}
                placeholder="Enter any special shipping or handling instructions"
                rows="4"
              ></textarea>
            </div>
          </div>
          
          <div className="form-row d-flex">
            <div className="form-group mr-3" style={{ flex: 1 }}>
              <label htmlFor="storageConditions" className="form-label">Storage Conditions</label>
              <select
                id="storageConditions"
                name="storageConditions"
                className="form-control"
                value={specSheetData.packoutDetails?.storageConditions || ''}
                onChange={handleInputChange}
              >
                <option value="">Select storage condition</option>
                <option value="Ambient">Ambient</option>
                <option value="Refrigerated">Refrigerated</option>
                <option value="Frozen">Frozen</option>
                <option value="Cool Dry Place">Cool Dry Place</option>
              </select>
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="temperatureRange" className="form-label">Temperature Range</label>
              <input
                type="text"
                id="temperatureRange"
                name="temperatureRange"
                className="form-control"
                value={specSheetData.packoutDetails?.temperatureRange || ''}
                onChange={handleInputChange}
                placeholder="e.g., 35-40°F"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackoutDetails;
