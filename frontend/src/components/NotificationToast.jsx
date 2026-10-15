import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const NotificationToast = ({ notification, onDismiss }) => {
  if (!notification) return null;

  const { type = 'info', message } = notification;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} />;
      case 'error':
        return <AlertCircle size={18} />;
      default:
        return <Info size={18} />;
    }
  };

  return (
    <div className="toast-container" aria-live="polite">
      <div id="app-notification-toast" className={`toast ${type}`}>
        {getIcon()}
        <span style={{ flex: 1 }}>{message}</span>
        <button
          type="button"
          onClick={onDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            opacity: 0.8
          }}
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
