import axios from 'axios';

const API_URL = 'http://localhost:5000/api/notifications';

const authHeader = () => {
    const token = sessionStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const getNotifications = async () => {
    const response = await axios.get(API_URL, authHeader());
    return response.data;
};

export const markAsRead = async (id) => {
    const response = await axios.put(`${API_URL}/${id}/read`, {}, authHeader());
    return response.data;
};

export const markAllAsRead = async () => {
    const response = await axios.put(`${API_URL}/read-all`, {}, authHeader());
    return response.data;
};
