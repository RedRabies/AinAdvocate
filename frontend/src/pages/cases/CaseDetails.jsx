import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCaseById, cancelCase } from '../../services/case.service';
import CaseTimeline from '../../components/cases/CaseTimeline';
import CaseActions from '../../components/cases/CaseActions';
import { useToast } from '../../components/common/Toast';
import ConfirmationModal from '../../components/common/ConfirmationModal';

import { createReview } from '../../services/review.service';
import PaymentForm from '../../components/payment/PaymentForm';

const CaseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [caseItem, setCaseItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    // Review State
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
    const userRole = JSON.parse(sessionStorage.getItem('user') || '{}').role;

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

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            await createReview({
                caseId: id,
                lawyerId: caseItem.assignedLawyerId._id,
                rating: parseInt(reviewData.rating),
                comment: reviewData.comment
            });
            addToast('Review submitted successfully!', 'success');
            setShowReviewModal(false);
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to submit review', 'error');
        }
    };

    // Payment State
    const [showPayModal, setShowPayModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [processingPayment, setProcessingPayment] = useState(false);

    const handlePayment = async (e) => {
        e.preventDefault();
        setProcessingPayment(true);
        try {
            const token = sessionStorage.getItem('token');
            // Using the mock payment endpoint
            const res = await import('axios').then(a => a.default.post('http://localhost:5000/api/payments/process', {
                caseId: id,
                amount: parseFloat(paymentAmount),
                lawyerId: caseItem.assignedLawyerId._id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            }));

            addToast('Payment successful! Case is now In Progress.', 'success');
            setShowPayModal(false);
            loadCase(); // Refresh status
        } catch (err) {
            addToast(err.response?.data?.message || 'Payment failed', 'error');
        } finally {
            setProcessingPayment(false);
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

                {/* Communication & Actions */}
                <div style={{ marginTop: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#1e293b' }}>Actions</h4>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <Link to={`/cases/${id}/communicate`} className="btn btn-primary" style={{ textDecoration: 'none' }}>
                            💬 Open Chat & Appointments
                        </Link>

                        {/* Payment Button for Assigned Cases (Client Only) */}
                        {userRole === 'client' && caseItem.status === 'ASSIGNED' && (
                            <button
                                onClick={() => setShowPayModal(true)}
                                className="btn"
                                style={{ background: '#10b981', color: 'white', border: 'none' }}
                            >
                                💳 Make Payment
                            </button>
                        )}

                        {/* Review Button for Closed Cases */}
                        {userRole === 'client' && caseItem.status === 'CLOSED' && (
                            <button
                                onClick={() => setShowReviewModal(true)}
                                className="btn"
                                style={{ background: '#f59e0b', color: 'white', border: 'none' }}
                            >
                                ★ Rate Lawyer
                            </button>
                        )}
                    </div>
                </div>

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

            {/* Payment Modal */}
            {showPayModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '10px', borderRadius: '12px', width: '90%', maxWidth: '500px', position: 'relative' }}>
                        <button
                            onClick={() => setShowPayModal(false)}
                            style={{ position: 'absolute', right: '15px', top: '15px', border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer', zIndex: 10 }}
                        >
                            &times;
                        </button>
                        <PaymentForm
                            caseId={id}
                            currentUser={{ role: userRole }}
                            onSuccess={() => {
                                setShowPayModal(false);
                                loadCase();
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {showReviewModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px' }}>
                        <h3 style={{ marginTop: 0 }}>Rate Your Experience</h3>
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                            How was your experience working with {caseItem.assignedLawyerId?.name}?
                        </p>
                        <form onSubmit={handleSubmitReview}>
                            <div className="form-group">
                                <label className="form-label">Rating</label>
                                <div style={{ display: 'flex', gap: '10px', fontSize: '1.5rem', cursor: 'pointer' }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <span
                                            key={star}
                                            onClick={() => setReviewData({ ...reviewData, rating: star })}
                                            style={{ color: star <= reviewData.rating ? '#f59e0b' : '#cbd5e1' }}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Comment</label>
                                <textarea
                                    className="form-input"
                                    rows="4"
                                    placeholder="Share your feedback..."
                                    value={reviewData.comment}
                                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Submit Review</button>
                                <button type="button" onClick={() => setShowReviewModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CaseDetails;
