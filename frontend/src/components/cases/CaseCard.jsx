import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/components/card.css';
import '../../styles/components/button.css';

const CaseCard = ({ data }) => {
    const { title, category, urgency, status, createdAt, description } = data;

    const urgencyColor = {
        'LOW': '#10b981', // green
        'MEDIUM': '#f59e0b', // amber
        'HIGH': '#ef4444'  // red
    };

    const statusColor = {
        'PENDING': '#64748b',
        'ACCEPTED': '#3b82f6',
        'IN_PROGRESS': '#8b5cf6',
        'CLOSED': '#10b981'
    };

    return (
        <div className="card" style={{ padding: '24px', marginBottom: '20px', borderLeft: `4px solid ${urgencyColor[urgency] || '#cbd5e1'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                    <h3 className="card-title" style={{ margin: 0 }}>{title}</h3>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                        {new Date(createdAt).toLocaleDateString()} • {category}
                    </div>
                </div>
                <div style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    background: statusColor[status] || '#cbd5e1',
                    color: 'white',
                    textTransform: 'uppercase'
                }}>
                    {status.replace('_', ' ')}
                </div>
            </div>

            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5', margin: '0 0 15px 0' }}>
                {description}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: urgencyColor[urgency] }}>
                    {urgency} Priority
                </span>
                {/* Future: Add View Details / Chat button here */}
            </div>

            <Link to={`/cases/${data._id}`} className="btn btn-outline-primary" style={{ display: 'block', textAlign: 'center', marginTop: '15px', textDecoration: 'none' }}>
                View Details
            </Link>
        </div>
    );
};

export default CaseCard;
