import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllLawyersAdmin, verifyLawyer } from '../../services/lawyer.service';
import { getAllResources, createResource } from '../../services/resource.service';
import axios from 'axios';
import '../../styles/pages/dashboard.css';
import '../../styles/components/button.css';
import { useToast } from '../../components/common/Toast';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Analytics from '../../pages/admin/Analytics';
import Reports from '../../pages/admin/Reports';
import { getAllCasesAdmin, forceCloseCase } from '../../services/admin.service';

const AdminDashboard = () => {
    const [view, setView] = useState('analytics'); // analytics, clients, lawyers, resources, financials
    const [stats, setStats] = useState({ clients: 0, lawyers: 0, pending: 0, resources: 0, earnings: 0, volume: 0 });
    const [clients, setClients] = useState([]);
    const [cases, setCases] = useState([]);
    const [lawyers, setLawyers] = useState([]);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { addToast } = useToast();

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({});
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedLawyer, setSelectedLawyer] = useState(null);
    const [resourceModalOpen, setResourceModalOpen] = useState(false); // New state for Resource Modal

    useEffect(() => {
        loadData();
    }, []);

    const authHeader = () => {
        const token = sessionStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const confirmAction = (action, title, message) => {
        setModalConfig({ onConfirm: action, title, message });
        setModalOpen(true);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        navigate('/login');
    };

    const loadData = async () => {
        try {
            // Fetch Clients
            const usersRes = await axios.get('http://localhost:5000/api/auth/users', authHeader());
            const allUsers = usersRes.data;
            const clientList = allUsers.filter(u => (u.role && u.role.toLowerCase() === 'client'));
            setClients(clientList);

            // Fetch Lawyers
            const lawyerProfiles = await getAllLawyersAdmin();
            setLawyers(lawyerProfiles);

            // Fetch Cases
            const caseList = await getAllCasesAdmin();
            setCases(caseList);

            // Fetch Resources
            const resourceList = await getAllResources();
            setResources(resourceList);

            // Fetch Earnings
            const earningsRes = await axios.get('http://localhost:5000/api/admin/earnings', authHeader());

            setStats({
                clients: clientList.length,
                lawyers: lawyerProfiles.length,
                pending: lawyerProfiles.filter(l => !l.isVerified).length,
                resources: resourceList.length,
                earnings: earningsRes.data.totalEarnings,
                volume: earningsRes.data.totalVolume
            });
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    // --- Actions ---

    const [verificationState, setVerificationState] = useState({ open: false, id: null, licenseNumber: '' });

    const handleVerifyClick = (id) => {
        setVerificationState({ open: true, id, licenseNumber: '' });
    };

    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        const { id, licenseNumber } = verificationState;

        if (id && licenseNumber) {
            try {
                // Pass licenseNumber in the body
                await axios.put(`http://localhost:5000/api/lawyers/${id}/verify`, { licenseNumber }, authHeader());
                addToast("Lawyer verified successfully", 'success');
                setVerificationState({ open: false, id: null, licenseNumber: '' });
                loadData();
            } catch (err) {
                addToast('Error verifying: ' + (err.response?.data?.message || err.message), 'error');
            }
        }
    };

    const handleForceClose = async (id) => {
        try {
            await forceCloseCase(id);
            addToast('Case closed successfully', 'success');
            loadData();
        } catch (err) {
            addToast('Error closing case: ' + (err.response?.data?.message || err.message), 'error');
        }
    };

    const executeBan = async (id, type) => {
        try {
            await axios.put(`http://localhost:5000/api/auth/admin/${type}/${id}/ban`, {}, authHeader());
            loadData();
            addToast(`User ${type} ban status updated`, 'success');
        } catch (err) {
            addToast('Error banning user', 'error');
        }
    };

    const executeDelete = async (id, type) => {
        try {
            await axios.delete(`http://localhost:5000/api/auth/admin/${type}/${id}`, authHeader());
            loadData();
            addToast('User deleted', 'info');
        } catch (err) {
            addToast('Error deleting user', 'error');
        }
    };

    const executeDeleteResource = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/resources/${id}`, authHeader());
            loadData();
            addToast('Resource deleted', 'info');
        } catch (err) {
            addToast('Error deleting resource', 'error');
        }
    };

    const handleCreateResource = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            await createResource(data);
            addToast('Resource created successfully', 'success');
            setResourceModalOpen(false);
            loadData();
        } catch (err) {
            addToast('Failed to create resource', 'error');
            console.error(err);
        }
    };

    if (loading) return <div className="container" style={{ padding: '40px' }}>Loading...</div>;

    // --- Sub Components ---

    const StatCard = ({ count, label, icon, color, bgColor }) => (
        <div className="stat-card" style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            border: 'none',
            transition: 'transform 0.2s',
            cursor: 'default'
        }}>
            <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                background: bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '20px',
                color: color,
                flexShrink: 0
            }}>
                {icon}
            </div>
            <div>
                <h3 style={{ fontSize: '2rem', marginBottom: '4px', color: '#1e293b', fontWeight: '700' }}>{count}</h3>
                <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500', margin: 0 }}>{label}</p>
            </div>
        </div>
    );

    // Icons
    const Icons = {
        Clients: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
        Lawyers: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>, // Briefcase-ish
        Pending: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
        Resources: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
    };

    const Overview = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            <StatCard
                count={stats.clients}
                label="Total Clients"
                icon={Icons.Clients}
                color="#3b82f6"
                bgColor="#eff6ff"
            />
            <StatCard
                count={stats.lawyers}
                label="Total Lawyers"
                icon={Icons.Lawyers}
                color="#8b5cf6"
                bgColor="#f5f3ff"
            />
            <StatCard
                count={stats.pending}
                label="Pending Verification"
                icon={Icons.Pending}
                color="#f59e0b"
                bgColor="#fffbeb"
            />
            <StatCard
                count={stats.resources}
                label="Resources"
                icon={Icons.Resources}
                color="#10b981"
                bgColor="#ecfdf5"
            />
            <StatCard
                count={`৳${stats.earnings}`}
                label="Total Earnings"
                icon={<span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>৳</span>}
                color="#059669"
                bgColor="#d1fae5"
            />
        </div>
    );

    const ClientTable = () => (
        <div className="card" style={{ padding: '0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: 'none' }}>
            <h3 style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', margin: 0, color: '#1e293b' }}>Registered Clients</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8fafc', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <tr>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600' }}>Name</th>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600' }}>Email</th>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600' }}>Status</th>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600' }}>Actions</th>
                    </tr>
                </thead>
                <tbody style={{ fontSize: '0.95rem', color: '#334155' }}>
                    {clients.map(client => (
                        <tr key={client._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '16px 20px' }}>{client.name}</td>
                            <td style={{ padding: '16px 20px' }}>{client.email}</td>
                            <td style={{ padding: '16px 20px' }}>
                                {client.isBanned ?
                                    <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>Banned</span> :
                                    <span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>Active</span>}
                            </td>
                            <td style={{ padding: '16px 20px' }}>
                                <button onClick={() => confirmAction(() => executeBan(client._id, 'client'), 'Confirm Action', `Are you sure you want to ${client.isBanned ? 'unban' : 'ban'} this client?`)} className="btn btn-sm" style={{ marginRight: '10px', background: client.isBanned ? '#cbd5e1' : '#f59e0b', color: 'white', border: 'none' }}>
                                    {client.isBanned ? 'Unban' : 'Ban'}
                                </button>
                                <button onClick={() => confirmAction(() => executeDelete(client._id, 'client'), 'Delete Client', 'Are you sure you want to delete this client? This cannot be undone.')} className="btn btn-sm btn-danger" style={{ border: 'none' }}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const LawyerTable = () => (
        <div className="card" style={{ padding: '0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: 'none' }}>
            <h3 style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', margin: 0, color: '#1e293b' }}>Lawyer Management</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8fafc', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <tr>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600' }}>Name</th>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600' }}>License</th>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600' }}>Verification</th>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600' }}>Status</th>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600' }}>Actions</th>
                    </tr>
                </thead>
                <tbody style={{ fontSize: '0.95rem', color: '#334155' }}>
                    {lawyers.map(lawyer => (
                        <tr key={lawyer._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '16px 20px' }}>
                                <div style={{ fontWeight: '600' }}>{lawyer.name || 'Unknown'}</div>
                                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{lawyer.email}</div>
                            </td>
                            <td style={{ padding: '16px 20px' }}>{lawyer.licenseNumber}</td>
                            <td style={{ padding: '16px 20px' }}>
                                {lawyer.isVerified ?
                                    <span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>Verified</span> :
                                    <span style={{ background: '#ffedd5', color: '#c2410c', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>Pending</span>
                                }
                            </td>
                            <td style={{ padding: '16px 20px' }}>
                                {lawyer.isBanned ?
                                    <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>Banned</span> :
                                    <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>Active</span>}
                            </td>
                            <td style={{ padding: '16px 20px', display: 'flex', gap: '8px' }}>
                                <button onClick={() => { setSelectedLawyer(lawyer); setDetailModalOpen(true); }} className="btn btn-sm btn-outline-primary" style={{ border: 'none', background: '#e0f2fe', color: '#0284c7' }}>View</button>
                                {!lawyer.isVerified && (
                                    <button onClick={() => handleVerifyClick(lawyer._id)} className="btn btn-sm btn-primary" style={{ border: 'none' }}>Verify</button>
                                )}
                                <button onClick={() => confirmAction(() => executeBan(lawyer._id, 'lawyer'), 'Confirm Action', `Are you sure you want to ${lawyer.isBanned ? 'unban' : 'ban'} this lawyer?`)} className="btn btn-sm" style={{ background: lawyer.isBanned ? '#cbd5e1' : '#f59e0b', color: 'white', border: 'none' }}>
                                    {lawyer.isBanned ? 'Unban' : 'Ban'}
                                </button>
                                <button onClick={() => confirmAction(() => executeDelete(lawyer._id, 'lawyer'), 'Delete Lawyer', 'Are you sure you want to delete this lawyer?')} className="btn btn-sm btn-danger" style={{ border: 'none' }}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const ResourceTable = () => (
        <div className="card" style={{ padding: '0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #f1f5f9' }}>
                <h3 style={{ margin: 0, color: '#1e293b' }}>Resource Library</h3>
                <button onClick={() => setResourceModalOpen(true)} className="btn btn-sm btn-primary" style={{ border: 'none' }}>Add New</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8fafc', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <tr>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600' }}>Title</th>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600' }}>Category</th>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600' }}>Actions</th>
                    </tr>
                </thead>
                <tbody style={{ fontSize: '0.95rem', color: '#334155' }}>
                    {resources.map(res => (
                        <tr key={res._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '16px 20px', fontWeight: '500' }}>{res.title}</td>
                            <td style={{ padding: '16px 20px' }}>
                                <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                                    {res.category}
                                </span>
                            </td>
                            <td style={{ padding: '16px 20px' }}>
                                <button onClick={() => confirmAction(() => executeDeleteResource(res._id), 'Delete Resource', 'Are you sure you want to delete this resource?')} className="btn btn-sm btn-danger" style={{ border: 'none' }}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const CaseTable = () => (
        <div className="card" style={{ padding: '0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: 'none' }}>
            <h3 style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', margin: 0, color: '#1e293b' }}>Case Management</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8fafc', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <tr>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600' }}>Title</th>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600' }}>Client</th>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600' }}>Lawyer</th>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600' }}>Status</th>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600' }}>Actions</th>
                    </tr>
                </thead>
                <tbody style={{ fontSize: '0.95rem', color: '#334155' }}>
                    {cases.map(c => (
                        <tr key={c._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '16px 20px', fontWeight: '500' }}>{c.title}</td>
                            <td style={{ padding: '16px 20px' }}>{c.clientId?.name || 'N/A'}</td>
                            <td style={{ padding: '16px 20px' }}>{c.assignedLawyerId?.name || 'Unassigned'}</td>
                            <td style={{ padding: '16px 20px' }}>
                                <span style={{
                                    padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
                                    background: c.status === 'CLOSED' ? '#e2e8f0' : '#dbeafe',
                                    color: c.status === 'CLOSED' ? '#64748b' : '#1e40af'
                                }}>
                                    {c.status}
                                </span>
                            </td>
                            <td style={{ padding: '16px 20px' }}>
                                {c.status !== 'CLOSED' && (
                                    <button onClick={() => confirmAction(() => handleForceClose(c._id), 'Force Close Case', 'Are you sure you want to force close this case? This action cannot be undone.')} className="btn btn-sm btn-danger" style={{ border: 'none' }}>
                                        Force Close
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const FinancialsTable = () => (
        <div style={{ display: 'grid', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <StatCard
                    count={`৳${stats.earnings}`}
                    label="Net Platform Earnings (30%)"
                    icon={<span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>৳</span>}
                    color="#059669"
                    bgColor="#d1fae5"
                />
                <StatCard
                    count={`৳${stats.volume}`}
                    label="Total Transaction Volume"
                    icon={<span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>৳</span>}
                    color="#3b82f6"
                    bgColor="#dbeafe"
                />
            </div>
            <div className="card" style={{ padding: '30px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <h3>Financial Overview</h3>
                <p style={{ color: '#64748b' }}>
                    A detailed breakdown of transactions and earnings will be available here. Currently showing aggregated totals.
                </p>
                {/* Future: Add list of specific transactions/payments here */}
            </div>
        </div>
    );

    // Sidebar & Layout Styles
    const sidebarStyle = { width: '260px', background: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, boxShadow: '4px 0 10px rgba(0,0,0,0.1)', zIndex: 10 };
    const menuItemStyle = (isActive) => ({ padding: '16px 24px', cursor: 'pointer', background: isActive ? 'linear-gradient(90deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0) 100%)' : 'transparent', color: isActive ? '#3b82f6' : '#94a3b8', fontWeight: isActive ? '600' : '500', borderLeft: isActive ? '4px solid #3b82f6' : '4px solid transparent', transition: 'all 0.2s', display: 'flex', alignItems: 'center', fontSize: '0.95rem' });

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            <aside style={sidebarStyle}>
                <div style={{ padding: '30px 24px', fontSize: '1.5rem', fontWeight: '800', borderBottom: '1px solid #1e293b', color: 'white', letterSpacing: '-0.5px' }}>
                    User<span style={{ color: '#3b82f6' }}>Dashboard</span>
                </div>
                <nav style={{ marginTop: '20px' }}>
                    <div onClick={() => setView('analytics')} style={menuItemStyle(view === 'analytics')}> Analytics </div>
                    <div onClick={() => setView('reports')} style={menuItemStyle(view === 'reports')}> Reports </div>
                    <div onClick={() => setView('cases')} style={menuItemStyle(view === 'cases')}> Case Management </div>
                    <div onClick={() => setView('clients')} style={menuItemStyle(view === 'clients')}> Client Management </div>
                    <div onClick={() => setView('lawyers')} style={menuItemStyle(view === 'lawyers')}> Lawyer Management </div>
                    <div onClick={() => setView('resources')} style={menuItemStyle(view === 'resources')}> Resource Library </div>
                    <div onClick={() => setView('financials')} style={menuItemStyle(view === 'financials')}> Total Earnings </div>
                </nav>
                <div style={{ marginTop: 'auto', padding: '24px', borderTop: '1px solid #1e293b' }}>
                    <button onClick={handleLogout} className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', width: '100%', border: 'none', fontWeight: '600', padding: '12px' }}>
                        Sign Out
                    </button>
                </div>
            </aside>

            <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '8px' }}>
                            {view === 'analytics' && 'Advanced Analytics'}
                            {view === 'reports' && 'System Reports'}
                            {view === 'cases' && 'Case Management'}
                            {view === 'clients' && 'Client Management'}
                            {view === 'lawyers' && 'Lawyer Verification'}
                            {view === 'resources' && 'Resource Library'}
                            {view === 'financials' && 'Financial Overview'}
                        </h2>
                        <p style={{ color: '#64748b', margin: 0 }}>Welcome back, Admin</p>
                    </div>
                </header>

                {view === 'analytics' && <Analytics />}
                {view === 'reports' && <Reports />}
                {view === 'cases' && <CaseTable />}
                {view === 'clients' && <ClientTable />}
                {view === 'lawyers' && <LawyerTable />}
                {view === 'resources' && <ResourceTable />}
                {view === 'financials' && <FinancialsTable />}
            </main>

            <ConfirmationModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
            />

            {/* Lawyer Details Modal */}
            {detailModalOpen && selectedLawyer && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>Lawyer Details</h3>
                            <button onClick={() => setDetailModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>
                        <div style={{ display: 'grid', gap: '15px' }}>
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
                                    {selectedLawyer.name ? selectedLawyer.name.charAt(0) : 'L'}
                                </div>
                                <div>
                                    <h4 style={{ margin: 0 }}>{selectedLawyer.name}</h4>
                                    <p style={{ margin: '5px 0', color: '#64748b' }}>{selectedLawyer.email}</p>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <span style={{ fontSize: '0.85rem', padding: '4px 10px', background: selectedLawyer.isVerified ? '#dcfce7' : '#ffedd5', color: selectedLawyer.isVerified ? '#16a34a' : '#c2410c', borderRadius: '12px' }}>
                                            {selectedLawyer.isVerified ? 'Verified' : 'Unverified'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <strong>License Number:</strong> {selectedLawyer.licenseNumber || 'Not Assigned'}
                            </div>
                            <div>
                                <strong>Specialization:</strong> {selectedLawyer.specialization?.join(', ') || 'N/A'}
                            </div>
                            <div>
                                <strong>Experience:</strong> {selectedLawyer.experienceYears} Years
                            </div>
                            <div>
                                <strong>Location:</strong> {selectedLawyer.location || 'N/A'}
                            </div>
                            <div>
                                <strong>Languages:</strong> {selectedLawyer.languages?.join(', ') || 'N/A'}
                            </div>
                            <div>
                                <strong>Bio:</strong>
                                <p style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginTop: '5px' }}>
                                    {selectedLawyer.bio || 'No bio provided.'}
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                                {!selectedLawyer.isVerified && (
                                    <button onClick={() => { handleVerifyClick(selectedLawyer._id); setDetailModalOpen(false); }} className="btn btn-primary" style={{ flex: 1 }}>Verify & Assign License</button>
                                )}
                                <button onClick={() => setDetailModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Resource Creation Modal */}
            {resourceModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', maxWidth: '500px', width: '90%' }}>
                        <h3 style={{ marginTop: 0 }}>Add New Resource</h3>
                        <form onSubmit={handleCreateResource}>
                            <div className="form-group">
                                <label className="form-label">Title</label>
                                <input name="title" required className="form-input" placeholder="Resource Title" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select name="category" required className="form-select">
                                    <option value="">Select Category</option>
                                    <option value="Legal Guide">Legal Guide</option>
                                    <option value="Template">Template</option>
                                    <option value="Article">Article</option>
                                    <option value="News">News</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Content (Optional)</label>
                                <textarea name="content" className="form-input" rows="4" placeholder="Resource content..."></textarea>
                            </div>
                            <div className="form-group">
                                <label className="form-label">External URL (Optional)</label>
                                <input name="url" className="form-input" placeholder="https://..." />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Resource</button>
                                <button type="button" onClick={() => setResourceModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Verification Modal (Light Theme - Matching ConfirmationModal) */}
            {verificationState?.open && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1100
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '400px',
                        padding: '24px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        animation: 'fadeIn 0.2s ease-out'
                    }}>
                        <h3 style={{ marginTop: 0, fontSize: '1.25rem', color: '#1e293b' }}>Verify Lawyer</h3>
                        <p style={{ color: '#64748b', lineHeight: '1.5', margin: '12px 0 24px 0' }}>
                            Enter the official License Number to assign to this lawyer:
                        </p>

                        <form onSubmit={handleVerifySubmit}>
                            <div style={{ marginBottom: '25px' }}>
                                <input
                                    type="text"
                                    required
                                    className="form-input"
                                    style={{
                                        width: '100%',
                                        padding: '10px 15px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        color: '#334155'
                                    }}
                                    value={verificationState.licenseNumber}
                                    onChange={e => setVerificationState({ ...verificationState, licenseNumber: e.target.value })}
                                    placeholder="Enter license number..."
                                    autoFocus
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="button" onClick={() => setVerificationState({ open: false, id: null, licenseNumber: '' })} className="btn" style={{
                                    background: '#f1f5f9',
                                    color: '475569',
                                    fontWeight: '600',
                                    border: 'none',
                                    padding: '10px 24px',
                                    borderRadius: '6px'
                                }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{
                                    fontWeight: '600',
                                    border: 'none',
                                    padding: '10px 24px',
                                    borderRadius: '6px'
                                }}>Confirm & Verify</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

