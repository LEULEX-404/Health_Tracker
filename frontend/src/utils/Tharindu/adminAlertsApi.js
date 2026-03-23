import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

/* ─── helpers ─── */
const headers = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

const request = async (url, opts = {}) => {
  const res = await fetch(url, { credentials: 'include', ...opts });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Request failed');
  return data;
};

/* ═══════════════════════════════════════════
   ALERTS (Admin operations)
   ═══════════════════════════════════════════ */

export async function getAllAlerts(token, userId = null) {
  const query = userId ? `?userId=${userId}` : '';
  return request(`${API_BASE}/alerts${query}`, {
    headers: headers(token),
  });
}

export async function acknowledgeAlert(token, id, doctorId) {
  return request(`${API_BASE}/alerts/${id}/acknowledge`, {
    method: 'PATCH',
    headers: headers(token),
    body: JSON.stringify({ doctorId }),
  });
}

export async function resolveAlert(token, id) {
  return request(`${API_BASE}/alerts/${id}/resolve`, {
    method: 'PATCH',
    headers: headers(token),
  });
}

export async function deleteAlert(token, id) {
  return request(`${API_BASE}/alerts/${id}`, {
    method: 'DELETE',
    headers: headers(token),
  });
}

/* ═══════════════════════════════════════════
   ALERT SETTINGS (Admin operations)
   ═══════════════════════════════════════════ */

export async function getAlertSettings(token, userId) {
  return request(`${API_BASE}/alert-settings/${userId}`, {
    headers: headers(token),
  });
}

export async function updateAlertSettings(token, userId, data) {
  return request(`${API_BASE}/alert-settings/${userId}`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify(data),
  });
}
