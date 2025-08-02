import React, { memo } from 'react';
import type { AlertState } from '../types/index.js';

interface CustomAlertProps {
  alertState: AlertState;
  onClose: () => void;
}

const CustomAlert = memo<CustomAlertProps>(({ alertState, onClose }) => {
  if (!alertState.show) return null;

  return (
    <div className="custom-alert-overlay">
      <div className={`custom-alert ${alertState.type}`}>
        <div className="custom-alert-content">
          <div className="custom-alert-message">{alertState.message}</div>
          <button 
            className="custom-alert-close"
            onClick={onClose}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
});

CustomAlert.displayName = 'CustomAlert';

export default CustomAlert; 