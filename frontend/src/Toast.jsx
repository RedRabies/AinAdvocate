import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    // Toast types: 'success', 'error', 'info', 'loading'
    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        if (duration) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
        return id; // Return ID in case we want to manually remove (e.g. for loading)
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        style={{
                            padding: '12px 20px',
                            borderRadius: '8px',
                            background: toast.type === 'error' ? '#E53E3E' : toast.type === 'success' ? '#38A169' : '#3182CE',
                            color: '#fff',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            minWidth: '250px',
                            animation: 'slideIn 0.3s ease-out'
                        }}
                    >
                        {toast.message}
                    </div>
                ))}
            </div>
            <style>
                {`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}
            </style>
        </ToastContext.Provider>
    );
};
