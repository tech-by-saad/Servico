import axios from 'axios';

const BOOKINGS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/bookings`;
const getToken = () => JSON.parse(localStorage.getItem('servicoUser'))?.token;

export const createBookingAPI = async (bookingData) => {
  const config = { headers: { Authorization: `Bearer ${getToken()}` } };
  const response = await axios.post(BOOKINGS_API_URL, bookingData, config);
  return response.data;
};

export const getMyBookingsAPI = async () => {
  const config = { headers: { Authorization: `Bearer ${getToken()}` } };
  const response = await axios.get(`${BOOKINGS_API_URL}/mybookings`, config);
  return response.data;
};

export const updateBookingAPI = async (bookingId, bookingData) => {
  const config = { headers: { Authorization: `Bearer ${getToken()}` } };
  const response = await axios.put(`${BOOKINGS_API_URL}/${bookingId}`, bookingData, config);
  return response.data;
};

export const deleteBookingAPI = async (bookingId) => {
  const config = { headers: { Authorization: `Bearer ${getToken()}` } };
  const response = await axios.delete(`${BOOKINGS_API_URL}/${bookingId}`, config);
  return response.data;
};

export const confirmCancellationAPI = async (bookingId) => {
  const config = { headers: { Authorization: `Bearer ${getToken()}` } };
  const response = await axios.put(`${BOOKINGS_API_URL}/${bookingId}/confirm-cancellation`, {}, config);
  return response.data;
};