import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/lawyers';

const getHeaders = () => {
    const token = sessionStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const createOrUpdateProfile = async (data) => {
    const res = await axios.post(`${API_BASE}/profile`, data, { headers: getHeaders() });
    return res.data;
};

export const getMyProfile = async () => {
    const res = await axios.get(`${API_BASE}/profile/me`, { headers: getHeaders() });
    return res.data;
};

export const getAllLawyers = async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const res = await axios.get(`${API_BASE}?${query}`);
    return res.data;
};

export const getLawyerById = async (id) => {
    const res = await axios.get(`${API_BASE}/${id}`);
    return res.data;
};

// Admin: verify
export const verifyLawyer = async (id) => {
    const res = await axios.put(`${API_BASE}/${id}/verify`, {}, { headers: getHeaders() });
    return res.data;
};

// Admin: get all (including unverified)
export const getAllLawyersAdmin = async () => {
    const res = await axios.get(`${API_BASE}/admin/list`, { headers: getHeaders() });
    return res.data;
};

export const getMyClients = async () => {
    const res = await axios.get(`${API_BASE}/my-clients`, { headers: getHeaders() });
    return res.data;
};
