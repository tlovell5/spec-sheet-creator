import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import SpecSheet from './pages/SpecSheet';
import { SpecSheetProvider } from './context/SpecSheetContext';
import './styles/main.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="header">
          <div className="container">
            <h1>Spec Sheet Creator</h1>
          </div>
        </header>
        <main className="container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route 
              path="/create" 
              element={
                <SpecSheetProvider>
                  <SpecSheet />
                </SpecSheetProvider>
              } 
            />
            <Route 
              path="/edit/:id" 
              element={
                <SpecSheetProvider>
                  <SpecSheet />
                </SpecSheetProvider>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
