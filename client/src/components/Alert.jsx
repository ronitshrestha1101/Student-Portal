import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

const Alert = ({ type = 'info', message, className = '' }) => {
  if (!message) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} className="alert-icon-success" />;
      case 'error':
        return <AlertCircle size={18} className="alert-icon-error" />;
      case 'warning':
        return <AlertTriangle size={18} className="alert-icon-warning" />;
      default:
        return <Info size={18} className="alert-icon-info" />;
    }
  };

  return (
    <div className={`alert-banner alert-${type} ${className}`} role="alert">
      <div className="alert-content">
        {getIcon()}
        <span className="alert-message">{message}</span>
      </div>
    </div>
  );
};

export default Alert;
