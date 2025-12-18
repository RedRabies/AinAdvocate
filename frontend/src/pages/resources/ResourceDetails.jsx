import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getResourceById } from '../../services/resource.service';
import '../../styles/pages/resources.css';
import '../../styles/components/button.css';

const ResourceDetails = () => {
    const { id } = useParams();
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchResource();
    }, [id]);

    const fetchResource = async () => {
        try {
            const data = await getResourceById(id);
            setResource(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load resource details.');
            setLoading(false);
        }
    };

    if (loading) return <div className="container" style={{ padding: '40px' }}>Loading...</div>;
    if (error) return <div className="container" style={{ padding: '40px', color: 'red' }}>{error}</div>;
    if (!resource) return <div className="container" style={{ padding: '40px' }}>Resource not found.</div>;

    return (
        <div className="container resource-details-container" style={{ padding: '40px 20px', maxWidth: '800px' }}>
            <Link to="/resources" className="btn-link" style={{ marginBottom: '20px', display: 'inline-block', color: 'var(--primary)' }}>&larr; Back to Library</Link>

            <article className="card" style={{ padding: '40px' }}>
                <header style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
                    <div className="badge" style={{
                        background: '#e0f2fe', color: '#0369a1',
                        padding: '4px 12px', borderRadius: '20px',
                        display: 'inline-block', marginBottom: '10px',
                        fontSize: '0.875rem', fontWeight: '600'
                    }}>
                        {resource.category}
                    </div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '10px', color: 'var(--text-main)' }}>{resource.title}</h1>
                    <div style={{ color: 'var(--text-muted)' }}>
                        <span>Language: {resource.language}</span>
                        {resource.updatedAt && <span style={{ marginLeft: '15px' }}>Updated: {new Date(resource.updatedAt).toLocaleDateString()}</span>}
                    </div>
                </header>

                <div className="resource-content" style={{ lineHeight: '1.7', fontSize: '1.1rem', color: '#374151' }}>
                    {resource.content ? (
                        <p>{resource.content}</p>
                    ) : (
                        <p>No preview content available.</p>
                    )}
                </div>

                {resource.url && (
                    <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                            View Full Document / External Link
                        </a>
                    </div>
                )}
            </article>
        </div>
    );
};

export default ResourceDetails;
