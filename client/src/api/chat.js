import axios from 'axios';

const CHAT_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/chat`;
const getToken = () => JSON.parse(localStorage.getItem('servicoUser'))?.token;

export const getMessagesForBookingAPI = async (bookingId) => {
  const config = { headers: { Authorization: `Bearer ${getToken()}` } };
  const response = await axios.get(`${CHAT_API_URL}/${bookingId}`, config);
  return response.data;
};