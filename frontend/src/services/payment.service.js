import axios from 'axios';

const PAY_URL = 'http://localhost:5000/api/payments';
const INV_URL = 'http://localhost:5000/api/invoices';

// Process Payment
const processPayment = async (paymentData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.post(PAY_URL, paymentData, config);
    return response.data;
};

// Get Payments
const getPayments = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(PAY_URL, config);
    return response.data;
};

// Get Invoices
const getInvoices = async (token, caseId = null) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: caseId ? { caseId } : {}
    };
    const response = await axios.get(INV_URL, config);
    return response.data;
};

const paymentService = {
    processPayment,
    getPayments,
    getInvoices
};

export default paymentService;
