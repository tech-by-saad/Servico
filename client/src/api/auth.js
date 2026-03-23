import axios from 'axios';

const AUTH_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/auth`;

export const registerUserAPI = async (userData) => {
  const response = await axios.post(`${AUTH_API_URL}/register`, userData);
  return response.data;
};

export const loginUserAPI = async (userData) => {
  const response = await axios.post(`${AUTH_API_URL}/login`, userData);
  return response.data;
};

export const googleAuthAPI = async (token) => {
  const response = await axios.post(`${AUTH_API_URL}/google-auth`, { token });
  return response.data;
};