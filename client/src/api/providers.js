import axios from 'axios';

const PROVIDERS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/providers`;
const BOOKINGS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/bookings`;
const getToken = () => JSON.parse(localStorage.getItem('servicoUser'))?.token;

export const applyToBeProviderAPI = async (applicationData) => {
const config = {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  };
  const response = await axios.post(`${PROVIDERS_API_URL}/apply`, applicationData, config);
  return response.data;
};

export const getMyProviderProfileAPI = async () => {
  const config = { headers: { Authorization: `Bearer ${getToken()}` } };
  const response = await axios.get(`${PROVIDERS_API_URL}/profile/me`, config);
  return response.data;
};

export const updateMyProviderProfileAPI = async (profileData) => {
  const config = { headers: { Authorization: `Bearer ${getToken()}` } };
  const response = await axios.put(`${PROVIDERS_API_URL}/profile/me`, profileData, config);
  return response.data;
};

export const getProvidersForServiceAPI = async (serviceId, city = '') => {
  let url = `${PROVIDERS_API_URL}/service/${serviceId}`;
  if (city) url += `?city=${city}`;
  const response = await axios.get(url);
  return response.data;
};

export const getProviderPublicProfileAPI = async (providerId) => {
  const response = await axios.get(`${PROVIDERS_API_URL}/${providerId}`);
  return response.data;
};

export const getProviderBookingsAPI = async () => {
  const config = { headers: { Authorization: `Bearer ${getToken()}` } };
  const response = await axios.get(`${BOOKINGS_API_URL}/provider`, config);
  return response.data;
};

export const updateBookingStatusAPI = async (bookingId, status) => {
  const config = { headers: { Authorization: `Bearer ${getToken()}` } };
  const response = await axios.put(`${BOOKINGS_API_URL}/${bookingId}/status`, { status }, config);
  return response.data;
};

export const getProviderAvailabilityAPI = async (providerId, date) => {
  const response = await axios.get(`${PROVIDERS_API_URL}/${providerId}/availability?date=${date}`);
  return response.data;
};