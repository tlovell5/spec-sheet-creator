import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { jsPDF } from 'jspdf';

// Create the SpecSheet context
export const SpecSheetContext = createContext();

// Create a debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Helper function to convert camelCase to snake_case for Supabase
const camelToSnakeCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const snakeCaseObj = {};
  
  // List of fields that need conversion
  const fieldMappings = {
    activityLog: 'activity_log',
    billOfMaterials: 'bill_of_materials',
    customerInfo: 'customer_info',
    productIdentification: 'product_identification',
    packagingClaims: 'packaging_claims',
    productionDetails: 'production_details',
    packoutDetails: 'packout_details',
    mixInstructions: 'mix_instructions',
    productTesting: 'product_testing',
    equipmentSpecifications: 'equipment_specifications',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    createdBy: 'created_by',
    documentType: 'document_type'
  };
  
  // Convert fields based on mapping
  Object.keys(obj).forEach(key => {
    const snakeKey = fieldMappings[key] || key;
    
    // Special handling for activityLog
    if (key === 'activityLog' && Array.isArray(obj[key])) {
      snakeCaseObj[snakeKey] = { logs: obj[key] };
    } else {
      snakeCaseObj[snakeKey] = obj[key];
    }
  });
  
  // Remove camelCase duplicates
  Object.keys(fieldMappings).forEach(camelKey => {
    if (snakeCaseObj[camelKey] && snakeCaseObj[fieldMappings[camelKey]]) {
      delete snakeCaseObj[camelKey];
    }
  });
  
  return snakeCaseObj;
};

// Helper function to convert snake_case to camelCase for React
const snakeToCamelCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const camelCaseObj = { ...obj };
  
  // List of fields that need conversion
  const fieldMappings = {
    activity_log: 'activityLog',
    bill_of_materials: 'billOfMaterials',
    customer_info: 'customerInfo',
    product_identification: 'productIdentification',
    packaging_claims: 'packagingClaims',
    production_details: 'productionDetails',
    packout_details: 'packoutDetails',
    mix_instructions: 'mixInstructions',
    product_testing: 'productTesting',
    equipment_specifications: 'equipmentSpecifications',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
    created_by: 'createdBy',
    document_type: 'documentType'
  };
  
  // Convert fields based on mapping
  Object.keys(fieldMappings).forEach(snakeKey => {
    if (camelCaseObj[snakeKey] !== undefined) {
      // Special handling for activity_log
      if (snakeKey === 'activity_log' && camelCaseObj[snakeKey] && camelCaseObj[snakeKey].logs) {
        camelCaseObj[fieldMappings[snakeKey]] = camelCaseObj[snakeKey].logs;
      } else {
        camelCaseObj[fieldMappings[snakeKey]] = camelCaseObj[snakeKey];
      }
      delete camelCaseObj[snakeKey];
    }
  });
  
  return camelCaseObj;
};

