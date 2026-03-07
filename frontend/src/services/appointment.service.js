import axios from 'axios';

const API_URL = 'http://localhost:5000/api/appointments';

const requestAppointment = async (appointmentData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.post(API_URL, appointmentData, config);
    return response.data;
};

const getAppointments = async (token, caseId = null) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: caseId ? { caseId } : {}
    };
    const response = await axios.get(API_URL, config);
    return response.data;
};

const updateStatus = async (id, status, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.put(`${API_URL}/${id}/status`, { status }, config);
    return response.data;
};

const rescheduleAppointment = async (id, date, token) => {
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };
    // Re-using the updateStatus endpoint which now accepts date
    const response = await axios.put(`${API_URL}/${id}/status`, { date, status: 'confirmed' }, config);
    return response.data;
};

const appointmentService = {
    requestAppointment,
    getAppointments,
    updateStatus,
    rescheduleAppointment,
};

export default appointmentService;
