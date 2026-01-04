import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin';

const authHeader = () => {
    const token = sessionStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const getAnalytics = async () => {
    const response = await axios.get(`${API_URL}/analytics`, authHeader());
    return response.data;
};

export const forceCloseCase = async (id) => {
    const response = await axios.put(`${API_URL}/cases/${id}/close`, {}, authHeader());
    return response.data;
};

export const suspendUser = async (id, type) => {
    const response = await axios.put(`${API_URL}/users/${id}/suspend`, { type }, authHeader());
    return response.data;
};

export const downloadReport = async (type) => {
    const response = await axios.get(`${API_URL}/reports?type=${type}`, {
        ...authHeader(),
        responseType: 'blob', // Important for file download
    });

    // Trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${type}-report.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
};

export const getAllCasesAdmin = async () => {
    const response = await axios.get(`http://localhost:5000/api/cases/admin/all`, authHeader());
    return response.data;
};
