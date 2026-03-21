import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = (token) => ({
    headers: { Authorization: `Bearer ${token}` }
});

// --- User Management ---
export const getAllUsers = async (token, params = {}) => {
    const response = await axios.get(`${API_URL}/users`, {
        ...getAuthHeader(token),
        params
    });
    return response.data;
};

export const updateUserStatus = async (token, userId, isActive) => {
    const response = await axios.put(`${API_URL}/users/${userId}`, { isActive }, getAuthHeader(token));
    return response.data;
};

export const updateUser = async (token, userId, userData) => {
    const response = await axios.put(`${API_URL}/users/${userId}`, userData, getAuthHeader(token));
    return response.data;
};

export const deleteUser = async (token, userId) => {
    const response = await axios.delete(`${API_URL}/users/${userId}`, getAuthHeader(token));
    return response.data;
};

// --- Doctor Management ---
export const getAllDoctors = async (token, params = {}) => {
    const response = await axios.get(`${API_URL}/admin/doctors`, {
        ...getAuthHeader(token),
        params
    });
    return response.data;
};
export const createDoctor = async (token, doctorData) => {
    const response = await axios.post(`${API_URL}/admin/doctors`, doctorData, getAuthHeader(token));
    return response.data;
};

export const updateDoctor = async (token, doctorId, doctorData) => {
    const response = await axios.put(`${API_URL}/admin/doctors/${doctorId}`, doctorData, getAuthHeader(token));
    return response.data;
};

// --- Caregiver Management ---
export const getAllCaregivers = async (token, params = {}) => {
    const response = await axios.get(`${API_URL}/admin/caregivers`, {
        ...getAuthHeader(token),
        params
    });
    return response.data;
};

export const createCaregiver = async (token, caregiverData) => {
    const response = await axios.post(`${API_URL}/admin/caregivers`, caregiverData, getAuthHeader(token));
    return response.data;
};

export const updateCaregiver = async (token, caregiverId, caregiverData) => {
    const response = await axios.put(`${API_URL}/admin/caregivers/${caregiverId}`, caregiverData, getAuthHeader(token));
    return response.data;
};

// --- Reports ---
export const getReports = async (token, params = {}) => {
    const response = await axios.get(`${API_URL}/reports`, {
        ...getAuthHeader(token),
        params
    });
    return response.data;
};

export const generateNewReport = async (token, reportData) => {
    const response = await axios.post(`${API_URL}/reports/generate`, reportData, getAuthHeader(token));
    return response.data;
};

export const deleteReport = async (token, reportId) => {
    const response = await axios.delete(`${API_URL}/reports/${reportId}`, getAuthHeader(token));
    return response.data;
};

export const downloadReport = async (token, reportId) => {
    const response = await axios.get(`${API_URL}/reports/${reportId}/pdf`, {
        ...getAuthHeader(token),
        responseType: 'blob' // Important to handle PDF binary data
    });
    return response.data;
};

// --- Dashboard Stats ---
export const getAdminDashboardStats = async (token) => {
    // We can fetch data counts securely using the pagination stats of limit=1
    const patientReq = axios.get(`${API_URL}/users?role=patient&limit=1`, getAuthHeader(token)).catch(() => ({ data: { pagination: { total: 0 } } }));
    const doctorReq = axios.get(`${API_URL}/admin/doctors?limit=1`, getAuthHeader(token)).catch(() => ({ data: { pagination: { total: 0 } } }));
    const caregiverReq = axios.get(`${API_URL}/admin/caregivers?limit=1`, getAuthHeader(token)).catch(() => ({ data: { pagination: { total: 0 } } }));
    const activeReq = axios.get(`${API_URL}/users?isActive=true&limit=1`, getAuthHeader(token)).catch(() => ({ data: { pagination: { total: 0 } } }));

    const [patients, doctors, caregivers, active] = await Promise.all([patientReq, doctorReq, caregiverReq, activeReq]);

    return {
        totalPatients: patients.data?.pagination?.total || 0,
        totalDoctors: doctors.data?.pagination?.total || 0,
        totalCaregivers: caregivers.data?.pagination?.total || 0,
        totalActive: active.data?.pagination?.total || 0,
        totalUsers: (patients.data?.pagination?.total || 0) + (doctors.data?.pagination?.total || 0) + (caregivers.data?.pagination?.total || 0)
    };
};

// --- Audit Logs ---
export const getAuditLogs = async (token, params = {}) => {
    const response = await axios.get(`${API_URL}/admin/audit-logs`, {
        ...getAuthHeader(token),
        params
    });
    return response.data;
};
