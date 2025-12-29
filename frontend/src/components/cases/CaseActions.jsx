import React from 'react';
import '../../styles/components/button.css';

const CaseActions = ({ status, onEdit, onCancel }) => {
    if (status !== 'PENDING') return null;

    return (
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <button onClick={onEdit} className="btn btn-primary">
                Edit Request
            </button>
            <button onClick={onCancel} className="btn btn-danger" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}>
                Cancel Request
            </button>
        </div>
    );
};

export default CaseActions;
