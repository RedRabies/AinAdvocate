import React from 'react';
import '../../styles/components/card.css';
import '../../styles/components/button.css';

const CaseInboxCard = ({ data, onAccept, onReject }) => {
    return (
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #f59e0b', marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                    <span style={{
                        background: '#fffbeb', color: '#b45309', padding: '2px 8px', borderRadius: '4px',
                        fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase'
                    }}>
                        {data.category}
                    </span>
                    <h3 style={{ margin: '8px 0 5px 0', fontSize: '1.2rem' }}>{data.title}</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                        Client: {data.clientId?.name || 'Unknown'} • {new Date(data.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 'bold', color: data.urgency === 'HIGH' ? '#dc2626' : '#475569' }}>
                        {data.urgency} Urgency
                    </span>
                </div>
            </div>

            <p style={{ margin: '15px 0', color: '#334155', fontSize: '0.95rem', lineHeight: '1.5' }}>
                {data.description.substring(0, 150)}...
            </p>

            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button
                    onClick={() => onAccept(data._id)}
                    className="btn btn-primary"
                    style={{ flex: 1, background: '#16a34a', borderColor: '#16a34a' }}
                >
                    Accept Case
                </button>
                <button
                    onClick={() => onReject(data._id)}
                    className="btn btn-secondary"
                    style={{ flex: 1, background: '#f1f5f9', color: '#64748b', borderColor: '#e2e8f0' }}
                >
                    Not Interested
                </button>
            </div>
        </div>
    );
};

export default CaseInboxCard;
