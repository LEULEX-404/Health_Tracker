import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/meal-plans`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('pn_token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const getUserMealPlans = async (userId, params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/${userId}`, {
      ...getAuthHeaders(),
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch meal plans');
  }
};

export const suggestMealPlans = async (userId, mealType) => {
  try {
    const response = await axios.post(`${API_URL}/suggest/${userId}`, { mealType }, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to generate suggested meal plans');
  }
};

export const createMealPlan = async (userId, planData) => {
  try {
    const response = await axios.post(
      API_URL,
      { userId, ...planData },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create meal plan');
  }
};

export const deleteMealPlan = async (id, userId) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      ...getAuthHeaders(),
      params: { userId }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete meal plan');
  }
};
