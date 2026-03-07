import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../../components/common/Toast';
import '../../styles/components/card.css';
import '../../styles/components/button.css';


const PublicCaseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [caseItem, setCaseItem] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isApplying, setIsApplying] = useState(false);
    const [appData, setAppData] = useState({ proposedFee: '', message: '' });
    const [userCategories, setUserCategories] = useState([]);
    const [isVerified, setIsVerified] = useState(false);

    const user = JSON.parse(sessionStorage.getItem('user') || 'null');

    // Fetch user profile to get categories (if lawyer)
    useEffect(() => {
        if (user && user.role === 'lawyer') {
            const fetchProfile = async () => {
                try {
                    const token = sessionStorage.getItem('token');
                    const res = await axios.get('http://localhost:5000/api/lawyers/profile/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUserCategories(res.data.categories || []);
                    setIsVerified(res.data.isVerified || false);
                } catch (err) {
                    console.error("Failed to fetch lawyer profile", err);
                }
            };
            fetchProfile();
        }
    }, []);

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

    const handleApplySubmit = async (e) => {
        e.preventDefault();
        try {
            const token = sessionStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/cases/${id}/apply`, appData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            addToast('Application submitted successfully!', 'success');
            setIsApplying(false);
            navigate('/find-cases'); // Redirect to search page
        } catch (err) {
            console.error(err);
            addToast(err.response?.data?.message || 'Failed to apply.', 'error');
        }
    };

    if (loading) return <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>Loading...</div>;
    if (error) return <div className="container" style={{ padding: '80px 20px', textAlign: 'center', color: '#ef4444' }}>{error}</div>;
    if (!caseItem) return null;

    return (
        <div className="container" style={{ padding: '80px 20px', maxWidth: '800px', margin: '0 auto' }}>
            <Link to="/find-cases" style={{ color: '#64748b', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}>
                &larr; Back to Find Cases
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
                            {(() => {
                                const matchesCategory = userCategories.some(cat =>
                                    cat.toLowerCase().trim() === caseItem.category.toLowerCase().trim() ||
                                    caseItem.category.toLowerCase().includes(cat.toLowerCase().trim()) ||
                                    cat.toLowerCase().includes(caseItem.category.toLowerCase().trim())
                                );

                                if (!isVerified) {
                                    return (
                                        <p style={{ color: '#ef4444', marginBottom: '15px', fontSize: '0.95rem', fontWeight: '500' }}>
                                            You must be verified to apply for cases.
                                        </p>
                                    );
                                }

                                return matchesCategory ? (
                                    <>
                                        <p style={{ color: '#64748b', marginBottom: '15px', fontSize: '0.95rem' }}>
                                            Submit a proposal to represent this client.
                                        </p>
                                        <button onClick={() => setIsApplying(true)} className="btn btn-primary">
                                            Apply for Case
                                        </button>
                                    </>
                                ) : (
                                    <p style={{ color: '#ef4444', marginBottom: '15px', fontSize: '0.95rem', fontWeight: '500' }}>
                                        Your specialization ({userCategories.join(', ')}) does not match this case category ({caseItem.category}).
                                    </p>
                                );
                            })()}
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

            {/* Application Modal */}
            {isApplying && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '500px', maxWidth: '90%' }}>
                        <h3 style={{ marginTop: 0 }}>Submit Proposal</h3>
                        <p style={{ color: '#666' }}>Send a proposal for this case. Mention your fee and strategy.</p>

                        <form onSubmit={handleApplySubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Proposed Fee (BDT)</label>
                                <input
                                    type="number"
                                    required
                                    className="form-input"
                                    value={appData.proposedFee}
                                    onChange={e => setAppData({ ...appData, proposedFee: e.target.value })}
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Message to Client</label>
                                <textarea
                                    required
                                    rows="4"
                                    className="form-textarea"
                                    placeholder="Describe why you are the best fit..."
                                    value={appData.message}
                                    onChange={e => setAppData({ ...appData, message: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                ></textarea>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setIsApplying(false)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary">Submit Application</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicCaseDetails;
