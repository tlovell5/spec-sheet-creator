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
      
      // Check if this is a new spec sheet (no id or id is null/undefined)
      const isNewSpecSheet = !dataToSave.id;
      
      if (isNewSpecSheet) {
        // For new spec sheets, set created_at
        if (!dataToSave.created_at) {
          dataToSave.created_at = new Date().toISOString();
        }
        
        // ALWAYS remove the id field completely for new records
        // This ensures Supabase will generate a UUID
        delete dataToSave.id;
        
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
  const exportAsPdf = useCallback(async (specSheetToExport = null) => {
    try {
      const data = specSheetToExport || specSheetData;
      
      // Create a new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Set smaller font size for compact printing
      const normalFontSize = 9;
      const headerFontSize = 12;
      const subheaderFontSize = 10;
      
      // Add title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`${data.documentType}: ${data.productIdentification?.productName || 'New Product'}`, 15, 15);
      
      // Add revision and date
      doc.setFontSize(normalFontSize);
      doc.setFont('helvetica', 'normal');
      doc.text(`Revision: ${data.revision || '1.0'} | Status: ${data.status || 'Draft'} | Date: ${new Date().toLocaleDateString()}`, 15, 22);
      
      let yPos = 30;
      const pageWidth = doc.internal.pageSize.width;
      const contentWidth = pageWidth - 30; // 15mm margins on each side
      
      // Helper function to add section headers
      const addSectionHeader = (title, y) => {
        doc.setFontSize(headerFontSize);
        doc.setFont('helvetica', 'bold');
        doc.setDrawColor(0);
        doc.setFillColor(240, 240, 240);
        doc.rect(15, y, contentWidth, 7, 'F');
        doc.text(title, 17, y + 5);
        return y + 10;
      };
      
      // Helper function to add subsection headers
      const addSubsectionHeader = (title, y) => {
        doc.setFontSize(subheaderFontSize);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 15, y);
        return y + 5;
      };
      
      // Helper function to add text with label
      const addLabeledText = (label, value, y, indent = 0) => {
        doc.setFontSize(normalFontSize);
        doc.setFont('helvetica', 'bold');
        doc.text(label, 15 + indent, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`: ${value || ''}`, 15 + indent + doc.getTextWidth(label), y);
        return y + 5;
      };
      
      // Helper function to check if we need a new page
      const checkNewPage = (y, requiredSpace = 20) => {
        if (y + requiredSpace > doc.internal.pageSize.height - 15) {
          doc.addPage();
          return 15; // Reset y position to top of new page with margin
        }
        return y;
      };
      
      // Customer Info Section
      yPos = addSectionHeader('Customer Information', yPos);
      if (data.customerInfo) {
        yPos = addLabeledText('Company', data.customerInfo.name, yPos);
        yPos = addLabeledText('Contact', data.customerInfo.contactName, yPos);
        yPos = addLabeledText('Email', data.customerInfo.contactEmail, yPos);
        yPos = addLabeledText('Phone', data.customerInfo.contactPhone, yPos);
      }
      
      // Product Identification Section
      yPos = checkNewPage(yPos);
      yPos = addSectionHeader('Product Identification', yPos);
      if (data.productIdentification) {
        yPos = addLabeledText('Product Name', data.productIdentification.productName, yPos);
        yPos = addLabeledText('Product Code', data.productIdentification.productCode, yPos);
        yPos = addLabeledText('UPC', data.productIdentification.upc, yPos);
        yPos = addLabeledText('Net Weight', `${data.productIdentification.netWeight || ''} ${data.productIdentification.netWeightUnit || ''}`, yPos);
        yPos = addLabeledText('Packaging Claim Weight', `${data.productIdentification.packagingClaimWeight || ''} ${data.productIdentification.packagingClaimWeightUnit || ''}`, yPos);
      }
      
      // Packaging Claims Section - Compact format
      yPos = checkNewPage(yPos);
      yPos = addSectionHeader('Packaging Claims', yPos);
      if (data.packagingClaims) {
        // Allergens in a compact format
        if (data.packagingClaims.allergens && data.packagingClaims.allergens.length > 0) {
          yPos = addSubsectionHeader('Allergens', yPos);
          const allergensText = data.packagingClaims.allergens.join(', ');
          doc.setFontSize(normalFontSize);
          doc.setFont('helvetica', 'normal');
          doc.text(allergensText, 15, yPos, { maxWidth: contentWidth });
          yPos += 8;
        }
        
        // Claims in a compact format
        if (data.packagingClaims.claims && data.packagingClaims.claims.length > 0) {
          yPos = addSubsectionHeader('Claims', yPos);
          const claimsText = data.packagingClaims.claims.join(', ');
          doc.setFontSize(normalFontSize);
          doc.setFont('helvetica', 'normal');
          doc.text(claimsText, 15, yPos, { maxWidth: contentWidth });
          yPos += 8;
        }
      }
      
      // Bill of Materials Section - Table format for compactness
      yPos = checkNewPage(yPos, 40); // Need more space for tables
      yPos = addSectionHeader('Bill of Materials', yPos);
      
      // Ingredients Table
      if (data.billOfMaterials && data.billOfMaterials.ingredients && data.billOfMaterials.ingredients.length > 0) {
        yPos = addSubsectionHeader('Ingredients', yPos);
        
        const ingredientsTableData = data.billOfMaterials.ingredients.map(ingredient => [
          ingredient.name || '',
          ingredient.percentage ? `${ingredient.percentage}%` : '',
          ingredient.weight ? `${ingredient.weight} lbs` : '',
          ingredient.supplier || '',
          ingredient.notes || ''
        ]);
        
        doc.autoTable({
          head: [['Ingredient', 'Percentage', 'Weight', 'Supplier', 'Notes']],
          body: ingredientsTableData,
          startY: yPos,
          margin: { left: 15, right: 15 },
          styles: { fontSize: normalFontSize, cellPadding: 1 },
          headStyles: { fillColor: [46, 125, 50] },
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 25 },
            2: { cellWidth: 25 },
            3: { cellWidth: 40 },
            4: { cellWidth: 'auto' }
          }
        });
        
        yPos = doc.lastAutoTable.finalY + 5;
      }
      
      // Inclusions Table (if any)
      yPos = checkNewPage(yPos, 30);
      if (data.billOfMaterials && data.billOfMaterials.inclusions && data.billOfMaterials.inclusions.length > 0) {
        yPos = addSubsectionHeader('Inclusions', yPos);
        
        const inclusionsTableData = data.billOfMaterials.inclusions.map(inclusion => [
          inclusion.name || '',
          inclusion.percentage ? `${inclusion.percentage}%` : '',
          inclusion.weight ? `${inclusion.weight} lbs` : '',
          inclusion.supplier || '',
          inclusion.notes || ''
        ]);
        
        doc.autoTable({
          head: [['Inclusion', 'Percentage', 'Weight', 'Supplier', 'Notes']],
          body: inclusionsTableData,
          startY: yPos,
          margin: { left: 15, right: 15 },
          styles: { fontSize: normalFontSize, cellPadding: 1 },
          headStyles: { fillColor: [46, 125, 50] }
        });
        
        yPos = doc.lastAutoTable.finalY + 5;
      }
      
      // Packaging Table (if any)
      yPos = checkNewPage(yPos, 30);
      if (data.billOfMaterials && data.billOfMaterials.packaging && data.billOfMaterials.packaging.length > 0) {
        yPos = addSubsectionHeader('Packaging', yPos);
        
        const packagingTableData = data.billOfMaterials.packaging.map(item => [
          item.name || '',
          item.quantity || '',
          item.supplier || '',
          item.notes || ''
        ]);
        
        doc.autoTable({
          head: [['Item', 'Quantity', 'Supplier', 'Notes']],
          body: packagingTableData,
          startY: yPos,
          margin: { left: 15, right: 15 },
          styles: { fontSize: normalFontSize, cellPadding: 1 },
          headStyles: { fillColor: [46, 125, 50] }
        });
        
        yPos = doc.lastAutoTable.finalY + 5;
      }
      
      // Case Table (if any)
      yPos = checkNewPage(yPos, 30);
      if (data.billOfMaterials && data.billOfMaterials.caseItems && data.billOfMaterials.caseItems.length > 0) {
        yPos = addSubsectionHeader('Case Items', yPos);
        
        const caseTableData = data.billOfMaterials.caseItems.map(item => [
          item.name || '',
          item.quantity || '',
          item.supplier || '',
          item.notes || ''
        ]);
        
        doc.autoTable({
          head: [['Item', 'Quantity', 'Supplier', 'Notes']],
          body: caseTableData,
          startY: yPos,
          margin: { left: 15, right: 15 },
          styles: { fontSize: normalFontSize, cellPadding: 1 },
          headStyles: { fillColor: [46, 125, 50] }
        });
        
        yPos = doc.lastAutoTable.finalY + 5;
      }
      
      // Production Details Section
      yPos = checkNewPage(yPos);
      yPos = addSectionHeader('Production Details', yPos);
      // Add production details in a compact format...
      
      // Packout Details Section
      yPos = checkNewPage(yPos);
      yPos = addSectionHeader('Packout Details', yPos);
      if (data.packoutDetails) {
        yPos = addLabeledText('Units Per Case', data.packoutDetails.unitsPerCase, yPos);
        yPos = addLabeledText('Cases Per Pallet', data.packoutDetails.casesPerPallet, yPos);
        yPos = addLabeledText('Units Per Pallet', data.packoutDetails.unitsPerPallet, yPos);
        yPos = addLabeledText('Case Weight', data.packoutDetails.caseWeight, yPos);
        yPos = addLabeledText('Pallet Weight', data.packoutDetails.palletWeight, yPos);
      }
      
      // Signatures Section
      yPos = checkNewPage(yPos);
      yPos = addSectionHeader('Signatures', yPos);
      if (data.signatures) {
        yPos = addLabeledText('Customer Approval', data.signatures.customerApproval ? 'Approved' : 'Pending', yPos);
        yPos = addLabeledText('Quality Manager', data.signatures.qualityManager ? 'Approved' : 'Pending', yPos);
        yPos = addLabeledText('Production Manager', data.signatures.productionManager ? 'Approved' : 'Pending', yPos);
      }
      
      // Save the PDF
      doc.save(`${data.productIdentification?.productName || 'spec-sheet'}.pdf`);
      
      return true;
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setError('Failed to export PDF: ' + error.message);
      return false;
    }
  }, [specSheetData]);
  
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
