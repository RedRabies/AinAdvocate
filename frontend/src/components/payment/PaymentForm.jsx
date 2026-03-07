
import React, { useState, useEffect } from 'react';
import paymentService from '../../services/payment.service';
import '../../styles/components/payment.css';

const PaymentForm = ({ caseId, currentUser, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [bkashNumber, setBkashNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFixed, setIsFixed] = useState(false);
    const [alreadyPaid, setAlreadyPaid] = useState(false);

    useEffect(() => {
        // Fetch case details to get agreed amount
        const fetchCaseInfo = async () => {
            try {
                const token = sessionStorage.getItem('token');
                // We'll use the public or protected view route to get just the budget/status
                const res = await import('axios').then(a => a.default.get(`http://localhost:5000/api/cases/${caseId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }));
                const c = res.data;
                if (c.budget && c.budget > 0) {
                    setAmount(c.budget);
                    setIsFixed(true);
                }
                if (c.status === 'IN_PROGRESS' || c.status === 'CLOSED') {
                    setAlreadyPaid(true);
                }
            } catch (err) {
                console.error("Failed to load case info for payment", err);
            }
        };
        fetchCaseInfo();
    }, [caseId]);

    // Lawyers don't see the payment form
    if (currentUser?.role === 'lawyer') return null;

    if (alreadyPaid) {
        return (
            <div className="payment-container glass-card" style={{ borderTop: '4px solid #10b981', textAlign: 'center', padding: '40px' }}>
                <h3 style={{ color: '#10b981' }}>Payment Complete ✅</h3>
                <p>You have already paid for this case.</p>
            </div>
        );
    }

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            await paymentService.processPayment({
                caseId,
                amount: Number(amount),
                method: 'Bkash',
                phone: bkashNumber
            }, token);
            alert("Payment Successful! Invoice generated.");
            setAlreadyPaid(true);
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Payment failed", error);
            alert(error.response?.data?.message || "Payment failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="payment-container glass-card" style={{ borderTop: '4px solid #e2136e' }}>
            <div className="payment-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', background: '#e2136e', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    b
                </div>
                <h3 style={{ color: '#e2136e' }}>bKash Payment</h3>
            </div>

            <form onSubmit={handlePayment}>
                <div className="payment-form-group">
                    <label>Your bKash Account Number</label>
                    <input
                        type="text"
                        className="payment-input"
                        value={bkashNumber}
                        onChange={(e) => setBkashNumber(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        required
                        pattern="^01[0-9]{9}$"
                        title="Please enter a valid 11-digit BD phone number"
                    />
                </div>

                <div className="payment-form-group">
                    <label>Amount (৳)</label>
                    <input
                        type="number"
                        min="1"
                        className="payment-input"
                        value={amount}
                        onChange={(e) => !isFixed && setAmount(e.target.value)}
                        placeholder="0.00"
                        required
                        readOnly={isFixed}
                        style={{ backgroundColor: isFixed ? '#f1f5f9' : 'white', cursor: isFixed ? 'not-allowed' : 'text' }}
                    />
                </div>

                <div style={{ padding: '15px', background: '#fce7f3', borderRadius: '10px', marginBottom: '20px', border: '1px solid #fbcfe8' }}>
                    <p style={{ margin: 0, fontWeight: '600', color: '#be185d' }}>🔒 Secure bKash Gateway</p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#9d174d' }}>Mock payment. No real money deducted.</p>
                </div>

                <button
                    type="submit"
                    className="pay-btn"
                    disabled={loading}
                    style={{ opacity: loading ? 0.7 : 1, background: '#e2136e', boxShadow: '0 4px 12px rgba(226, 19, 110, 0.3)' }}
                >
                    {loading ? 'Processing...' : 'Confirm Payment'}
                </button>
            </form>
        </div>
    );
};

export default PaymentForm;
