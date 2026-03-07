import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import paymentService from '../../services/payment.service';

const InvoicePDF = () => {
    const { id } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoice = async () => {
            const token = sessionStorage.getItem('token');
            try {
                const data = await paymentService.getInvoiceById(token, id);
                setInvoice(data);
                // Auto-print when loaded
                setTimeout(() => window.print(), 1000);
            } catch (error) {
                console.error("Failed to load invoice", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [id]);

    if (loading) return <div>Loading Invoice...</div>;
    if (!invoice) return <div>Invoice not found</div>;

    return (
        <div id="invoice-content" style={{ padding: '40px', background: 'white', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #333', paddingBottom: '20px', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ margin: 0, color: '#1e293b' }}>INVOICE</h1>
                    <p style={{ margin: '5px 0', color: '#64748b' }}>#{invoice.invoiceNumber}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h2 style={{ margin: 0, color: '#3b82f6' }}>AinAdvocate</h2>
                    <p style={{ margin: '5px 0', color: '#64748b' }}>Legal Services Platform</p>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                <div>
                    <h4 style={{ margin: '0 0 10px 0', color: '#64748b', textTransform: 'uppercase', fontSize: '0.85rem' }}>Bill To:</h4>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{invoice.issuedTo?.name}</p>
                    <p style={{ margin: '5px 0' }}>{invoice.issuedTo?.email}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#64748b', textTransform: 'uppercase', fontSize: '0.85rem' }}>Paid To:</h4>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{invoice.payee?.name || 'Lawyer'}</p>
                    <p style={{ margin: '5px 0' }}>{invoice.payee?.email}</p>
                    <div style={{ marginTop: '15px' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>Date: {new Date(invoice.createdAt).toLocaleDateString()}</p>
                        <p style={{ margin: '5px 0', color: '#10b981', fontWeight: 'bold' }}>Status: Paid</p>
                    </div>
                </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '15px', textAlign: 'left', color: '#64748b' }}>Description</th>
                        <th style={{ padding: '15px', textAlign: 'right', color: '#64748b' }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '15px' }}>Legal Services - Case Fees</td>
                        <td style={{ padding: '15px', textAlign: 'right' }}>৳{invoice.amount}</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td style={{ padding: '15px', fontWeight: 'bold', textAlign: 'right' }}>Total</td>
                        <td style={{ padding: '15px', fontWeight: 'bold', textAlign: 'right', fontSize: '1.2rem', color: '#1e293b' }}>
                            ৳{invoice.amount}
                        </td>
                    </tr>
                </tfoot>
            </table>

            <div style={{ marginTop: '60px', borderTop: '1px solid #e2e8f0', paddingTop: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                <p>Thank you for using AinAdvocate.</p>
                <p>This is a computer-generated invoice and does not require a signature.</p>
            </div>

            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #invoice-content, #invoice-content * {
                        visibility: visible;
                    }
                    #invoice-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default InvoicePDF;
