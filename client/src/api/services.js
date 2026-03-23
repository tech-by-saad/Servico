import axios from 'axios';
const SERVICES_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/services`;

export const getServicesAPI = async (keyword = '', city = '') => {
  const response = await axios.get(`${SERVICES_API_URL}?keyword=${keyword}&city=${city}`);
  return response.data;
};

export const getServiceByIdAPI = async (id) => {
  const response = await axios.get(`${SERVICES_API_URL}/${id}`);
  return response.data;
};

// --- THIS IS THE NEW FUNCTION ---
export const getPopularServicesAPI = async () => {
  const response = await axios.get(`${SERVICES_API_URL}/popular`);
  return response.data;
};