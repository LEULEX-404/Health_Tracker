const BASE_URL = 'http://localhost:5000/api/exercise';

function getAuthHeaders(token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

/**
 * Get start of current week (Monday) and end of next week (Sunday) for date validation.
 * User can only select dates in current week and next week — no past dates before current week.
 */
export function getExerciseDateBounds() {
    const now = new Date();
    const day = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const toMonday = day === 0 ? -6 : 1 - day;
    const startCurrentWeek = new Date(now);
    startCurrentWeek.setDate(now.getDate() + toMonday);
    startCurrentWeek.setHours(0, 0, 0, 0);
    const endNextWeek = new Date(startCurrentWeek);
    endNextWeek.setDate(startCurrentWeek.getDate() + 13); // current week (7) + next week (7) - 1
    return {
        min: startCurrentWeek.toISOString().slice(0, 10),
        max: endNextWeek.toISOString().slice(0, 10)
    };
}

/**
 * Check if a date string (YYYY-MM-DD) is within allowed range (current week and next week only).
 */
export function isDateInAllowedRange(dateStr) {
    if (!dateStr) return false;
    const { min, max } = getExerciseDateBounds();
    return dateStr >= min && dateStr <= max;
}

export async function getExerciseLogs(token) {
    const res = await fetch(`${BASE_URL}/`, {
        headers: getAuthHeaders(token),
        credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch exercise logs');
    return Array.isArray(data) ? data : (data.data || data.logs || []);
}

export async function getExerciseStats(token) {
    const res = await fetch(`${BASE_URL}/stats`, {
        headers: getAuthHeaders(token),
        credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch stats');
    return data;
}

export async function createExerciseLog(token, body) {
    const res = await fetch(`${BASE_URL}/`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        credentials: 'include',
        body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to save exercise');
    return data;
}

export async function updateExerciseLog(token, id, body) {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        credentials: 'include',
        body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update exercise');
    return data;
}

export async function deleteExerciseLog(token, id) {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
        credentials: 'include'
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete exercise');
    }
}
