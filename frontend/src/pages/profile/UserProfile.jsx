import React, { useState, useEffect } from 'react';
import { getMyProfile, updateMyProfile } from '../../services/user.service';
import { useToast } from '../../components/common/Toast';
import '../../styles/components/form.css';
import '../../styles/components/button.css';
import '../../styles/components/card.css';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const { addToast } = useToast();

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const data = await getMyProfile();
        setUser(data);
        setFormData({ name: data.name, phone: data.phone || '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await updateMyProfile(formData);
            if (res.user) {
                setUser({ ...user, ...formData });
                setIsEditing(false);
                addToast('Profile updated successfully!', 'success');
                // Update local storage user data if needed
                localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user')), ...res.user }));
            }
        } catch (err) {
            addToast('Failed to update profile', 'error');
        }
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="container" style={{ padding: '40px 0' }}>
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h2 className="card-title" style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>My Profile</h2>

                {!isEditing ? (
                    <div>
                        <div style={{ marginBottom: '15px' }}>
                            <label className="form-label">Name</label>
                            <p>{user.name}</p>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label className="form-label">Email</label>
                            <p>{user.email}</p>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label className="form-label">Phone</label>
                            <p>{user.phone || 'Not set'}</p>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label className="form-label">Role</label>
                            <p>{user.role}</p>
                        </div>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="btn btn-primary"
                            style={{ marginTop: '10px' }}
                        >
                            Edit Profile
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Name</label>
                            <input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone</label>
                            <input
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                className="form-input"
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button type="submit" className="btn btn-primary">Save Changes</button>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
