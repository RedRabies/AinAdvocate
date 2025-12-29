import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/pages/dashboard.css';
import '../../styles/components/button.css';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useToast } from '../../components/common/Toast';

const ClientDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(sessionStorage.getItem('user') || '{}'));
    const [isUploading, setIsUploading] = useState(false);
    const { addToast } = useToast();

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({});

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        navigate('/login');
    };

    const confirmAction = (action, title, message) => {
        setModalConfig({ onConfirm: action, title, message });
        setModalOpen(true);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setIsUploading(true);
        try {
            const token = sessionStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/auth/upload-profile-image', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Update user in storage
            const updatedUser = { ...user, profileImage: res.data.profileImage };
            sessionStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            addToast('Profile picture updated!', 'success');
        } catch (err) {
            console.error(err);
            addToast('Failed to upload image', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    // Edit Profile State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: user.name || '', phone: user.phone || '', address: user.address || '', bio: user.bio || '' });

    const handleEditChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = sessionStorage.getItem('token');
            const res = await axios.put('http://localhost:5000/api/auth/me', formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Update session and state
            const updatedUser = { ...user, ...res.data.user };
            sessionStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setEditModalOpen(false);
            addToast('Profile updated successfully', 'success');
        } catch (err) {
            addToast(err.response?.data?.message || 'Update failed', 'error');
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2>Client Dashboard</h2>
                </div>
                <button onClick={() => confirmAction(handleLogout, 'Logout', 'Are you sure you want to logout?')} className="btn btn-danger">Logout</button>
            </header>
            <div className="dashboard-welcome">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ position: 'relative', width: '80px', height: '80px', marginRight: '20px' }}>
                        <img
                            src={user.profileImage ? `http://localhost:5000${user.profileImage}` : 'https://via.placeholder.com/150'}
                            alt="Profile"
                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid #3b82f6' }}
                        />
                        <label htmlFor="file-upload" style={{
                            position: 'absolute', bottom: 0, right: 0, background: '#3b82f6', color: 'white',
                            borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', cursor: 'pointer', fontSize: '14px'
                        }}>
                            +
                        </label>
                        <input id="file-upload" type="file" style={{ display: 'none' }} onChange={handleFileChange} accept=".jpg,.jpeg,.png,.gif" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0 }}>Welcome, {user.name}!</h3>
                        <p style={{ margin: 0, color: '#64748b' }}>Client Portal</p>
                        {user.profileImage && (
                            <button
                                onClick={async () => {
                                    try {
                                        const token = sessionStorage.getItem('token');
                                        await axios.delete('http://localhost:5000/api/auth/profile-image', {
                                            headers: { 'Authorization': `Bearer ${token}` }
                                        });
                                        const updatedUser = { ...user, profileImage: undefined };
                                        sessionStorage.setItem('user', JSON.stringify(updatedUser));
                                        setUser(updatedUser);
                                        addToast('Profile picture removed', 'info');
                                    } catch (err) {
                                        console.error(err);
                                        addToast('Failed to remove image', 'error');
                                    }
                                }}
                                style={{ marginTop: '5px', fontSize: '0.8rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                            >
                                Remove Photo
                            </button>
                        )}
                        <button onClick={() => setEditModalOpen(true)} className="btn btn-sm btn-secondary" style={{ marginTop: '10px' }}>
                            Edit Profile
                        </button>
                        {user.phone && <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>📞 {user.phone}</div>}
                    </div>
                </div>

                <div className="profile-details-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>About Me</h4>
                    <p style={{ color: '#4b5563', fontSize: '0.95rem', lineHeight: '1.5' }}>
                        {user.bio || 'No bio added yet.'}
                    </p>
                    <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#6b7280' }}>
                        <strong>Address:</strong> {user.address || 'Not set'}
                    </div>
                </div>

                <p>Find lawyers and manage cases.</p>
                <div className="action-bar">
                    <button onClick={() => navigate('/cases/create')} className="btn btn-primary">Request Legal Assistance</button>
                    <button onClick={() => navigate('/cases/my')} className="btn btn-outline-primary" style={{ background: 'white' }}>My Case History</button>
                    <button onClick={() => navigate('/lawyers')} className="btn btn-secondary">Find a Lawyer</button>
                    <button onClick={() => navigate('/resources')} className="btn btn-secondary">Legal Resources</button>
                </div>
            </div>

            <ConfirmationModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
            />

            {/* Edit Profile Modal (Inline for simplicity) */}
            {editModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 2000
                }}>
                    <div style={{
                        background: 'white', padding: '30px', borderRadius: '16px',
                        width: '90%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ marginTop: 0 }}>Edit Profile</h3>
                        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleEditChange}
                                    className="form-input"
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleEditChange}
                                    className="form-input"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleEditChange}
                                    className="form-input"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleEditChange}
                                    className="form-input"
                                    rows="3"
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                                <button type="button" onClick={() => setEditModalOpen(false)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div >
    );
};

export default ClientDashboard;
