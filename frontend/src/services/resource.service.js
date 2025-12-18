const API_BASE = '/api/resources';

const getHeaders = () => {
    const token = sessionStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

export async function getAllResources(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_BASE}?${query}`, {
        headers: getHeaders()
    });
    return res.json();
}

export async function getResourceById(id) {
    const res = await fetch(`${API_BASE}/${id}`, {
        headers: getHeaders()
    });
    return res.json();
}

// Admin Only
export async function createResource(data) {
    const res = await fetch(`${API_BASE}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return res.json();
}
