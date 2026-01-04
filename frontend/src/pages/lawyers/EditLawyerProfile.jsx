import React, { useState, useEffect } from 'react';
import { getMyProfile, createOrUpdateProfile } from '../../services/lawyer.service';
import { useToast } from '../../components/common/Toast';
import '../../styles/components/form.css';
import '../../styles/components/button.css';
import '../../styles/components/card.css';

const EditLawyerProfile = () => {
    const [formData, setFormData] = useState({
        bio: '',
        experienceYears: 0,
        location: '',
        licenseNumber: '',
        categories: [], // Array for checkboxes
        specialization: '', // Comma separated for input
        languages: '' // Comma separated for input
    });
    const { addToast } = useToast();

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await getMyProfile();
            if (data) {
                setFormData({
                    bio: data.bio || '',
                    experienceYears: data.experienceYears || 0,
                    location: data.location || '',
                    licenseNumber: data.licenseNumber || '',
                    categories: data.categories || [],
                    specialization: data.specialization ? data.specialization.join(', ') : '',
                    languages: data.languages ? data.languages.join(', ') : ''
                });
            }
        } catch (e) {
            // Profile might not exist yet
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            categories: formData.categories,
            specialization: formData.specialization.split(',').map(s => s.trim()).filter(Boolean),
            languages: formData.languages.split(',').map(s => s.trim()).filter(Boolean)
        };
        try {
            await createOrUpdateProfile(payload);
            addToast('Professional profile updated!', 'success');
        } catch (err) {
            addToast('Error saving profile', 'error');
        }
    };

    return (
        <div className="container" style={{ padding: '40px 0' }}>
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h2 className="card-title">Professional Profile</h2>
                <p className="card-subtitle" style={{ marginBottom: '20px' }}>Update your lawyer credentials and public information.</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">License Number</label>
                        <input
                            value={formData.licenseNumber}
                            onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
                            required
                            className="form-input"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                            <label className="form-label">Location</label>
                            <input
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Experience (Years)</label>
                            <input
                                type="number"
                                value={formData.experienceYears}
                                onChange={e => setFormData({ ...formData, experienceYears: e.target.value })}
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Practice Categories (for Case Matching)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                            {['Family Law', 'Criminal Law', 'Property Law', 'Corporate Law', 'Civil Litigation', 'Other'].map(cat => (
                                <label key={cat} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.categories.includes(cat)}
                                        onChange={e => {
                                            const newCats = e.target.checked
                                                ? [...formData.categories, cat]
                                                : formData.categories.filter(c => c !== cat);
                                            setFormData({ ...formData, categories: newCats });
                                        }}
                                    />
                                    {cat}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Removed Additional Specialization Input as per user request to use Categories as Specialization */}

                    <div className="form-group">
                        <label className="form-label">Languages (comma separated)</label>
                        <input
                            value={formData.languages}
                            onChange={e => setFormData({ ...formData, languages: e.target.value })}
                            placeholder="e.g. English, Bengali"
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Bio</label>
                        <textarea
                            value={formData.bio}
                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                            rows="4"
                            className="form-textarea"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary">
                        Save Professional Profile
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditLawyerProfile;
