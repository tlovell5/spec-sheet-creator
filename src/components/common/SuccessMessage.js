import React, { useEffect } from 'react';

const SuccessMessage = ({ message, duration = 3000, onDismiss }) => {
  useEffect(() => {
    if (duration && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);
  
  if (!message) return null;
  
  return (
    <div className="success-message">
      <div className="success-content">
        <span className="success-icon">✓</span>
        <span className="success-text">{message}</span>
      </div>
      {onDismiss && (
        <button 
          className="success-dismiss" 
          onClick={onDismiss}
          aria-label="Dismiss message"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default SuccessMessage;
