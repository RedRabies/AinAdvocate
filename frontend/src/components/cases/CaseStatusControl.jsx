import React from 'react';

const CaseStatusControl = ({ currentStatus, onChange }) => {
    // Only allow transitions for active cases
    if (currentStatus === 'CLOSED' || currentStatus === 'CANCELLED' || currentStatus === 'REJECTED') {
        return <span style={{ color: '#64748b', fontWeight: 'bold' }}>{currentStatus.replace('_', ' ')}</span>;
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '0.9rem', color: '#64748b' }}>Status:</label>
            <select
                value={currentStatus}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: 'white',
                    fontWeight: '500',
                    color: '#334155'
                }}
            >
                <option value="ACCEPTED">ACCEPTED</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="CLOSED">CLOSED</option>
            </select>
        </div>
    );
};

export default CaseStatusControl;
