import React, { createContext, useContext, useState, useRef } from 'react';
import Toast from './Toast';
import { Portal } from 'react-native-portalize';
const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);

  const showToast = (message, type = 'info') => {
    // 如果已经有Toast在显示，先清除之前的计时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setToast({ message, type, key: Date.now() });
  };

  const hideToast = () => {
    setToast(null);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Portal>
          <Toast
            key={toast.key} 
            message={toast.message}
            type={toast.type}
            onHide={hideToast}
          />
        </Portal>

      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};