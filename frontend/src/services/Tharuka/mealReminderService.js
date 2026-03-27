import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/meal-reminders`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('pn_token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const getUserReminders = async (userId, params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/${userId}`, {
      ...getAuthHeaders(),
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch meal reminders');
  }
};

export const generateReminders = async (userId) => {
  try {
    const response = await axios.post(`${API_URL}/generate/${userId}`, {}, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to generate reminders');
  }
};

export const markReminderCompleted = async (reminderId, userId, mealData = null) => {
  try {
    const response = await axios.put(`${API_URL}/${reminderId}/complete`, { userId, mealData }, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to mark reminder as completed');
  }
};

export const markReminderSkipped = async (reminderId, userId) => {
  try {
    const response = await axios.put(`${API_URL}/${reminderId}/skip`, { userId }, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to mark reminder as skipped');
  }
};

export default {
  getUserReminders,
  generateReminders,
  markReminderCompleted,
  markReminderSkipped,
};
