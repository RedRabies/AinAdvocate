import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../../components/common/Toast';
import { acceptCase } from '../../services/case.service';
import '../../styles/components/card.css';
import '../../styles/components/button.css';


const PublicCaseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [caseItem, setCaseItem] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const user = JSON.parse(sessionStorage.getItem('user') || 'null');

    const handleApply = async () => {
        if (!window.confirm('Are you sure you want to apply for this case?')) return;
        try {
            await acceptCase(id);
            addToast('Case accepted successfully!', 'success');
            navigate('/lawyer/cases'); // Redirect to my active cases
        } catch (err) {
            console.error(err);
            addToast(err.response?.data?.message || 'Failed to accept case.', 'error');
        }
    };

    useEffect(() => {
        const fetchCase = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/cases/public/${id}`);
                setCaseItem(res.data);
            } catch (err) {
                console.error("Failed to load case", err);
                setError("Case not found or no longer available.");
            } finally {
                setLoading(false);
            }
        };
        fetchCase();
    }, [id]);

    if (loading) return <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>Loading...</div>;
    if (error) return <div className="container" style={{ padding: '80px 20px', textAlign: 'center', color: '#ef4444' }}>{error}</div>;
    if (!caseItem) return null;

    return (
        <div className="container" style={{ padding: '80px 20px', maxWidth: '800px', margin: '0 auto' }}>
            <Link to="/cases" style={{ color: '#64748b', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}>
                &larr; Back to Cases
            </Link>

            <div className="card" style={{ background: 'white', borderRadius: '12px', padding: '40px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ marginBottom: '20px' }}>
                    <span style={{
                        background: '#eff6ff', color: '#3b82f6', padding: '4px 12px', borderRadius: '20px',
                        fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '10px', display: 'inline-block'
                    }}>
                        {caseItem.category}
                    </span>
                    <h1 style={{ margin: '10px 0 5px 0', fontSize: '2rem', color: '#1e293b' }}>{caseItem.title}</h1>
                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                        Posted on {new Date(caseItem.createdAt).toLocaleDateString()}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                    <div style={{
                        padding: '6px 12px', borderRadius: '6px',
                        background: caseItem.urgency === 'HIGH' ? '#fecaca' : '#f3f4f6',
                        color: caseItem.urgency === 'HIGH' ? '#991b1b' : '#374151',
                        fontWeight: '600', fontSize: '0.9rem'
                    }}>
                        {caseItem.urgency} Priority
                    </div>
                    <div style={{
                        padding: '6px 12px', borderRadius: '6px',
                        background: '#ecfdf5', color: '#047857',
                        fontWeight: '600', fontSize: '0.9rem'
                    }}>
                        Open for Applications
                    </div>
                </div>

                <div style={{ marginBottom: '40px', borderTop: '1px solid #e2e8f0', paddingTop: '30px' }}>
                    <h3 style={{ color: '#334155', marginBottom: '15px', fontSize: '1.1rem' }}>Case Details</h3>
                    <p style={{ color: '#475569', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontSize: '1.05rem' }}>
                        {caseItem.description}
                    </p>
                </div>

                {/* CTA Section based on Role */}
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    {user && user.role === 'lawyer' ? (
                        <>
                            <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Interested in this Case?</h4>
                            <p style={{ color: '#64748b', marginBottom: '15px', fontSize: '0.95rem' }}>
                                As a verified lawyer, you can apply to represent this client immediately.
                            </p>
                            <button onClick={handleApply} className="btn btn-primary">
                                Apply for Case
                            </button>
                        </>
                    ) : user && user.role === 'client' ? (
                        <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
                            You are viewing this case as a client.
                        </p>
                    ) : (
                        <>
                            <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Are you a Lawyer?</h4>
                            <p style={{ color: '#64748b', marginBottom: '15px', fontSize: '0.95rem' }}>
                                Login to your dashboard to view full details and apply for this case.
                            </p>
                            <Link to="/login" className="btn btn-primary">Login to Apply</Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublicCaseDetails;
