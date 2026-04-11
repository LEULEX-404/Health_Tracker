import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const createSupportMessage = async (token, payload) => {
  const response = await axios.post(`${API_URL}/support`, payload, getAuthHeader(token));
  return response.data;
};

export const getMySupportMessages = async (token) => {
  const response = await axios.get(`${API_URL}/support/mine`, getAuthHeader(token));
  return response.data;
};

export const getAllSupportMessages = async (token) => {
  const response = await axios.get(`${API_URL}/support`, getAuthHeader(token));
  return response.data;
};

export const updateSupportMessage = async (token, messageId, payload) => {
  const response = await axios.patch(`${API_URL}/support/${messageId}`, payload, getAuthHeader(token));
  return response.data;
};
