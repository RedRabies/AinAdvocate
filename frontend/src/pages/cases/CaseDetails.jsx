import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCaseById, cancelCase } from '../../services/case.service';
import CaseTimeline from '../../components/cases/CaseTimeline';
import CaseActions from '../../components/cases/CaseActions';
import { useToast } from '../../components/common/Toast';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const CaseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [caseItem, setCaseItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        loadCase();
    }, [id]);

    const loadCase = async () => {
        try {
            const data = await getCaseById(id);
            setCaseItem(data);
        } catch (err) {
            addToast('Failed to load case details', 'error');
            navigate('/cases/my');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        navigate(`/cases/${id}/edit`);
    };

    const handleCancel = () => {
        setModalOpen(true);
    };

    const confirmCancel = async () => {
        try {
            await cancelCase(id);
            addToast('Case cancelled successfully', 'success');
            loadCase(); // Reload to show updated status/timeline
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to cancel case', 'error');
        } finally {
            setModalOpen(false);
        }
    };

    if (loading) return <div className="container" style={{ padding: '40px' }}>Loading...</div>;
    if (!caseItem) return null;

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
            <Link to="/cases/my" style={{ color: '#64748b', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}>
                &larr; Back to My Cases
            </Link>

            <div className="card" style={{ background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                    <div>
                        <span style={{
                            background: '#eff6ff', color: '#3b82f6', padding: '4px 12px', borderRadius: '20px',
                            fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '10px', display: 'inline-block'
                        }}>
                            {caseItem.category}
                        </span>
                        <h1 style={{ margin: '10px 0', fontSize: '1.8rem', color: '#1e293b' }}>{caseItem.title}</h1>
                        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                            Posted on {new Date(caseItem.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{
                            display: 'inline-block', padding: '6px 12px', borderRadius: '6px',
                            fontWeight: '600', fontSize: '0.9rem',
                            background: caseItem.status === 'PENDING' ? '#fff7ed' :
                                caseItem.status === 'CANCELLED' ? '#fef2f2' : '#f0fdf4',
                            color: caseItem.status === 'PENDING' ? '#ea580c' :
                                caseItem.status === 'CANCELLED' ? '#ef4444' : '#16a34a'
                        }}>
                            {caseItem.status.replace('_', ' ')}
                        </div>
                        <div style={{ marginTop: '5px', fontSize: '0.85rem', color: '#64748b' }}>
                            Urgency: <span style={{ fontWeight: '600', color: caseItem.urgency === 'HIGH' ? '#ef4444' : '#334155' }}>{caseItem.urgency}</span>
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <h4 style={{ color: '#64748b', marginBottom: '10px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Description</h4>
                    <p style={{ color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                        {caseItem.description}
                    </p>
                </div>

                <CaseTimeline history={caseItem.statusHistory} />

                <CaseActions
                    status={caseItem.status}
                    onEdit={handleEdit}
                    onCancel={handleCancel}
                />
            </div>

            <ConfirmationModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={confirmCancel}
                title="Cancel Case Request"
                message="Are you sure you want to cancel this case request? This action cannot be undone."
            />
        </div>
    );
};

export default CaseDetails;
