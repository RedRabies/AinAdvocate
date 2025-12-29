import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCase } from '../../services/case.service';
import '../../styles/pages/auth.css'; // Reusing auth layout for form centering
import '../../styles/components/form.css';
import '../../styles/components/button.css';
import { useToast } from '../../components/common/Toast';

const CreateCase = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        urgency: 'MEDIUM',
        description: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createCase(formData);
            addToast('Case request submitted successfully!', 'success');
            navigate('/cases/my');
        } catch (err) {
            console.error(err);
            addToast(err.response?.data?.message || 'Failed to submit case', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2 className="page-title">Request Legal Assistance</h2>
            <p style={{ color: '#64748b', marginBottom: '30px' }}>
                Fill out the form below to submit a new case. Our lawyers will review it shortly.
            </p>

            <div className="card" style={{ padding: '30px' }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Case Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="form-input"
                            placeholder="Brief summary of issue (e.g., Property Dispute in Dhaka)"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="form-select"
                            >
                                <option value="">Select Category</option>
                                <option value="Family Law">Family Law</option>
                                <option value="Criminal Law">Criminal Law</option>
                                <option value="Property Law">Property Law</option>
                                <option value="Corporate Law">Corporate Law</option>
                                <option value="Civil Litigation">Civil Litigation</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Urgency Level</label>
                            <select
                                name="urgency"
                                value={formData.urgency}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="LOW">Low - General Inquiry</option>
                                <option value="MEDIUM">Medium - Needs Attention</option>
                                <option value="HIGH">High - Immediate Action</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Detailed Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            className="form-input"
                            rows="6"
                            placeholder="Please describe your situation in detail..."
                            style={{ resize: 'vertical' }}
                        ></textarea>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                        <button type="button" onClick={() => navigate('/client-dashboard')} className="btn btn-secondary">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCase;
