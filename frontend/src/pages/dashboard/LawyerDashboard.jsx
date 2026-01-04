import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/pages/dashboard.css';
import '../../styles/components/button.css';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useToast } from '../../components/common/Toast';

const LawyerDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(sessionStorage.getItem('user') || '{}'));
    const [isUploading, setIsUploading] = useState(false);
    const { addToast } = useToast();
    const [lawyerProfile, setLawyerProfile] = useState(null);


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

    React.useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/lawyers/profile/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLawyerProfile(res.data);
            } catch (err) {
                console.error("Failed to fetch lawyer profile", err);
            }
        };
        fetchProfile();
    }, []);


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

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2>Lawyer Dashboard</h2>
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
                        <h3 style={{ margin: 0 }}>Welcome, Advocate {user.name}!</h3>
                        <p style={{ margin: 0, color: '#64748b' }}>Partner Portal</p>
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

                    </div>
                </div>

                {/* Verification Status Card */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>Professional Verification</h4>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                            {lawyerProfile?.isVerified
                                ? "Your profile is verified. You are a trusted partner."
                                : "Your profile is currently under review by the administration."}
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{
                            background: lawyerProfile?.isVerified ? '#dcfce7' : '#fffbeb',
                            color: lawyerProfile?.isVerified ? '#16a34a' : '#b45309',
                            padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', display: 'inline-block', marginBottom: '4px'
                        }}>
                            {lawyerProfile?.isVerified ? "Verified" : "Pending Verification"}
                        </div>
                        {lawyerProfile?.isVerified && lawyerProfile?.licenseNumber && (
                            <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '500' }}>
                                License: {lawyerProfile.licenseNumber}
                            </div>
                        )}
                    </div>
                </div>


                <p>Manage your cases and client requests here.</p>
                <div className="action-bar">
                    <button onClick={() => navigate('/lawyer/inbox')} className="btn btn-primary">Browse New Cases</button>
                    <button onClick={() => navigate('/lawyer/cases')} className="btn btn-outline-primary" style={{ background: 'white' }}>My Active Cases</button>
                    <button onClick={() => navigate('/clients')} className="btn btn-secondary">My Clients</button>
                    <button onClick={() => navigate('/lawyers/edit')} className="btn btn-secondary">Edit Profile</button>
                    <button onClick={() => navigate('/resources/new')} className="btn btn-secondary">Share Resource</button>
                </div>
            </div>

            <ConfirmationModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
            />
        </div >
    );
};

export default LawyerDashboard;