// Create the SpecSheet provider component
export const SpecSheetProvider = ({ children, specSheetId }) => {
  // State for spec sheet data
  const initialState = {
    id: null,
    documentType: 'Spec Sheet',
    status: 'Draft',
    revision: '1.0',
    customerInfo: {
      companyName: '',
      companyAddress: '',
      contactName: '',
      email: '',
      phone: '',
      logo: null
    },
    productIdentification: {
      productName: '',
      skuId: '',
      bomId: '',
      wipId: '',
      specRevision: '',
      intendedUse: 'Retail',
      netWeight: '',
      weightUnit: 'g',
      unitsPerCase: '',
      casesPerPallet: '',
      unitsPerPallet: '',
      unitUpc: '',
      caseUpc: '',
      palletUpc: '',
      lotCodeFormat: '',
      shelfLifeYears: '0',
      shelfLifeMonths: '0',
      productImage: null
    },
    packagingClaims: {
      allergens: [],
      claims: []
    },
    billOfMaterials: {
      ingredients: [],
      inclusions: [],
      packaging: [],
      caseItems: []
    },
    productionDetails: {
      packagingWeight: 0,
      unitInclusionWeight: 0,
      unitIngredientWeight: 0,
      unitNetWeight: 0,
      frontArtwork: null,
      backArtwork: null,
      lotCodePlacement: null,
      inclusionImage: null
    },
    packoutDetails: {
      caseConfiguration: '',
      caseLabelSize: '2x2',
      caseLabelPlacement: '',
      totalCaseWeight: 0,
      tiHi: '',
      palletConfiguration: '',
      palletWeight: 0,
      singleLayerConfig: null,
      twoLayerConfig: null,
      fullPalletConfig: null
    },
    mixInstructions: [],
    productTesting: {
      organoleptic: [],
      biological: [],
      additional: []
    },
    equipmentSpecifications: [],
    signatures: {
      customer: { name: '', signature: null, date: null },
      qualityManager: { name: '', signature: null, date: null },
      productionManager: { name: '', signature: null, date: null }
    },
    activityLog: [],
    createdAt: null,
    updatedAt: null,
    createdBy: null
  };
  
  const [specSheetData, setSpecSheetData] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved');
  
  // Use refs to track previous values and prevent infinite loops
  const prevSpecSheetDataRef = useRef(null);
  const isUpdatingRef = useRef(false);
  const initialLoadRef = useRef(true);
  
  // Fetch spec sheet data by ID
  const fetchSpecSheet = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('spec_sheets')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Convert snake_case database fields to camelCase for React state
        const formattedData = snakeToCamelCase(data);
        setSpecSheetData(formattedData);
      }
      
      setLoading(false);
      return data;
    } catch (err) {
      console.error('Error fetching spec sheet:', err);
      setError('Failed to load spec sheet data');
      setLoading(false);
      return null;
    }
  };
  
  // Fetch spec sheet data if ID is provided
  useEffect(() => {
    const fetchSpecSheetData = async () => {
      if (!specSheetId) {
        setLoading(false);
        return;
      }
      
      const result = await fetchSpecSheet(specSheetId);
      if (result.error) {
        throw result.error;
      }
    };
    
    fetchSpecSheetData();
  }, [specSheetId]);
  
  // Calculate derived values - DISABLED TO PREVENT INFINITE LOOPS
  useEffect(() => {
    // This effect is completely disabled to prevent infinite loops
    // The user will need to manually calculate units per pallet for now
    return;
    
    /* Original code commented out
    // Skip if loading or updating
    if (loading || isUpdatingRef.current) return;
    
    // Skip if no relevant data
    if (!specSheetData.productIdentification || 
        !specSheetData.productIdentification.unitsPerCase || 
        !specSheetData.productIdentification.casesPerPallet) {
      return;
    }
    
    const unitsPerCase = parseInt(specSheetData.productIdentification.unitsPerCase) || 0;
    const casesPerPallet = parseInt(specSheetData.productIdentification.casesPerPallet) || 0;
    const unitsPerPallet = unitsPerCase * casesPerPallet;
    
    // Only update if the value has changed
    if (specSheetData.productIdentification.unitsPerPallet === unitsPerPallet.toString()) {
      return;
    }
    
    // Set updating flag to prevent loops
    isUpdatingRef.current = true;
    
    setSpecSheetData(prevData => {
      const newData = {
        ...prevData,
        productIdentification: {
          ...prevData.productIdentification,
          unitsPerPallet: unitsPerPallet.toString()
        }
      };
      return newData;
    });
    
    // Reset updating flag
    isUpdatingRef.current = false;
    */
  }, []);  // Empty dependency array to prevent this from running
  
  // Save spec sheet data to database
  const saveSpecSheet = useCallback(async (specSheetToSave = null) => {
    try {
      setSaveStatus('saving');
      
      let dataToSave = specSheetToSave || {
        ...specSheetData,
        updatedAt: new Date().toISOString()
      };
      
      // Convert camelCase fields to snake_case for Supabase
      dataToSave = camelToSnakeCase(dataToSave);
      
      // For new spec sheets, set created_at
      if (!dataToSave.id) {
        if (!dataToSave.created_at) {
          dataToSave.created_at = new Date().toISOString();
        }
        
        console.log("Saving new spec sheet with data:", JSON.stringify(dataToSave));
        
        const { data, error } = await supabase
          .from('spec_sheets')
          .insert([dataToSave])
          .select();
        
        if (error) {
          console.error("Insert error:", error);
          throw error;
        }
        
        if (data && data.length > 0) {
          // Convert snake_case back to camelCase for React state
          const formattedData = snakeToCamelCase(data[0]);
          setSpecSheetData(formattedData);
          console.log("Successfully saved new spec sheet:", formattedData.id);
        }
        
        setSaveStatus('saved');
        return { data: data?.[0], error: null };
      } else {
        // Update existing spec sheet
        console.log("Updating spec sheet:", dataToSave.id);
        
        const { data, error } = await supabase
          .from('spec_sheets')
          .update(dataToSave)
          .eq('id', dataToSave.id)
          .select();
        
        if (error) {
          console.error("Update error:", error);
          throw error;
        }
        
        if (!specSheetToSave) {
          // Only update local state if this wasn't an external save
          if (data && data.length > 0) {
            // Convert snake_case back to camelCase for React state
            const formattedData = snakeToCamelCase(data[0]);
            setSpecSheetData(formattedData);
            console.log("Successfully updated spec sheet:", formattedData.id);
          } else {
            // If no data returned, update local state with the saved data
            // but ensure we convert snake_case back to camelCase
            const formattedDataToSave = snakeToCamelCase(dataToSave);
            setSpecSheetData(formattedDataToSave);
          }
        }
        
        setSaveStatus('saved');
        return { data: data?.[0] || dataToSave, error: null };
      }
    } catch (err) {
      console.error('Error saving spec sheet:', err);
      setSaveStatus('error');
      setError('Failed to save spec sheet data: ' + (err.message || JSON.stringify(err)));
      return { data: null, error: err };
    }
  }, [specSheetData]);
  
  // Debounced save function
  const debouncedSave = useCallback(
    debounce(() => {
      if (!isUpdatingRef.current) {
        saveSpecSheet();
      }
    }, 2000),
    [saveSpecSheet]
  );
  
  // Auto-save when data changes - DISABLED TO PREVENT INFINITE LOOPS
  useEffect(() => {
    // This effect is completely disabled to prevent infinite loops
    // The user will need to manually save using the save button
    return;
    
    /* Original code commented out
    // Skip during initial load or if updating
    if (initialLoadRef.current || isUpdatingRef.current) {
      initialLoadRef.current = false;
      return;
    }
    
    // Skip if loading or no ID
    if (loading || !specSheetData.id) return;
    
    // Compare with previous data
    const prevData = prevSpecSheetDataRef.current;
    if (prevData && JSON.stringify(prevData) === JSON.stringify(specSheetData)) {
      return; // Skip if data hasn't changed
    }
    
    // Update ref with current data (deep clone to avoid reference issues)
    prevSpecSheetDataRef.current = JSON.parse(JSON.stringify(specSheetData));
    
    // Set status and trigger save
    setSaveStatus('unsaved');
    debouncedSave();
    */
  }, []);  // Empty dependency array to prevent this from running
  
  // Send spec sheet for review
  const sendForReview = async (reviewers) => {
    try {
      // Save the spec sheet first
      const saved = await saveSpecSheet();
      
      if (!saved) {
        throw new Error('Failed to save spec sheet before sending for review');
      }
      
      // Update status to 'In Review'
      const updatedData = {
        ...specSheetData,
        status: 'In Review',
        updatedAt: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('spec_sheets')
        .update(updatedData)
        .eq('id', specSheetData.id);
      
      if (error) {
        throw error;
      }
      
      // Create review requests
      const reviewRequests = reviewers.map(reviewer => ({
        spec_sheet_id: specSheetData.id,
        reviewer_email: reviewer.email,
        reviewer_name: reviewer.name,
        status: 'Pending',
        created_at: new Date().toISOString()
      }));
      
      const { error: reviewError } = await supabase
        .from('review_requests')
        .insert(reviewRequests);
      
      if (reviewError) {
        throw reviewError;
      }
      
      // Update local state
      setSpecSheetData(updatedData);
      
      // Add to activity log
      const reviewerNames = reviewers.map(r => r.name).join(', ');
      addToActivityLog(`Sent for review to: ${reviewerNames}`);
      
      return true;
    } catch (err) {
      console.error('Error sending spec sheet for review:', err);
      setError('Failed to send spec sheet for review');
      return false;
    }
  };
  
  // Add entry to activity log
  const addToActivityLog = (action) => {
    const logEntry = {
      action,
      timestamp: new Date().toISOString(),
      user: 'Current User' // Replace with actual user info
    };
    
    setSpecSheetData(prevData => ({
      ...prevData,
      activityLog: [...prevData.activityLog, logEntry]
    }));
  };
  
  // Export spec sheet as PDF
  const exportAsPdf = async () => {
    try {
      // Get the spec sheet container element
      const element = document.getElementById('spec-sheet-container');
      
      if (!element) {
        throw new Error('Element not found');
      }
      
      // Create a new jsPDF instance
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add logo to the top left
      if (specSheetData.customerInfo.logo) {
        pdf.addImage(
          specSheetData.customerInfo.logo,
          'JPEG',
          10,
          10,
          40,
          20
        );
      }
      
      // Add title
      pdf.setFontSize(18);
      pdf.text(
        `${specSheetData.productIdentification.productName || 'Spec Sheet'}`,
        pdf.internal.pageSize.width / 2,
        20,
        { align: 'center' }
      );
      
      // Add revision and date
      pdf.setFontSize(10);
      pdf.text(
        `Revision: ${specSheetData.revision}`,
        10,
        pdf.internal.pageSize.height - 10
      );
      
      // Add page number
      pdf.text(
        `Page 1 of 1`,
        pdf.internal.pageSize.width - 20,
        pdf.internal.pageSize.height - 10
      );
      
      // Save the PDF
      pdf.save(`${specSheetData.productIdentification.productName || 'spec-sheet'}.pdf`);
      
      // Add to activity log
      addToActivityLog('Exported spec sheet as PDF');
      
      return true;
    } catch (err) {
      console.error('Error exporting spec sheet as PDF:', err);
      setError('Failed to export spec sheet as PDF');
      return false;
    }
  };
  
  // Context value
  const contextValue = {
    specSheetData,
    setSpecSheetData,
    loading,
    error,
    saveStatus,
    saveSpecSheet,
    sendForReview,
    exportAsPdf,
    addToActivityLog,
    fetchSpecSheet
  };
  
  return (
    <SpecSheetContext.Provider value={contextValue}>
      {children}
    </SpecSheetContext.Provider>
  );
};

export default SpecSheetProvider;
