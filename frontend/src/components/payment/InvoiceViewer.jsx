import React, { useState, useEffect } from 'react';
import paymentService from '../../services/payment.service';
import '../../styles/components/payment.css';

const InvoiceViewer = ({ caseId }) => {
    const [invoices, setInvoices] = useState([]);

    useEffect(() => {
        const fetchInvoices = async () => {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            try {
                const data = await paymentService.getInvoices(token, caseId);
                setInvoices(data);
            } catch (error) {
                console.error("Failed to load invoices", error);
            }
        };
        // Fetch initially and maybe poll or trigger from parent
        fetchInvoices();

        // Listen to an event? Or just manual refresh button
    }, [caseId]);

    return (
        <div className="payment-container" style={{ marginTop: '0' }}>
            <div className="payment-header">
                <h3>Invoices & Receipts</h3>
            </div>

            {invoices.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', margin: '20px 0' }}>No invoices found.</p>
            ) : (
                <div className="invoice-list">
                    {invoices.map((inv) => (
                        <div key={inv._id} className="invoice-item">
                            <div className="invoice-icon">
                                📄
                            </div>
                            <div className="invoice-details">
                                <p style={{ margin: 0, fontWeight: '600', color: '#0f172a' }}>{inv.invoiceNumber}</p>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>{new Date(inv.date).toLocaleDateString()}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p className="invoice-amount">৳{inv.amount}</p>
                                <button
                                    className="download-link"
                                    style={{ border: 'none', cursor: 'pointer', marginTop: '4px', background: 'none', color: '#3b82f6', fontWeight: 'bold' }}
                                    onClick={() => window.open(`/invoices/print/${inv._id}`, '_blank')}
                                >
                                    📄 Download PDF
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InvoiceViewer;
