import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import { jsPDF } from 'jspdf';

function Dashboard() {
  const [specSheets, setSpecSheets] = useState([]);

  useEffect(() => {
    const fetchSpecSheets = async () => {
      const { data, error } = await supabase.from('spec_sheets').select('*');
      if (error) console.error('Error fetching spec sheets:', error);
      else setSpecSheets(data);
    };
    fetchSpecSheets();

    const subscription = supabase
      .channel('public:spec_sheets')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'spec_sheets' }, payload => {
        setSpecSheets(prevSheets => [...prevSheets, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

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

  return (
    <div>
      <h1>Dashboard</h1>
      <table>
        <thead>
          <tr>
            <th>Document Type</th>
            <th>Product Name</th>
            <th>Customer</th>
            <th>Revision</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {specSheets.map((sheet) => (
            <tr key={sheet.id}>
              <td>Spec Sheet</td>
              <td>{sheet.product_name}</td>
              <td>{sheet.customer_name}</td>
              <td>{sheet.spec_revision}</td>
              <td>{sheet.status}</td>
              <td>
                <Link to={`/edit/${sheet.id}`}>
                  <button>Edit</button>
                </Link>
                <button onClick={() => downloadPDF(sheet)}>Download PDF</button>
                <button onClick={() => duplicateSpecSheet(sheet)}>Duplicate</button>
                <button onClick={() => requestSignature(sheet)}>Request Signature</button>
                <button onClick={() => deleteSpecSheet(sheet.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
