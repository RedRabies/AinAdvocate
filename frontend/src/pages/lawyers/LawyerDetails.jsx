import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLawyerById } from '../../services/lawyer.service';
import '../../styles/components/button.css';

const LawyerDetails = () => {
    const { id } = useParams();
    const [lawyer, setLawyer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLawyer = async () => {
            try {
                const data = await getLawyerById(id);
                setLawyer(data);
            } catch (err) {
                console.error("Failed to fetch lawyer", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLawyer();
    }, [id]);

    if (loading) return <div className="container" style={{ padding: '40px' }}>Loading...</div>;
    if (!lawyer) return <div className="container" style={{ padding: '40px' }}>Lawyer not found</div>;

    return (
        <div className="container" style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto' }}>
            <Link to="/lawyers" style={{ color: '#666', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}>
                &larr; Back to Lawyers
            </Link>

            <div className="card" style={{ padding: '30px', borderRadius: '12px', background: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        color: '#4a5568',
                        marginRight: '30px'
                    }}>
                        {lawyer.name ? lawyer.name.charAt(0).toUpperCase() : 'L'}
                    </div>
                    <div>
                        <h1 style={{ margin: '0 0 10px 0', fontSize: '2rem' }}>{lawyer.name}</h1>
                        <span style={{
                            background: lawyer.isVerified ? '#dcfce7' : '#eee',
                            color: lawyer.isVerified ? '#16a34a' : '#666',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                        }}>
                            {lawyer.isVerified ? 'Verified Lawyer' : 'Pending Verification'}
                        </span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                    <div>
                        <h3 style={{ color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '8px' }}>Location</h3>
                        <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{lawyer.location || 'Not specified'}</p>
                    </div>

                    <div>
                        <h3 style={{ color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '8px' }}>Experience</h3>
                        <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{lawyer.experienceYears} Years</p>
                    </div>
                    <div>
                        <h3 style={{ color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '8px' }}>Specialization</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {lawyer.specialization?.map((spec, index) => (
                                <span key={index} style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>{spec}</span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 style={{ color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '8px' }}>Languages</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {lawyer.languages?.map((lang, index) => (
                                <span key={index} style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>{lang}</span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 style={{ color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '8px' }}>Rating</h3>
                        <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>⭐ {lawyer.rating || 'New'}</p>
                    </div>
                </div>

                {lawyer.bio && (
                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '12px' }}>Biography</h3>
                        <p style={{ lineHeight: '1.6', color: '#334155' }}>{lawyer.bio}</p>
                    </div>
                )}

                <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '30px' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Contact Information</h3>
                    <p><strong>Email:</strong> {lawyer.email}</p>
                    {/* Add phone or other contact info if available in public profile */}
                </div>
            </div>
        </div>
    );
};

export default LawyerDetails;
