import axios from 'axios';

const PASSWORD_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/password`;

export const forgotPasswordAPI = async (email) => {
    const response = await axios.post(`${PASSWORD_API_URL}/forgot-password`, { email });
    return response.data;
};

export const resetPasswordAPI = async (token, password) => {
    const response = await axios.put(`${PASSWORD_API_URL}/reset-password/${token}`, { password });
    return response.data;
};