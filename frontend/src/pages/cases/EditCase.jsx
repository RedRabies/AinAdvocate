import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCaseById, updateCase } from '../../services/case.service';
import '../../styles/components/form.css';
import '../../styles/components/button.css';
import { useToast } from '../../components/common/Toast';

const EditCase = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        urgency: 'MEDIUM',
        description: ''
    });

    useEffect(() => {
        loadCase();
    }, [id]);

    const loadCase = async () => {
        try {
            const data = await getCaseById(id);
            if (data.status !== 'PENDING') {
                addToast('Only pending cases can be edited', 'error');
                navigate(`/cases/${id}`);
                return;
            }
            setFormData({
                title: data.title,
                category: data.category,
                urgency: data.urgency,
                description: data.description
            });
            setLoading(false);
        } catch (err) {
            addToast('Failed to load case data', 'error');
            navigate('/cases/my');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await updateCase(id, formData);
            addToast('Case updated successfully!', 'success');
            navigate(`/cases/${id}`);
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to update case', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="container" style={{ padding: '40px' }}>Loading...</div>;

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
            <div className="card" style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Edit Case Request</h2>
                    <p style={{ margin: 0, color: '#64748b' }}>Update the details of your legal request.</p>
                </div>

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
                            placeholder="E.g., Property Dispute in Mirpur"
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
                                <option value="Criminal Defense">Criminal Defense</option>
                                <option value="Property Dispute">Property Dispute</option>
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
                                <option value="LOW">Low - No immediate deadline</option>
                                <option value="MEDIUM">Medium - Standard priority</option>
                                <option value="HIGH">High - Immediate attention needed</option>
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
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                        <button type="submit" disabled={submitting} className="btn btn-primary" style={{ flex: 1 }}>
                            {submitting ? 'Updating...' : 'Save Changes'}
                        </button>
                        <button type="button" onClick={() => navigate(`/cases/${id}`)} className="btn btn-secondary">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCase;
