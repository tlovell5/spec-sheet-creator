import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './SpecSheet.css';
import CustomerInfo from './SpecSheetComponents/CustomerInfo';
import ProductIdentification from './SpecSheetComponents/ProductIdentification';
import PackagingClaims from './SpecSheetComponents/PackagingClaims';
import BillOfMaterials from './SpecSheetComponents/BillOfMaterials';
import ProductionDetails from './SpecSheetComponents/ProductionDetails';
import PackoutDetails from './SpecSheetComponents/PackoutDetails';
import MixInstructions from './SpecSheetComponents/MixInstructions';
import ProductTesting from './SpecSheetComponents/ProductTesting';
import EquipmentSpecs from './SpecSheetComponents/EquipmentSpecs';
import Signatures from './SpecSheetComponents/Signatures';
import ActivityLog from './SpecSheetComponents/ActivityLog';
import { jsPDF } from 'jspdf';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, 
  faFilePdf, 
  faClipboardCheck, 
  faArrowLeft, 
  faBuilding, 
  faBarcode, 
  faTag, 
  faClipboardList, 
  faCogs, 
  faBoxes, 
  faBlender, 
  faFlask, 
  faTools, 
  faSignature, 
  faHistory,
  faInfoCircle,
  faList,
  faExpandAlt,
  faCompressAlt,
  faCheckCircle,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';

