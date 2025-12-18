import React from 'react';
import '../../styles/components/button.css';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', isDangerous = false }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                width: '90%',
                maxWidth: '400px',
                padding: '24px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                animation: 'fadeIn 0.2s ease-out'
            }}>
                <h3 style={{ marginTop: 0, fontSize: '1.25rem', color: '#1e293b' }}>{title}</h3>
                <p style={{ color: '#64748b', lineHeight: '1.5', margin: '12px 0 24px 0' }}>{message}</p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button
                        onClick={onClose}
                        className="btn"
                        style={{ background: '#f1f5f9', color: '#475569', border: 'none' }}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => { onConfirm(); onClose(); }}
                        className={`btn ${isDangerous ? 'btn-danger' : 'btn-primary'}`}
                        style={{ border: 'none' }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
