import React from 'react';
import { Link } from 'react-router-dom';

import '../../styles/components/card.css';
import '../../styles/components/button.css';

const LawyerCard = ({ lawyer }) => {
    return (
        <div className="card" style={{ padding: '24px', transition: 'transform 0.2s', border: '1px solid #f1f5f9' }}>
            {/* Header: Photo and Name */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#e2e8f0', // Placeholder for photo
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#64748b',
                    marginRight: '16px',
                    flexShrink: 0
                }}>
                    {lawyer.name ? lawyer.name.charAt(0).toUpperCase() : 'L'}
                </div>
                <div>
                    <h3 className="card-title" style={{ margin: 0, fontSize: '1.1rem' }}>{lawyer.name || 'Unknown Lawyer'}</h3>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                        {lawyer.specialization && lawyer.specialization.length > 0 ? lawyer.specialization[0] : 'General Law'}
                        {lawyer.specialization?.length > 1 && ` +${lawyer.specialization.length - 1}`}
                    </p>
                </div>
            </div>

            {/* Details: Location, Experience */}
            <div style={{ marginBottom: '20px', fontSize: '0.9rem', color: '#4a5568' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ marginRight: '8px' }}>📍</span>
                    {lawyer.location || 'Remote'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '8px' }}>💼</span>
                    {lawyer.experienceYears} Years Experience
                </div>
            </div>

            {/* Action */}
            <Link to={`/lawyers/${lawyer._id}`} className="btn btn-outline-primary" style={{ display: 'block', textAlign: 'center', width: '100%', textDecoration: 'none' }}>
                View Full Details
            </Link>
        </div>
    );
};

export default LawyerCard;
