import React from 'react';
import { Link } from 'react-router-dom';

import '../../styles/components/card.css';
import '../../styles/pages/resources.css';

const ResourceCard = ({ resource }) => {
    return (
        <div className="card resource-card">
            <span className="category-tag">
                {resource.category}
            </span>
            <h3 className="card-title">{resource.title}</h3>
            <p style={{ color: '#718096', fontSize: '0.9em', marginBottom: '16px' }}>
                {resource.content?.substring(0, 100)}...
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85em', color: '#a0aec0' }}>{resource.language}</span>
                <Link to={`/resources/${resource._id}`} style={{
                    color: 'var(--primary)',
                    textDecoration: 'none',
                    fontWeight: '600'
                }}>
                    Read More →
                </Link>
            </div>
        </div>
    );
};

export default ResourceCard;
