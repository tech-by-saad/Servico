import axios from 'axios';

const USERS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/users`;

const getToken = () => {
  const user = JSON.parse(localStorage.getItem('servicoUser'));
  return user?.token;
};

export const updateUserProfileAPI = async (userData, imageFile) => {
  const formData = new FormData();
  formData.append('name', userData.name);
  formData.append('age', userData.age);
  formData.append('contact', userData.contact);
  formData.append('address', userData.address);
  if (imageFile) {
    formData.append('profilePicture', imageFile);
  }

  const config = { 
    headers: { 
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${getToken()}` 
    } 
  };
  const response = await axios.put(`${USERS_API_URL}/profile`, formData, config);
  return response.data;
};

export const changeUserPasswordAPI = async (passwordData) => {
  const config = { headers: { Authorization: `Bearer ${getToken()}` } };
  const response = await axios.put(`${USERS_API_URL}/change-password`, passwordData, config);
  return response.data;
};