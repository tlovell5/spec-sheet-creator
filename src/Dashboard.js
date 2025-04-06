import React, { useEffect, useState, useRef } from 'react';
import { supabase } from './supabaseClient';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  ChevronUpIcon, 
  ChevronDownIcon,
  PencilIcon,
  DocumentArrowDownIcon,
  DocumentDuplicateIcon,
  PencilSquareIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

function Dashboard() {
  const [specSheets, setSpecSheets] = useState([]);
  const [filteredSheets, setFilteredSheets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchSpecSheets = async () => {
      const { data, error } = await supabase.from('spec_sheets').select('*');
      if (error) console.error('Error fetching spec sheets:', error);
      else {
        setSpecSheets(data);
        setFilteredSheets(data);
      }
    };
    fetchSpecSheets();

    const subscription = supabase
      .channel('public:spec_sheets')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'spec_sheets' }, payload => {
        setSpecSheets(prevSheets => {
          const updatedSheets = [...prevSheets, payload.new];
          applyFiltersAndSort(updatedSheets);
          return updatedSheets;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  useEffect(() => {
    applyFiltersAndSort(specSheets);
  }, [searchTerm, sortConfig, statusFilter, specSheets]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const applyFiltersAndSort = (sheets) => {
    let result = [...sheets];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(sheet => sheet.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(sheet => 
        sheet.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sheet.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sheet.spec_revision?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredSheets(result);
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortDirectionIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' 
      ? <ChevronUpIcon className="sort-icon" /> 
      : <ChevronDownIcon className="sort-icon" />;
  };

  const downloadPDF = (sheet) => {
    const doc = new jsPDF();
    doc.text(`Spec Sheet for ${sheet.product_name}`, 10, 10);
    doc.text(`Customer: ${sheet.customer_name}`, 10, 20);
    doc.text(`Revision: ${sheet.spec_revision}`, 10, 30);
    doc.text(`Status: ${sheet.status}`, 10, 40);
    // Add more details as needed
    doc.save(`spec_sheet_${sheet.id}.pdf`);
  };

  const duplicateSpecSheet = async (sheet) => {
    // Create a copy of the spec sheet data without the id
    const { id, ...newSheet } = sheet; // Destructure to exclude id
    const { data, error } = await supabase
      .from('spec_sheets')
      .insert([newSheet], { returning: 'representation' }); // Ensure data is returned
  
    if (error) {
      console.error('Error duplicating spec sheet:', error);
    } else {
      console.log('Spec sheet duplicated:', data);
      if (Array.isArray(data)) {
        setSpecSheets([...specSheets, ...data]); // Update state with new data
      } else {
        console.error('Unexpected response format:', data);
      }
    }
  };

  const requestSignature = async (sheet) => {
    const recipientEmail = sheet.customer_email; // Assuming the email is stored in the sheet data
    const signatureLink = `https://yourapp.com/sign/${sheet.id}`; // Generate a link for signing
    
    // Here you would integrate with an e-signature service or send an email
    console.log(`Requesting signature for spec sheet ${sheet.id} from ${recipientEmail}`);
    alert(`Signature request would be sent to ${recipientEmail || 'customer'}`);
  };

  const deleteSpecSheet = async (id) => {
    if (window.confirm('Are you sure you want to delete this spec sheet? This action cannot be undone.')) {
      const { error } = await supabase
        .from('spec_sheets')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting spec sheet:', error);
        alert('Failed to delete spec sheet. Please try again.');
      } else {
        // Update local state
        setSpecSheets(specSheets.filter(sheet => sheet.id !== id));
      }
    }
  };

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const getStatusBadgeClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'in review':
        return 'status-badge-dashboard status-badge-review';
      case 'approved':
        return 'status-badge-dashboard status-badge-approved';
      case 'rejected':
        return 'status-badge-dashboard status-badge-rejected';
      default:
        return 'status-badge-dashboard status-badge-draft';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Spec Sheet Dashboard</h1>
            <p className="dashboard-subtitle">Manage and track all your product specifications</p>
          </div>
          <div className="dashboard-actions">
            <Link to="/create" className="spec-sheet-button primary">
              <PlusIcon className="w-5 h-5" /> 
              New Spec Sheet
            </Link>
          </div>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="dashboard-controls">
          <div className="search-container">
            <MagnifyingGlassIcon className="search-icon w-5 h-5" />
            <input
              type="text"
              placeholder="Search by product name, customer, or revision..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="In Review">In Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
        
        {/* Results count */}
        <div className="results-count">
          Showing {filteredSheets.length} of {specSheets.length} spec sheets
        </div>
        
        <div className="dashboard-card">
          {filteredSheets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th scope="col">
                      Document Type
                    </th>
                    <th 
                      scope="col" 
                      className="sortable"
                      onClick={() => requestSort('product_name')}
                    >
                      <div className="sort-container">
                        <span>Product Name</span>
                        {getSortDirectionIcon('product_name')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="sortable"
                      onClick={() => requestSort('customer_name')}
                    >
                      <div className="sort-container">
                        <span>Customer</span>
                        {getSortDirectionIcon('customer_name')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="sortable"
                      onClick={() => requestSort('spec_revision')}
                    >
                      <div className="sort-container">
                        <span>Revision</span>
                        {getSortDirectionIcon('spec_revision')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="sortable"
                      onClick={() => requestSort('status')}
                    >
                      <div className="sort-container">
                        <span>Status</span>
                        {getSortDirectionIcon('status')}
                      </div>
                    </th>
                    <th scope="col" className="text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSheets.map((sheet) => (
                    <tr key={sheet.id}>
                      <td>
                        <div className="document-type">
                          <div className="document-icon">
                            <ClipboardDocumentListIcon className="w-5 h-5" />
                          </div>
                          <span className="document-label">Spec Sheet</span>
                        </div>
                      </td>
                      <td>{sheet.product_name || 'Untitled'}</td>
                      <td>{sheet.customer_name || 'N/A'}</td>
                      <td>{sheet.spec_revision || 'Draft'}</td>
                      <td>
                        <span className={getStatusBadgeClass(sheet.status)}>
                          {sheet.status || 'Draft'}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1">
                          <Link 
                            to={`/edit/${sheet.id}`} 
                            className="action-button edit" 
                            title="Edit"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => downloadPDF(sheet)} 
                            className="action-button download" 
                            title="Download PDF"
                          >
                            <DocumentArrowDownIcon className="w-4 h-4" />
                          </button>
                          <div className="action-dropdown" ref={activeDropdown === sheet.id ? dropdownRef : null}>
                            <button 
                              onClick={() => toggleDropdown(sheet.id)} 
                              className="action-button" 
                              title="More actions"
                            >
                              <EllipsisVerticalIcon className="w-4 h-4" />
                            </button>
                            {activeDropdown === sheet.id && (
                              <div className="action-dropdown-menu">
                                <div 
                                  className="action-dropdown-item"
                                  onClick={() => duplicateSpecSheet(sheet)}
                                >
                                  <DocumentDuplicateIcon className="icon" />
                                  Duplicate
                                </div>
                                <div 
                                  className="action-dropdown-item"
                                  onClick={() => requestSignature(sheet)}
                                >
                                  <PencilSquareIcon className="icon" />
                                  Request Signature
                                </div>
                                <div className="action-dropdown-divider"></div>
                                <div 
                                  className="action-dropdown-item"
                                  onClick={() => deleteSpecSheet(sheet.id)}
                                >
                                  <TrashIcon className="icon" style={{ color: 'var(--danger)' }} />
                                  Delete
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <DocumentTextIcon className="empty-state-icon" />
              <h3 className="empty-state-title">No spec sheets found</h3>
              <p className="empty-state-description">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Get started by creating your first spec sheet.'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Link to="/create" className="spec-sheet-button primary">
                  <PlusIcon className="w-5 h-5" /> 
                  Create Spec Sheet
                </Link>
              )}
            </div>
          )}
          
          {/* Pagination could be added here if needed */}
          {filteredSheets.length > 0 && (
            <div className="pagination">
              <div className="pagination-info">
                Showing {filteredSheets.length} of {specSheets.length} spec sheets
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
