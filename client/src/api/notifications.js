import axios from 'axios';

const NOTIFICATIONS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/notifications`;
const getToken = () => JSON.parse(localStorage.getItem('servicoUser'))?.token;

export const getMyNotificationsAPI = async () => {
  const config = { headers: { Authorization: `Bearer ${getToken()}` } };
  const response = await axios.get(NOTIFICATIONS_API_URL, config);
  return response.data;
};

export const markNotificationsAsReadAPI = async () => {
  const config = { headers: { Authorization: `Bearer ${getToken()}` } };
  const response = await axios.put(`${NOTIFICATIONS_API_URL}/read`, {}, config);
  return response.data;
};