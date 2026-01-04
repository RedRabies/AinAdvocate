import axios from 'axios';

const API_URL = 'http://localhost:5000/api/reviews';

const authHeader = () => {
    const token = sessionStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const createReview = async (reviewData) => {
    const response = await axios.post(API_URL, reviewData, authHeader());
    return response.data;
};

export const getLawyerReviews = async (lawyerId) => {
    const response = await axios.get(`${API_URL}/lawyer/${lawyerId}`, authHeader());
    return response.data;
};

export const getAllReviews = async () => {
    const response = await axios.get(`${API_URL}/admin/all`, authHeader());
    return response.data;
};
