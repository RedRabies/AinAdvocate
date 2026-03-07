import React from 'react';
import { downloadReport } from '../../services/admin.service';

const Reports = () => {
    return (
        <div style={{ maxWidth: '800px' }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ marginTop: 0 }}>Export Data Reports</h3>
                <p style={{ color: '#64748b', marginBottom: '30px' }}>Generate and download CSV reports for system audit.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                        <div>
                            <h4 style={{ margin: 0 }}>All Cases Report</h4>
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Includes status, category, urgency, and dates.</p>
                        </div>
                        <button onClick={() => downloadReport('cases')} className="btn btn-primary">Download CSV</button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                        <div>
                            <h4 style={{ margin: 0 }}>Payments Report</h4>
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Transaction history and revenue (Coming Soon)</p>
                        </div>
                        <button onClick={() => downloadReport('payments')} className="btn btn-primary">Download CSV</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
