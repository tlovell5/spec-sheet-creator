import React, { useEffect, useState, useRef } from 'react';
import { supabase } from './supabaseClient';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import { jsPDF } from 'jspdf';

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

  const getSortDirectionIndicator = (key) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
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

    // Call your backend API to send an email
    const response = await fetch('http://localhost:3001/api/send-signature-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: recipientEmail,
        link: signatureLink,
      }),
    });

    if (response.ok) {
      alert(`Signature request sent to ${recipientEmail}`);
    } else {
      console.error('Failed to send signature request');
    }
  };

  const deleteSpecSheet = async (id) => {
    const { error } = await supabase
      .from('spec_sheets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting spec sheet:', error);
    } else {
      setSpecSheets(specSheets.filter(sheet => sheet.id !== id));
      console.log('Spec sheet deleted successfully');
    }
  };

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  // Function to get status class for styling
  const getStatusClass = (status) => {
    switch(status) {
      case 'Draft': return 'status-draft';
      case 'In Review': return 'status-review';
      case 'Approved': return 'status-approved';
      case 'Rejected': return 'status-rejected';
      default: return '';
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Spec Sheet Dashboard</h1>
            <p className="dashboard-subtitle">Manage and track all your product specifications</p>
          </div>
          <Link to="/create" style={{ textDecoration: 'none' }}>
            <button className="create-button">
              <span>+</span> 
              New Spec Sheet
            </button>
          </Link>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search specs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-box">
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
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
        
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Document Type</th>
                <th onClick={() => requestSort('product_name')}>
                  Product Name {getSortDirectionIndicator('product_name')}
                </th>
                <th onClick={() => requestSort('customer_name')}>
                  Customer {getSortDirectionIndicator('customer_name')}
                </th>
                <th onClick={() => requestSort('spec_revision')}>
                  Revision {getSortDirectionIndicator('spec_revision')}
                </th>
                <th onClick={() => requestSort('status')}>
                  Status {getSortDirectionIndicator('status')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSheets.map((sheet) => (
                <tr key={sheet.id}>
                  <td>Spec Sheet</td>
                  <td>{sheet.product_name}</td>
                  <td>{sheet.customer_name}</td>
                  <td>{sheet.spec_revision}</td>
                  <td>
                    <span className={`status-pill ${getStatusClass(sheet.status)}`}>
                      {sheet.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <div className="dropdown-container" ref={activeDropdown === sheet.id ? dropdownRef : null}>
                      <button className="dropdown-toggle" onClick={() => toggleDropdown(sheet.id)}>
                        <span className="dots">&#8942;</span>
                      </button>
                      {activeDropdown === sheet.id && (
                        <div className="dropdown-menu">
                          <Link to={`/edit/${sheet.id}`} className="dropdown-item">
                            <span className="dropdown-item-icon">✏️</span> Edit
                          </Link>
                          <button className="dropdown-item" onClick={() => downloadPDF(sheet)}>
                            <span className="dropdown-item-icon">📄</span> Download PDF
                          </button>
                          <button className="dropdown-item" onClick={() => duplicateSpecSheet(sheet)}>
                            <span className="dropdown-item-icon">🔄</span> Duplicate
                          </button>
                          <button className="dropdown-item" onClick={() => requestSignature(sheet)}>
                            <span className="dropdown-item-icon">✍️</span> Request Signature
                          </button>
                          <button className="dropdown-item delete" onClick={() => deleteSpecSheet(sheet.id)}>
                            <span className="dropdown-item-icon">🗑️</span> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* No results message */}
        {filteredSheets.length === 0 && (
          <div className="no-results">
            No spec sheets found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
