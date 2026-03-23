import axios from 'axios';

const ADMIN_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/admin`;
const SERVICES_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/services`;
const getToken = () => JSON.parse(localStorage.getItem('servicoUser'))?.token;

export const getDashboardStatsAPI = async () => {
  const config = { headers: { Authorization: `Bearer ${getToken()}` } };
  const response = await axios.get(`${ADMIN_API_URL}/stats`, config);
  return response.data;
};

export const getAllUsersAPI = async (keyword = '', role = 'all') => {
  const config = { headers: { Authorization: `Bearer ${getToken()}` } };
  const response = await axios.get(`${ADMIN_API_URL}/users?keyword=${keyword}&role=${role}`, config);
  return response.data;
};

export const toggleUserBlockStatusAPI = async (userId) => {
  const config = { headers: { Authorization: `Bearer ${getToken()}` } };
  const response = await axios.put(`${ADMIN_API_URL}/users/${userId}/toggle-block`, {}, config);
  return response.data;
};

export const createServiceAPI = async (serviceData, imageFile) => {
    const formData = new FormData();
    Object.keys(serviceData).forEach(key => formData.append(key, serviceData[key]));
    if (imageFile) formData.append('image', imageFile);
    const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${getToken()}` } };
    const response = await axios.post(SERVICES_API_URL, formData, config);
    return response.data;
};

export const updateServiceAPI = async (id, serviceData, imageFile) => {
    const formData = new FormData();
    Object.keys(serviceData).forEach(key => formData.append(key, serviceData[key]));
    if (imageFile) formData.append('image', imageFile);
    const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${getToken()}` } };
    const response = await axios.put(`${SERVICES_API_URL}/${id}`, formData, config);
    return response.data;
};

export const deleteServiceAPI = async (id) => {
  const config = { headers: { Authorization: `Bearer ${getToken()}` } };
  const response = await axios.delete(`${SERVICES_API_URL}/${id}`, config);
  return response.data;
};

