
import React, { useState, useEffect } from 'react';
import paymentService from '../../services/payment.service';
import '../../styles/components/payment.css';

const PaymentForm = ({ caseId, currentUser }) => {
    const [amount, setAmount] = useState('');
    const [bkashNumber, setBkashNumber] = useState('');
    const [loading, setLoading] = useState(false);

    // Lawyers don't see the payment form
    if (currentUser?.role === 'lawyer') return null;

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            // Mock payment processing including bkash number logic if needed by backend
            await paymentService.processPayment({ caseId, amount: Number(amount), method: 'Bkash', phone: bkashNumber }, token);
            alert("Payment Successful! Invoice generated.");
            setAmount('');
            setBkashNumber('');
            // Trigger refresh if needed
        } catch (error) {
            console.error("Payment failed", error);
            alert("Payment failed");
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
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        required
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
