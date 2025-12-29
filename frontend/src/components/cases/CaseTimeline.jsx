import React from 'react';

const CaseTimeline = ({ history }) => {
    if (!history || history.length === 0) return null;

    // Sort history by date descending
    const sortedHistory = [...history].sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt));

    return (
        <div style={{ marginTop: '20px' }}>
            <h4 style={{ color: '#64748b', marginBottom: '15px' }}>Status Timeline</h4>
            <div style={{ borderLeft: '2px solid #e2e8f0', paddingLeft: '20px', marginLeft: '5px' }}>
                {sortedHistory.map((item, index) => (
                    <div key={index} style={{ marginBottom: '20px', position: 'relative' }}>
                        <div style={{
                            position: 'absolute',
                            left: '-26px',
                            top: '0',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: index === 0 ? '#3b82f6' : '#94a3b8',
                            border: '2px solid white',
                            boxShadow: '0 0 0 2px #e2e8f0'
                        }}></div>

                        <div style={{ fontWeight: '600', color: index === 0 ? '#1e293b' : '#64748b' }}>
                            {item.status.replace('_', ' ')}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                            {new Date(item.changedAt).toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CaseTimeline;
