import React, { useState, useEffect } from 'react';
import { getAllResources, createResource } from '../../services/resource.service';
import ResourceCard from '../../components/resource/ResourceCard';
import { useToast } from '../../components/common/Toast';
import '../../styles/pages/resources.css';
import '../../styles/components/button.css';
import '../../styles/components/form.css';

const ResourceList = () => {
    const [resources, setResources] = useState([]);
    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    const [showAdd, setShowAdd] = useState(false);
    const [newResource, setNewResource] = useState({ title: '', category: '', content: '' });
    const { addToast } = useToast();

    useEffect(() => {
        loadResources();
    }, []);

    const loadResources = async () => {
        const data = await getAllResources();
        setResources(data);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await createResource(newResource);
            addToast('Resource added', 'success');
            setShowAdd(false);
            setNewResource({ title: '', category: '', content: '' });
            loadResources();
        } catch (err) {
            addToast('Failed to add resource', 'error');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="resource-header">
                <h2>Legal Library</h2>
                {user?.role === 'admin' && (
                    <button
                        onClick={() => setShowAdd(!showAdd)}
                        className="btn btn-primary"
                    >
                        {showAdd ? 'Cancel' : '+ Add Resource'}
                    </button>
                )}
            </div>

            {showAdd && (
                <div className="card" style={{ marginBottom: '30px' }}>
                    <h3 className="card-title">Add New Resource</h3>
                    <form onSubmit={handleAdd}>
                        <div className="form-group">
                            <input placeholder="Title" value={newResource.title} onChange={e => setNewResource({ ...newResource, title: e.target.value })} required className="form-input" />
                        </div>
                        <div className="form-group">
                            <input placeholder="Category" value={newResource.category} onChange={e => setNewResource({ ...newResource, category: e.target.value })} required className="form-input" />
                        </div>
                        <div className="form-group">
                            <textarea placeholder="Content" value={newResource.content} onChange={e => setNewResource({ ...newResource, content: e.target.value })} required className="form-textarea" rows="3" />
                        </div>
                        <button type="submit" className="btn btn-primary">Save Resource</button>
                    </form>
                </div>
            )}

            <div className="resource-grid">
                {resources.map(res => (
                    <ResourceCard key={res._id} resource={res} />
                ))}
            </div>
        </div>
    );
};

export default ResourceList;
