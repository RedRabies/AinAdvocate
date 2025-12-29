import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/cases';

const getHeaders = () => {
    const token = sessionStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const createCase = async (caseData) => {
    const res = await axios.post(API_BASE, caseData, { headers: getHeaders() });
    return res.data;
};

export const getMyCases = async () => {
    const res = await axios.get(`${API_BASE}/my`, { headers: getHeaders() });
    return res.data;
};

export const getCaseById = async (id) => {
    const res = await axios.get(`${API_BASE}/${id}`, { headers: getHeaders() });
    return res.data;
};

export const updateCase = async (id, data) => {
    const res = await axios.put(`${API_BASE}/${id}`, data, { headers: getHeaders() });
    return res.data;
};

export const cancelCase = async (id) => {
    const res = await axios.delete(`${API_BASE}/${id}`, { headers: getHeaders() });
    return res.data;
};

// Lawyer View
export const getAssignedCases = async () => {
    const res = await axios.get(`${API_BASE}/assigned`, { headers: getHeaders() });
    return res.data;
};

// Lawyer Action
export const addCaseNote = async (id, noteText) => {
    const res = await axios.post(`${API_BASE}/${id}/notes`, { noteText }, { headers: getHeaders() });
    return res.data;
};
