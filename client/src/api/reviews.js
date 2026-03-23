import axios from 'axios';

const REVIEWS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/reviews`;
const getToken = () => JSON.parse(localStorage.getItem('servicoUser'))?.token;

export const createReviewAPI = async (reviewData) => {
  const config = { headers: { Authorization: `Bearer ${getToken()}` } };
  const response = await axios.post(REVIEWS_API_URL, reviewData, config);
  return response.data;
};

export const getProviderReviewsAPI = async (providerId) => {
  const response = await axios.get(`${REVIEWS_API_URL}/provider/${providerId}`);
  return response.data;
};