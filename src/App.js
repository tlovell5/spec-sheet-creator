import React, { useEffect } from 'react';
import { supabase } from './supabaseClient';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import EditSpecSheet from './pages/EditSpecSheet'; // Corrected path
import ErrorBoundary from './ErrorBoundary'; // Import ErrorBoundary

function App() {
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('spec_sheets').select('*');
      if (error) console.error('Error fetching data:', error);
      else console.log('Data:', data);
    };
    fetchData();
  }, []);

  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/edit/:id" element={<EditSpecSheet />} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
