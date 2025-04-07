import React, { useEffect } from 'react';
import { supabase } from './supabaseClient';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import EditSpecSheet from './pages/EditSpecSheet';
import ErrorBoundary from './ErrorBoundary';
import './index.css'; // Import our Tailwind CSS

function App() {
  useEffect(() => {
    const initializeApp = async () => {
      // Fetch initial data
      const { data, error: fetchError } = await supabase.from('spec_sheets').select('*');
      if (fetchError) console.error('Error fetching data:', fetchError);
      else console.log('Data:', data);
    };
    
    initializeApp();
  }, []);

  return (
    <Router>
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/edit/:id" element={<EditSpecSheet />} />
            <Route path="/create" element={<EditSpecSheet />} />
          </Routes>
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
