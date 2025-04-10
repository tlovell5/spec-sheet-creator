import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient';

function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  // Fetch documents from the database
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('spec_sheets')
          .select('*')
          .order('updated_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setDocuments(data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to load documents');
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, []);
  
  // Handle dropdown toggle
  const toggleDropdown = (id) => {
    if (activeDropdown === id) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(id);
    }
  };
  
  // Handle document deletion
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('spec_sheets')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Remove the deleted document from the state
      setDocuments(documents.filter(doc => doc.id !== id));
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('Failed to delete document');
    }
  };
  
  return (
    <div className="container">
      <div className="dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Spec Sheet Creator</h1>
          <Link to="/create" className="btn btn-primary">Create New Spec Sheet</Link>
        </div>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        <div className="table-container">
          {loading ? (
            <div className="text-center p-4">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="text-center p-4">No documents found. Create your first spec sheet!</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Document Type</th>
                  <th>Product Name</th>
                  <th>Customer</th>
                  <th>Revision</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.documentType || 'Spec Sheet'}</td>
                    <td>{doc.productIdentification?.productName || 'Untitled'}</td>
                    <td>{doc.customerInfo?.companyName || 'N/A'}</td>
                    <td>{doc.revision || '1.0'}</td>
                    <td>{doc.status || 'Draft'}</td>
                    <td>{new Date(doc.updatedAt || doc.updated_at).toLocaleDateString()}</td>
                    <td>
                      <div className="dropdown">
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => toggleDropdown(doc.id)}
                        >
                          Actions
                        </button>
                        {activeDropdown === doc.id && (
                          <div className="dropdown-content">
                            <Link to={`/edit/${doc.id}`} className="dropdown-item">
                              Edit Document
                            </Link>
                            <div className="dropdown-item" onClick={() => alert('Download functionality will be implemented')}>
                              Download Document
                            </div>
                            <div className="dropdown-item" onClick={() => alert('Duplicate functionality will be implemented')}>
                              Duplicate Document
                            </div>
                            {doc.documentType === 'Spec Sheet' && (
                              <div className="dropdown-item" onClick={() => alert('Request signatures functionality will be implemented')}>
                                Request Signatures
                              </div>
                            )}
                            <div className="dropdown-item text-danger" onClick={() => handleDelete(doc.id)}>
                              Delete Document
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
