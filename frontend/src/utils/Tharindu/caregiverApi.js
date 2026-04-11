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
   BOOKINGS  –  /api/tharindu/bookings
   ═══════════════════════════════════════════ */

export async function getMyBookings(token) {
  return request(`${API_BASE}/tharindu/bookings/my-bookings`, {
    headers: headers(token),
  });
}

export async function updateBookingStatus(token, bookingId, status) {
  return request(`${API_BASE}/tharindu/bookings/status/${bookingId}`, {
    method: 'PATCH',
    headers: headers(token),
    body: JSON.stringify({ status }),
  });
}

export async function deleteBooking(token, bookingId) {
  return request(`${API_BASE}/tharindu/bookings/${bookingId}`, {
    method: 'DELETE',
    headers: headers(token),
  });
}

export async function requestBookingRefund(token, bookingId) {
  return request(`${API_BASE}/tharindu/payment/refund/${bookingId}`, {
    method: 'POST',
    headers: headers(token),
  });
}

/* ═══════════════════════════════════════════
   NOTIFICATIONS  –  /api/notifications
   ═══════════════════════════════════════════ */

export async function getNotifications(token, userId) {
  return request(`${API_BASE}/notifications/${userId}`, {
    headers: headers(token),
  });
}

export async function markNotificationRead(token, id) {
  return request(`${API_BASE}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: headers(token),
  });
}

export async function markAllNotificationsRead(token, userId) {
  return request(`${API_BASE}/notifications/user/${userId}/read-all`, {
    method: 'PATCH',
    headers: headers(token),
  });
}

export async function deleteNotification(token, id) {
  return request(`${API_BASE}/notifications/${id}`, {
    method: 'DELETE',
    headers: headers(token),
  });
}

/* ═══════════════════════════════════════════
   ALERTS  –  /api/alerts
   ═══════════════════════════════════════════ */

export async function getAlerts(token, userId) {
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
