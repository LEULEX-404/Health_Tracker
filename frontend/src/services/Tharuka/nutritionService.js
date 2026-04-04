import axios from 'axios';

// We map nutrition endpoints similar to how existing Tharuka routes are set up.
// Assume base API path is '/api' and routes are defined in backend.
const API_URL = `${import.meta.env.VITE_API_URL}/nutrition`;

// Attach authorization headers dynamically for authenticated requests
const getAuthHeaders = () => {
  const token = localStorage.getItem('pn_token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const getNutritionAnalysis = async (userId, type = 'weekly') => {
  try {
    const response = await axios.get(`${API_URL}/analysis/${userId}?type=${type}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch nutrition analysis');
  }
};

export const getUserNutrition = async (userId, params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/${userId}`, {
      ...getAuthHeaders(),
      params
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user nutrition');
  }
};

export const addMeal = async (mealData) => {
  try {
    const response = await axios.post(API_URL, mealData, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to add meal');
  }
};

export const updateMeal = async (id, mealData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, mealData, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update meal');
  }
};

export const deleteMeal = async (id, userId) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      ...getAuthHeaders(),
      params: { userId } // axios delete requires data to be passed explicitly in config
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete meal');
  }
};

// Doctors adding advice
export const addDoctorRecommendation = async (id, recommendationData) => {
  try {
    const response = await axios.post(`${API_URL}/${id}/recommendation`, recommendationData, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to add doctor recommendation');
  }
};

export const checkNutrition = async (items) => {
  try {
    const response = await axios.post(`${API_URL}/check`, { items }, getAuthHeaders());
    return response.data.data; // Server 'ok' helper wraps in {success, data}
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to check nutrition');
  }
};
