import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = 'http://localhost:5000/api/chat';
const SOCKET_URL = 'http://localhost:5000'; // Base URL for socket

let socket;

export const initSocket = () => {
    socket = io(SOCKET_URL);
    return socket;
};

export const getSocket = () => {
    if (!socket) {
        return initSocket();
    }
    return socket;
};

const getMessages = async (caseId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(`${API_URL}/${caseId}`, config);
    return response.data;
};

const sendMessage = async (caseId, messageData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.post(`${API_URL}/${caseId}/message`, messageData, config);
    return response.data;
};

const uploadFile = async (file, token) => {
    const formData = new FormData();
    formData.append('file', file);

    const config = {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.post(`${API_URL}/upload`, formData, config);
    return response.data;
};

const chatService = {
    getMessages,
    sendMessage,
    uploadFile,
    initSocket,
    getSocket
};

export default chatService;
