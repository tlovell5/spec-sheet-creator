import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SpecSheetContext } from '../context/SpecSheetContext';
import CustomerInfo from '../components/CustomerInfo';
import ProductIdentification from '../components/ProductIdentification';
import PackagingClaims from '../components/PackagingClaims';
import BillOfMaterials from '../components/BillOfMaterials';
import ProductionDetails from '../components/ProductionDetails';
import PackoutDetails from '../components/PackoutDetails';
import MixInstructions from '../components/MixInstructions';
import ProductTesting from '../components/ProductTesting';
import EquipmentSpecifications from '../components/EquipmentSpecifications';
import Signatures from '../components/Signatures';
import ActivityLog from '../components/ActivityLog';
import { supabase } from '../supabaseClient';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const SpecSheet = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { specSheetData, setSpecSheetData, fetchSpecSheet, saveSpecSheet, exportAsPdf } = useContext(SpecSheetContext);
  const [activeSection, setActiveSection] = useState('customerInfo');
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  
  // Fetch spec sheet data if editing an existing one
  useEffect(() => {
    const initializeData = async () => {
      if (id && id !== 'new') {
        try {
          await fetchSpecSheet(id);
        } catch (error) {
          console.error("Error fetching spec sheet:", error);
          setSaveError("Failed to load spec sheet data");
        }
      } else {
        // For new spec sheets, only initialize once to prevent loops
        if (!specSheetData.id && Object.keys(specSheetData.customerInfo).length === 0) {
          const initialData = {
            id: null,
            documentType: 'Spec Sheet',
            status: 'Draft',
            revision: '1.0',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            customerInfo: { name: '' },
            productIdentification: { productName: '' },
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
              materials: []
            },
            packoutDetails: {},
            mixInstructions: {
              steps: []
            },
            productTesting: {
              organolepticSpecs: [],
              biologicalSpecs: []
            },
            equipmentSpecifications: {
              equipment: []
            },
            signatures: {},
            activityLog: []
          };
          setSpecSheetData(initialData);
        }
      }
    };
    
    initializeData();
  }, [id]); // Only depend on id to prevent loops
  
  // Handle save
  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      
      // Add a log entry for saving
      const updatedLogs = [...(specSheetData.activityLog?.logs || [])];
      updatedLogs.push({
        timestamp: new Date().toISOString(),
        user: 'System',
        action: 'Saved Spec Sheet',
        details: `Spec sheet ${id === 'new' ? 'created' : 'updated'}`
      });
      
      const updatedSpecSheet = {
        ...specSheetData,
        updatedAt: new Date().toISOString(),
        activityLog: {
          ...specSheetData.activityLog,
          logs: updatedLogs
        }
      };
      
      // Save to database
      const result = await saveSpecSheet(updatedSpecSheet);
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      setSaveSuccess(true);
      
      // If this is a new spec sheet, redirect to edit page with the new ID
      if (id === 'new' && result.data?.id) {
        navigate(`/edit/${result.data.id}`);
      }
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving spec sheet:', error);
      setSaveError(error.message);
    } finally {
      setSaving(false);
    }
  };
  
  // Handle export to PDF
  const handleExport = async () => {
    try {
      setExporting(true);
      
      // Export to PDF
      await exportAsPdf(specSheetData);
      
      // Add a log entry for exporting
      const updatedLogs = [...(specSheetData.activityLog?.logs || [])];
      updatedLogs.push({
        timestamp: new Date().toISOString(),
        user: 'System',
        action: 'Exported to PDF',
        details: 'Spec sheet exported to PDF'
      });
      
      setSpecSheetData(prevData => ({
        ...prevData,
        activityLog: {
          ...prevData.activityLog,
          logs: updatedLogs
        }
      }));
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    } finally {
      setExporting(false);
    }
  };
  
  // Handle section navigation
  const handleSectionClick = (section) => {
    setActiveSection(section);
    
    // Scroll to section
    const sectionElement = document.getElementById(section);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Sections configuration
  const sections = [
    { id: 'customerInfo', label: 'Customer Info' },
    { id: 'productIdentification', label: 'Product Identification' },
    { id: 'packagingClaims', label: 'Packaging Claims' },
    { id: 'billOfMaterials', label: 'Bill of Materials' },
    { id: 'productionDetails', label: 'Production Details' },
    { id: 'packoutDetails', label: 'Packout Details' },
    { id: 'mixInstructions', label: 'Mix Instructions' },
    { id: 'productTesting', label: 'Product Testing' },
    { id: 'equipmentSpecifications', label: 'Equipment Specifications' },
    { id: 'signatures', label: 'Signatures' },
    { id: 'activityLog', label: 'Activity Log' }
  ];

  return (
    <div className="spec-sheet-container">
      <div className="spec-sheet-header">
        <h1>{id === 'new' ? 'Create New Spec Sheet' : 'Edit Spec Sheet'}</h1>
        <div className="spec-sheet-actions">
          <button
            type="button"
            className="btn btn-primary mr-2"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? 'Exporting...' : 'Export to PDF'}
          </button>
        </div>
      </div>
      
      {saveSuccess && (
        <div className="alert alert-success" role="alert">
          Spec sheet saved successfully!
        </div>
      )}
      
      {saveError && (
        <div className="alert alert-danger" role="alert">
          Error saving spec sheet: {saveError}
        </div>
      )}
      
      <div className="spec-sheet-content">
        <div className="spec-sheet-sidebar">
          <div className="spec-sheet-nav">
            {sections.map((section) => (
              <div
                key={section.id}
                className={`spec-sheet-nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => handleSectionClick(section.id)}
              >
                {section.label}
              </div>
            ))}
          </div>
        </div>
        
        <div className="spec-sheet-main">
          <div id="customerInfo" className="spec-sheet-section-container">
            <CustomerInfo />
          </div>
          
          <div id="productIdentification" className="spec-sheet-section-container">
            <ProductIdentification />
          </div>
          
          <div id="packagingClaims" className="spec-sheet-section-container">
            <PackagingClaims />
          </div>
          
          <div id="billOfMaterials" className="spec-sheet-section-container">
            <BillOfMaterials />
          </div>
          
          <div id="productionDetails" className="spec-sheet-section-container">
            <ProductionDetails />
          </div>
          
          <div id="packoutDetails" className="spec-sheet-section-container">
            <PackoutDetails />
          </div>
          
          <div id="mixInstructions" className="spec-sheet-section-container">
            <MixInstructions />
          </div>
          
          <div id="productTesting" className="spec-sheet-section-container">
            <ProductTesting />
          </div>
          
          <div id="equipmentSpecifications" className="spec-sheet-section-container">
            <EquipmentSpecifications />
          </div>
          
          <div id="signatures" className="spec-sheet-section-container">
            <Signatures />
          </div>
          
          <div id="activityLog" className="spec-sheet-section-container">
            <ActivityLog />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecSheet;