function EditSpecSheet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Initialize with empty structure that matches our component expectations
  const [specSheetData, setSpecSheetData] = useState({
    id: null,
    status: 'Draft',
    customerInfo: {
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      logo: ''
    },
    productIdentification: {
      productName: '',
      productCode: '',
      productDescription: '',
      netWeight: '',
      upc: '',
      productImage: ''
    },
    packagingClaims: {
      allergens: [],
      claims: []
    },
    billOfMaterials: {
      ingredients: [],
      packaging: []
    },
    productionDetails: {
      processDescription: '',
      artworkFiles: []
    },
    packoutDetails: {
      unitsPerCase: '',
      casesPerPallet: '',
      palletConfiguration: ''
    },
    mixInstructions: {
      steps: []
    },
    productTesting: {
      tests: []
    },
    equipmentSpecs: {
      equipment: []
    },
    signatures: {
      qualityAssurance: {},
      productDevelopment: {},
      operations: {},
      customerApproval: {}
    },
    activityLog: {
      entries: []
    }
  });
  
  const [expandedSections, setExpandedSections] = useState({
    customerInfo: true,
    productIdentification: true,
    packagingClaims: false,
    billOfMaterials: false,
    productionDetails: false,
    packoutDetails: false,
    mixInstructions: false,
    productTesting: false,
    equipmentSpecs: false,
    signatures: false,
    activityLog: false
  });

  useEffect(() => {
    const fetchSpecSheet = async () => {
      setLoading(true);
      
      try {
        // Handle the case when we're creating a new spec sheet
        // This happens either with /create route or with /edit/new
        if (!id || id === 'new' || id === 'undefined') {
          // Create a new spec sheet in the database
          const { data, error } = await supabase
            .from('spec_sheets')
            .insert([{ status: 'Draft' }])
            .select();

          if (error) {
            console.error('Error creating new spec sheet:', error);
            return;
          }

          // Redirect to the edit page with the new ID
          navigate(`/edit/${data[0].id}`, { replace: true });
          return;
        }

        // Fetch existing spec sheet
        const { data, error } = await supabase
          .from('spec_sheets')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching spec sheet:', error);
          return;
        }

        // Map the database data to our component structure
        setSpecSheetData({
          id: data.id,
          status: data.status || 'Draft',
          customerInfo: {
            companyName: data.customer_name || '',
            contactName: data.customer_contact || '',
            email: data.customer_email || '',
            phone: data.customer_phone || '',
            address: data.customer_address || '',
            logo: data.customer_logo || ''
          },
          productIdentification: {
            productName: data.product_name || '',
            productCode: data.sku_id || '',
            productDescription: data.product_description || '',
            netWeight: data.unit_claim_weight || '',
            upc: data.unit_upc || '',
            productImage: data.product_image || ''
          },
          // Initialize other sections with data from database
          // or with empty structures if not available
          packagingClaims: data.packaging_claims || {
            allergens: [],
            claims: []
          },
          billOfMaterials: data.bill_of_materials || {
            ingredients: [],
            packaging: []
          },
          productionDetails: data.production_details || {
            processDescription: '',
            artworkFiles: []
          },
          packoutDetails: {
            unitsPerCase: data.units_per_case || '',
            casesPerPallet: data.cases_per_pallet || '',
            palletConfiguration: data.pallet_configuration || ''
          },
          mixInstructions: data.mix_instructions || {
            steps: []
          },
          productTesting: data.product_testing || {
            tests: []
          },
          equipmentSpecs: data.equipment_specs || {
            equipment: []
          },
          signatures: data.signatures || {
            qualityAssurance: {},
            productDevelopment: {},
            operations: {},
            customerApproval: {}
          },
          activityLog: {
            entries: []
          }
        });
      } catch (error) {
        console.error('Error in fetchSpecSheet:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecSheet();
  }, [id, navigate]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Map our component structure back to database structure
      const dbData = {
        id: specSheetData.id,
        status: specSheetData.status,
        customer_name: specSheetData.customerInfo.companyName,
        customer_contact: specSheetData.customerInfo.contactName,
        customer_email: specSheetData.customerInfo.email,
        customer_phone: specSheetData.customerInfo.phone,
        customer_address: specSheetData.customerInfo.address,
        customer_logo: specSheetData.customerInfo.logo,
        product_name: specSheetData.productIdentification.productName,
        sku_id: specSheetData.productIdentification.productCode,
        product_description: specSheetData.productIdentification.productDescription,
        unit_claim_weight: specSheetData.productIdentification.netWeight,
        unit_upc: specSheetData.productIdentification.upc,
        product_image: specSheetData.productIdentification.productImage,
        // Add other fields as needed
        units_per_case: specSheetData.packoutDetails.unitsPerCase,
        cases_per_pallet: specSheetData.packoutDetails.casesPerPallet,
        // Store complex objects as JSON
        packaging_claims: specSheetData.packagingClaims,
        bill_of_materials: specSheetData.billOfMaterials,
        production_details: specSheetData.productionDetails,
        mix_instructions: specSheetData.mixInstructions,
        product_testing: specSheetData.productTesting,
        equipment_specs: specSheetData.equipmentSpecs,
        signatures: specSheetData.signatures
      };
      
      const { error } = await supabase
        .from('spec_sheets')
        .update(dbData)
        .eq('id', specSheetData.id);

      if (error) {
        console.error('Error saving spec sheet:', error);
        alert('Failed to save spec sheet. Please try again.');
      } else {
        // Log activity
        await supabase
          .from('activity_logs')
          .insert([{
            spec_sheet_id: specSheetData.id,
            user_id: 'current_user', // Replace with actual user ID
            action: 'UPDATED',
            notes: 'Spec sheet updated'
          }]);

        alert('Spec sheet saved successfully!');
      }
    } catch (error) {
      console.error('Error in handleSave:', error);
      alert('An error occurred while saving. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Add company logo if available
    if (specSheetData.customerInfo.logo) {
      doc.addImage(specSheetData.customerInfo.logo, 'JPEG', 10, 10, 40, 20);
    }
    
    // Add header
    doc.setFontSize(22);
    doc.setTextColor(46, 125, 50); // Green color
    doc.text(`Spec Sheet: ${specSheetData.productIdentification.productName || 'New Spec Sheet'}`, 10, 40);
    
    // Add metadata
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Black color
    doc.text(`Customer: ${specSheetData.customerInfo.companyName || 'N/A'}`, 10, 50);
    doc.text(`Product Code: ${specSheetData.productIdentification.productCode || 'N/A'}`, 10, 60);
    doc.text(`Status: ${specSheetData.status || 'Draft'}`, 10, 70);
    doc.text(`Creation Date: ${new Date().toLocaleDateString()}`, 10, 80);
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100); // Gray color
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 30, doc.internal.pageSize.getHeight() - 10);
      doc.text(`${specSheetData.productIdentification.productName || 'Spec Sheet'} - Rev ${specSheetData.productIdentification.productCode || 'Draft'}`, 10, doc.internal.pageSize.getHeight() - 10);
    }
    
    doc.save(`spec_sheet_${specSheetData.productIdentification.productName || id}.pdf`);
  };

  const handleRequestReview = async () => {
    try {
      const { error } = await supabase
        .from('spec_sheets')
        .update({ status: 'In Review' })
        .eq('id', id);

      if (error) {
        console.error('Error updating status:', error);
        alert('Failed to request review. Please try again.');
      } else {
        // Log activity
        await supabase
          .from('activity_logs')
          .insert([{
            spec_sheet_id: id,
            user_id: 'current_user', // Replace with actual user ID
            action: 'REQUESTED_REVIEW',
            notes: 'Spec sheet submitted for review'
          }]);

        setSpecSheetData(prev => ({
          ...prev,
          status: 'In Review'
        }));
        
        alert('Spec sheet submitted for review!');
      }
    } catch (error) {
      console.error('Error in handleRequestReview:', error);
      alert('An error occurred. Please try again.');
    }
  };

  // Function to get appropriate icon for each section
  const getSectionIcon = (section) => {
    switch(section) {
      case 'customerInfo': return faBuilding;
      case 'productIdentification': return faBarcode;
      case 'packagingClaims': return faTag;
      case 'billOfMaterials': return faClipboardList;
      case 'productionDetails': return faCogs;
      case 'packoutDetails': return faBoxes;
      case 'mixInstructions': return faBlender;
      case 'productTesting': return faFlask;
      case 'equipmentSpecs': return faTools;
      case 'signatures': return faSignature;
      case 'activityLog': return faHistory;
      default: return faClipboardList;
    }
  };

  // Function to expand all sections
  const expandAllSections = () => {
    const allSections = {
      customerInfo: true,
      productIdentification: true,
      packagingClaims: true,
      billOfMaterials: true,
      productionDetails: true,
      packoutDetails: true,
      mixInstructions: true,
      productTesting: true,
      equipmentSpecs: true,
      signatures: true,
      activityLog: true
    };
    setExpandedSections(allSections);
  };

  // Function to collapse all sections
  const collapseAllSections = () => {
    const allSections = {
      customerInfo: false,
      productIdentification: false,
      packagingClaims: false,
      billOfMaterials: false,
      productionDetails: false,
      packoutDetails: false,
      mixInstructions: false,
      productTesting: false,
      equipmentSpecs: false,
      signatures: false,
      activityLog: false
    };
    setExpandedSections(allSections);
  };

  // Function to scroll to a specific section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      
      // Expand the section if it's collapsed
      if (!expandedSections[sectionId]) {
        setExpandedSections(prev => ({
          ...prev,
          [sectionId]: true
        }));
      }
    }
  };

  // Calculate completion percentage for progress bar
  const calculateCompletion = () => {
    let completedFields = 0;
    let totalFields = 0;
    
    // Count fields in customerInfo
    if (specSheetData.customerInfo) {
      totalFields += 3; // company, contact, email
      if (specSheetData.customerInfo.companyName) completedFields++;
      if (specSheetData.customerInfo.contactName) completedFields++;
      if (specSheetData.customerInfo.email) completedFields++;
    }
    
    // Count fields in productIdentification
    if (specSheetData.productIdentification) {
      totalFields += 3; // name, code, description
      if (specSheetData.productIdentification.productName) completedFields++;
      if (specSheetData.productIdentification.productCode) completedFields++;
      if (specSheetData.productIdentification.description) completedFields++;
    }
    
    // Add more sections as needed
    
    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  };

  // Check if a section is complete
  const isSectionComplete = (section) => {
    switch(section) {
      case 'customerInfo':
        return specSheetData.customerInfo && 
               specSheetData.customerInfo.companyName && 
               specSheetData.customerInfo.contactName && 
               specSheetData.customerInfo.email;
      case 'productIdentification':
        return specSheetData.productIdentification && 
               specSheetData.productIdentification.productName && 
               specSheetData.productIdentification.productCode;
      // Add more cases for other sections
      default:
        return false;
    }
  };

  // Get completion status icon
  const getCompletionIcon = (section) => {
    const isComplete = isSectionComplete(section);
    return isComplete ? 
      <span className="completion-indicator complete" title="Section Complete">
        <FontAwesomeIcon icon={faCheckCircle} />
      </span> : 
      <span className="completion-indicator incomplete" title="Section Incomplete">
        <FontAwesomeIcon icon={faExclamationCircle} />
      </span>;
  };

  if (loading) {
    return <div className="loading">Loading spec sheet data...</div>;
  }

  return (
    <div className="spec-sheet-container">
      <div className="spec-sheet-header">
        <h1 className="spec-sheet-title">
          {specSheetData.productIdentification.productName 
            ? `Edit: ${specSheetData.productIdentification.productName}` 
            : 'New Spec Sheet'}
        </h1>
        <div className="spec-sheet-actions">
          <button 
            className="spec-sheet-button primary" 
            onClick={handleSave}
            disabled={saving}
          >
            <FontAwesomeIcon icon={faSave} />
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button 
            className="spec-sheet-button secondary"
            onClick={handleExportPDF}
          >
            <FontAwesomeIcon icon={faFilePdf} />
            Export PDF
          </button>
          <button 
            className="spec-sheet-button secondary"
            onClick={handleRequestReview}
            disabled={specSheetData.status === 'In Review' || specSheetData.status === 'Approved'}
          >
            <FontAwesomeIcon icon={faClipboardCheck} />
            Request Review
          </button>
          <button 
            className="spec-sheet-button secondary"
            onClick={() => navigate('/')}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Dashboard
          </button>
          <button 
            className="spec-sheet-button secondary"
            onClick={expandAllSections}
          >
            <FontAwesomeIcon icon={faExpandAlt} />
            Expand All
          </button>
          <button 
            className="spec-sheet-button secondary"
            onClick={collapseAllSections}
          >
            <FontAwesomeIcon icon={faCompressAlt} />
            Collapse All
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="status-container">
        Status: <span className={`status-badge status-${specSheetData.status?.toLowerCase().replace(' ', '-') || 'draft'}`}>
          {specSheetData.status || 'Draft'}
        </span>
      </div>

      {/* Section Navigation */}
      <div className="section-nav">
        <div className="section-nav-title">
          <FontAwesomeIcon icon={faList} /> Quick Navigation
        </div>
        <div className="section-nav-links">
          <button 
            className={`section-nav-link ${expandedSections.customerInfo ? 'active' : ''}`}
            onClick={() => scrollToSection('customerInfo')}
          >
            Customer Info
          </button>
          <button 
            className={`section-nav-link ${expandedSections.productIdentification ? 'active' : ''}`}
            onClick={() => scrollToSection('productIdentification')}
          >
            Product ID
          </button>
          <button 
            className={`section-nav-link ${expandedSections.packagingClaims ? 'active' : ''}`}
            onClick={() => scrollToSection('packagingClaims')}
          >
            Packaging
          </button>
          <button 
            className={`section-nav-link ${expandedSections.billOfMaterials ? 'active' : ''}`}
            onClick={() => scrollToSection('billOfMaterials')}
          >
            BOM
          </button>
          <button 
            className={`section-nav-link ${expandedSections.productionDetails ? 'active' : ''}`}
            onClick={() => scrollToSection('productionDetails')}
          >
            Production
          </button>
          <button 
            className={`section-nav-link ${expandedSections.mixInstructions ? 'active' : ''}`}
            onClick={() => scrollToSection('mixInstructions')}
          >
            Mix Instructions
          </button>
          <button 
            className={`section-nav-link ${expandedSections.signatures ? 'active' : ''}`}
            onClick={() => scrollToSection('signatures')}
          >
            Signatures
          </button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="progress-container">
        <div className="progress-title">
          <FontAwesomeIcon icon={faCheckCircle} /> Spec Sheet Completion
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${calculateCompletion()}%` }}></div>
        </div>
        <div className="progress-text">
          <span>{calculateCompletion()}% Complete</span>
          <span>{specSheetData.status || 'Draft'}</span>
        </div>
      </div>

      {/* Customer Info Container */}
      <div className="container-section" id="customerInfo">
        <div 
          className="container-header" 
          onClick={() => toggleSection('customerInfo')}
        >
          <h3>
            <FontAwesomeIcon icon={getSectionIcon('customerInfo')} className="section-icon" />
            Customer Info
            <div className="tooltip-container">
              <FontAwesomeIcon icon={faInfoCircle} className="tooltip-icon" />
              <span className="tooltip-text">
                Enter customer details including company name, contact information, and logo.
              </span>
            </div>
          </h3>
          <div className="header-right">
            <span className={`completion-indicator ${isSectionComplete('customerInfo') ? 'complete' : 'incomplete'}`}>
              {isSectionComplete('customerInfo') ? (
                <FontAwesomeIcon icon={faCheckCircle} />
              ) : (
                <FontAwesomeIcon icon={faExclamationCircle} />
              )}
              {isSectionComplete('customerInfo') ? 'Complete' : 'Incomplete'}
            </span>
            <span>{expandedSections.customerInfo ? '▼' : '►'}</span>
          </div>
        </div>
        {expandedSections.customerInfo && (
          <div className="container-content">
            <div className="section-description">
              Enter all customer information. The company logo will appear on the generated spec sheet.
            </div>
            <CustomerInfo 
              specSheetData={specSheetData} 
              setSpecSheetData={setSpecSheetData} 
            />
          </div>
        )}
      </div>

      {/* Product Identification Container */}
      <div className="container-section" id="productIdentification">
        <div 
          className="container-header" 
          onClick={() => toggleSection('productIdentification')}
        >
          <h3>
            <FontAwesomeIcon icon={getSectionIcon('productIdentification')} className="section-icon" />
            Product Identification
            <div className="tooltip-container">
              <FontAwesomeIcon icon={faInfoCircle} className="tooltip-icon" />
              <span className="tooltip-text">
                Define the product name, code, and description. This information will appear in the header of the spec sheet.
              </span>
            </div>
          </h3>
          <div className="header-right">
            <span className={`completion-indicator ${isSectionComplete('productIdentification') ? 'complete' : 'incomplete'}`}>
              {isSectionComplete('productIdentification') ? (
                <FontAwesomeIcon icon={faCheckCircle} />
              ) : (
                <FontAwesomeIcon icon={faExclamationCircle} />
              )}
              {isSectionComplete('productIdentification') ? 'Complete' : 'Incomplete'}
            </span>
            <span>{expandedSections.productIdentification ? '▼' : '►'}</span>
          </div>
        </div>
        {expandedSections.productIdentification && (
          <div className="container-content">
            <div className="section-description">
              Enter the product details that uniquely identify this product. The product name and code are required fields.
            </div>
            <ProductIdentification 
              specSheetData={specSheetData} 
              setSpecSheetData={setSpecSheetData} 
            />
          </div>
        )}
      </div>

      {/* Packaging Claims Container */}
      <div className="container-section" id="packagingClaims">
        <div 
          className="container-header" 
          onClick={() => toggleSection('packagingClaims')}
        >
          <h3>
            <FontAwesomeIcon icon={getSectionIcon('packagingClaims')} className="section-icon" />
            Packaging Claims
            <div className="tooltip-container">
              <FontAwesomeIcon icon={faInfoCircle} className="tooltip-icon" />
              <span className="tooltip-text">
                Specify any claims that will appear on the product packaging, such as organic, non-GMO, etc.
              </span>
            </div>
          </h3>
          <div className="header-right">
            <span className={`completion-indicator ${isSectionComplete('packagingClaims') ? 'complete' : 'incomplete'}`}>
              {isSectionComplete('packagingClaims') ? (
                <FontAwesomeIcon icon={faCheckCircle} />
              ) : (
                <FontAwesomeIcon icon={faExclamationCircle} />
              )}
              {isSectionComplete('packagingClaims') ? 'Complete' : 'Incomplete'}
            </span>
            <span>{expandedSections.packagingClaims ? '▼' : '►'}</span>
          </div>
        </div>
        {expandedSections.packagingClaims && (
          <div className="container-content">
            <div className="section-description">
              List all claims that will appear on the product packaging. These claims must be verified and approved.
            </div>
            <PackagingClaims 
              specSheetData={specSheetData} 
              setSpecSheetData={setSpecSheetData} 
            />
          </div>
        )}
      </div>

      {/* Bill of Materials Container */}
      <div className="container-section" id="billOfMaterials">
        <div 
          className="container-header" 
          onClick={() => toggleSection('billOfMaterials')}
        >
          <h3>
            <FontAwesomeIcon icon={getSectionIcon('billOfMaterials')} className="section-icon" />
            Bill of Materials
            <div className="tooltip-container">
              <FontAwesomeIcon icon={faInfoCircle} className="tooltip-icon" />
              <span className="tooltip-text">
                List all raw materials, ingredients, and components required for this product.
              </span>
            </div>
          </h3>
          <div className="header-right">
            <span className={`completion-indicator ${isSectionComplete('billOfMaterials') ? 'complete' : 'incomplete'}`}>
              {isSectionComplete('billOfMaterials') ? (
                <FontAwesomeIcon icon={faCheckCircle} />
              ) : (
                <FontAwesomeIcon icon={faExclamationCircle} />
              )}
              {isSectionComplete('billOfMaterials') ? 'Complete' : 'Incomplete'}
            </span>
            <span>{expandedSections.billOfMaterials ? '▼' : '►'}</span>
          </div>
        </div>
        {expandedSections.billOfMaterials && (
          <div className="container-content">
            <div className="section-description">
              Enter all materials required for production. Include item codes, quantities, and any special handling instructions.
            </div>
            <BillOfMaterials 
              specSheetData={specSheetData} 
              setSpecSheetData={setSpecSheetData} 
            />
          </div>
        )}
      </div>

      {/* Production Details Container */}
      <div className="container-section" id="productionDetails">
        <div 
          className="container-header" 
          onClick={() => toggleSection('productionDetails')}
        >
          <h3>
            <FontAwesomeIcon icon={getSectionIcon('productionDetails')} className="section-icon" />
            Production Details
            <div className="tooltip-container">
              <FontAwesomeIcon icon={faInfoCircle} className="tooltip-icon" />
              <span className="tooltip-text">
                Specify production process details, including batch sizes, production time, and special instructions.
              </span>
            </div>
          </h3>
          <div className="header-right">
            <span className={`completion-indicator ${isSectionComplete('productionDetails') ? 'complete' : 'incomplete'}`}>
              {isSectionComplete('productionDetails') ? (
                <FontAwesomeIcon icon={faCheckCircle} />
              ) : (
                <FontAwesomeIcon icon={faExclamationCircle} />
              )}
              {isSectionComplete('productionDetails') ? 'Complete' : 'Incomplete'}
            </span>
            <span>{expandedSections.productionDetails ? '▼' : '►'}</span>
          </div>
        </div>
        {expandedSections.productionDetails && (
          <div className="container-content">
            <div className="section-description">
              Document the production process details. Include standard batch sizes, estimated production times, and any special considerations.
            </div>
            <ProductionDetails 
              specSheetData={specSheetData} 
              setSpecSheetData={setSpecSheetData} 
            />
          </div>
        )}
      </div>

      {/* Packout Details Container */}
      <div className="container-section" id="packoutDetails">
        <div 
          className="container-header" 
          onClick={() => toggleSection('packoutDetails')}
        >
          <h3>
            <FontAwesomeIcon icon={getSectionIcon('packoutDetails')} className="section-icon" />
            Packout Details
            <div className="tooltip-container">
              <FontAwesomeIcon icon={faInfoCircle} className="tooltip-icon" />
              <span className="tooltip-text">
                Define packaging specifications, including container types, labeling requirements, and case configurations.
              </span>
            </div>
          </h3>
          <div className="header-right">
            <span className={`completion-indicator ${isSectionComplete('packoutDetails') ? 'complete' : 'incomplete'}`}>
              {isSectionComplete('packoutDetails') ? (
                <FontAwesomeIcon icon={faCheckCircle} />
              ) : (
                <FontAwesomeIcon icon={faExclamationCircle} />
              )}
              {isSectionComplete('packoutDetails') ? 'Complete' : 'Incomplete'}
            </span>
            <span>{expandedSections.packoutDetails ? '▼' : '►'}</span>
          </div>
        </div>
        {expandedSections.packoutDetails && (
          <div className="container-content">
            <div className="section-description">
              Specify how the product should be packaged. Include container types, case counts, and any special packaging instructions.
            </div>
            <PackoutDetails 
              specSheetData={specSheetData} 
              setSpecSheetData={setSpecSheetData} 
            />
          </div>
        )}
      </div>

      {/* Mix Instructions Container */}
      <div className="container-section" id="mixInstructions">
        <div 
          className="container-header" 
          onClick={() => toggleSection('mixInstructions')}
        >
          <h3>
            <FontAwesomeIcon icon={getSectionIcon('mixInstructions')} className="section-icon" />
            Mix Instructions
            <div className="tooltip-container">
              <FontAwesomeIcon icon={faInfoCircle} className="tooltip-icon" />
              <span className="tooltip-text">
                Provide step-by-step mixing instructions, including order of ingredients, timing, and mixing parameters.
              </span>
            </div>
          </h3>
          <div className="header-right">
            <span className={`completion-indicator ${isSectionComplete('mixInstructions') ? 'complete' : 'incomplete'}`}>
              {isSectionComplete('mixInstructions') ? (
                <FontAwesomeIcon icon={faCheckCircle} />
              ) : (
                <FontAwesomeIcon icon={faExclamationCircle} />
              )}
              {isSectionComplete('mixInstructions') ? 'Complete' : 'Incomplete'}
            </span>
            <span>{expandedSections.mixInstructions ? '▼' : '►'}</span>
          </div>
        </div>
        {expandedSections.mixInstructions && (
          <div className="container-content">
            <div className="section-description">
              Detail the mixing process with clear step-by-step instructions. Include mixing times, speeds, and any critical parameters.
            </div>
            <MixInstructions 
              specSheetData={specSheetData} 
              setSpecSheetData={setSpecSheetData} 
            />
          </div>
        )}
      </div>

      {/* Product Testing Container */}
      <div className="container-section" id="productTesting">
        <div 
          className="container-header" 
          onClick={() => toggleSection('productTesting')}
        >
          <h3>
            <FontAwesomeIcon icon={getSectionIcon('productTesting')} className="section-icon" />
            Product Testing
            <div className="tooltip-container">
              <FontAwesomeIcon icon={faInfoCircle} className="tooltip-icon" />
              <span className="tooltip-text">
                Specify quality control tests, acceptance criteria, and testing frequency for the product.
              </span>
            </div>
          </h3>
          <div className="header-right">
            <span className={`completion-indicator ${isSectionComplete('productTesting') ? 'complete' : 'incomplete'}`}>
              {isSectionComplete('productTesting') ? (
                <FontAwesomeIcon icon={faCheckCircle} />
              ) : (
                <FontAwesomeIcon icon={faExclamationCircle} />
              )}
              {isSectionComplete('productTesting') ? 'Complete' : 'Incomplete'}
            </span>
            <span>{expandedSections.productTesting ? '▼' : '►'}</span>
          </div>
        </div>
        {expandedSections.productTesting && (
          <div className="container-content">
            <div className="section-description">
              Document all required quality tests and their acceptance criteria. These tests ensure the product meets all specifications.
            </div>
            <ProductTesting 
              specSheetData={specSheetData} 
              setSpecSheetData={setSpecSheetData} 
            />
          </div>
        )}
      </div>

      {/* Equipment Specs Container */}
      <div className="container-section" id="equipmentSpecs">
        <div 
          className="container-header" 
          onClick={() => toggleSection('equipmentSpecs')}
        >
          <h3>
            <FontAwesomeIcon icon={getSectionIcon('equipmentSpecs')} className="section-icon" />
            Equipment Specs
            <div className="tooltip-container">
              <FontAwesomeIcon icon={faInfoCircle} className="tooltip-icon" />
              <span className="tooltip-text">
                Document equipment requirements, settings, and calibration details needed for production.
              </span>
            </div>
          </h3>
          <div className="header-right">
            <span className={`completion-indicator ${isSectionComplete('equipmentSpecs') ? 'complete' : 'incomplete'}`}>
              {isSectionComplete('equipmentSpecs') ? (
                <FontAwesomeIcon icon={faCheckCircle} />
              ) : (
                <FontAwesomeIcon icon={faExclamationCircle} />
              )}
              {isSectionComplete('equipmentSpecs') ? 'Complete' : 'Incomplete'}
            </span>
            <span>{expandedSections.equipmentSpecs ? '▼' : '►'}</span>
          </div>
        </div>
        {expandedSections.equipmentSpecs && (
          <div className="container-content">
            <div className="section-description">
              Specify all equipment needed for production, including model numbers, settings, and any special setup instructions.
            </div>
            <EquipmentSpecs 
              specSheetData={specSheetData} 
              setSpecSheetData={setSpecSheetData} 
            />
          </div>
        )}
      </div>

      {/* Signatures Container */}
      <div className="container-section" id="signatures">
        <div 
          className="container-header" 
          onClick={() => toggleSection('signatures')}
        >
          <h3>
            <FontAwesomeIcon icon={getSectionIcon('signatures')} className="section-icon" />
            Signatures
            <div className="tooltip-container">
              <FontAwesomeIcon icon={faInfoCircle} className="tooltip-icon" />
              <span className="tooltip-text">
                Collect approval signatures from relevant stakeholders to finalize the spec sheet.
              </span>
            </div>
          </h3>
          <div className="header-right">
            <span className={`completion-indicator ${isSectionComplete('signatures') ? 'complete' : 'incomplete'}`}>
              {isSectionComplete('signatures') ? (
                <FontAwesomeIcon icon={faCheckCircle} />
              ) : (
                <FontAwesomeIcon icon={faExclamationCircle} />
              )}
              {isSectionComplete('signatures') ? 'Complete' : 'Incomplete'}
            </span>
            <span>{expandedSections.signatures ? '▼' : '►'}</span>
          </div>
        </div>
        {expandedSections.signatures && (
          <div className="container-content">
            <div className="section-description">
              Collect signatures from all required approvers. The spec sheet is not considered final until all signatures are obtained.
            </div>
            <Signatures 
              specSheetData={specSheetData} 
              setSpecSheetData={setSpecSheetData} 
            />
          </div>
        )}
      </div>

      {/* Activity Log Container */}
      <div className="container-section" id="activityLog">
        <div 
          className="container-header" 
          onClick={() => toggleSection('activityLog')}
        >
          <h3>
            <FontAwesomeIcon icon={getSectionIcon('activityLog')} className="section-icon" />
            Activity Log
            <div className="tooltip-container">
              <FontAwesomeIcon icon={faInfoCircle} className="tooltip-icon" />
              <span className="tooltip-text">
                View a chronological history of all changes made to this spec sheet, including who made them and when.
              </span>
            </div>
          </h3>
          <div className="header-right">
            <span className={`completion-indicator ${isSectionComplete('activityLog') ? 'complete' : 'incomplete'}`}>
              {isSectionComplete('activityLog') ? (
                <FontAwesomeIcon icon={faCheckCircle} />
              ) : (
                <FontAwesomeIcon icon={faExclamationCircle} />
              )}
              {isSectionComplete('activityLog') ? 'Complete' : 'Incomplete'}
            </span>
            <span>{expandedSections.activityLog ? '▼' : '►'}</span>
          </div>
        </div>
        {expandedSections.activityLog && (
          <div className="container-content">
            <div className="section-description">
              This log automatically tracks all changes to the spec sheet. Use it to monitor the approval process and track revisions.
            </div>
            <ActivityLog 
              specSheetId={id} 
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default EditSpecSheet;