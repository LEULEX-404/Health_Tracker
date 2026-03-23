/* eslint-disable no-unused-vars */
const BASE = import.meta.env.VITE_API_URL;

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('pn_token')}` },
});

/** Fetch up to `limit` unread notifications for a user */
export const getUserNotifications = async (userId, limit = 5) => {
  const res = await fetch(`${BASE}/notifications/${userId}?limit=${limit}&isRead=false`, authHeaders());
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
};

/** Fetch active (non-Resolved) alerts for a patient user */
export const getUserAlerts = async (userId) => {
  const res = await fetch(`${BASE}/alerts?userId=${userId}`, authHeaders());
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
};

/** Mark a single notification as read */
export const markNotificationRead = async (id) => {
  const res = await fetch(`${BASE}/notifications/${id}/read`, {
    method: 'PATCH',
    ...authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to mark notification read');
  return res.json();
};

/** Mark all notifications as read for a user */
export const markAllNotificationsRead = async (userId) => {
  const res = await fetch(`${BASE}/notifications/user/${userId}/read-all`, {
    method: 'PATCH',
    ...authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to mark all as read');
  return res.json();
};

/** Resolve a single alert */
export const resolveAlert = async (id) => {
  const res = await fetch(`${BASE}/alerts/${id}/resolve`, {
    method: 'PATCH',
    ...authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to resolve alert');
  return res.json();
};

/** Resolve all user alerts (fetches and resolves one by one since no bulk route exists) */
export const resolveAllAlerts = async (userId) => {
  try {
    const alerts = await getUserAlerts(userId);
    const unresolved = alerts.filter(a => a.status !== 'Resolved');
    await Promise.allSettled(unresolved.map(a => resolveAlert(a._id)));
  } catch (err) {
    throw new Error('Failed to resolve all alerts');
  }
};
