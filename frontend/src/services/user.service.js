const API_BASE = '/api/auth/me';

const getHeaders = () => {
    const token = sessionStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

export async function getMyProfile() {
    const res = await fetch(API_BASE, {
        headers: getHeaders()
    });
    return res.json();
}

export async function updateMyProfile(data) {
    const res = await fetch(API_BASE, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return res.json();
}
