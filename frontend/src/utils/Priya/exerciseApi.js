const BASE_URL = `${import.meta.env.VITE_API_URL}/exercise`;

function getAuthHeaders(token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

/**
 * Get start of current week (Monday) and end for the allowed range.
 *
 * @param {number} nextWeeksAhead - How many weeks ahead beyond the current week.
 * For example:
 *  - nextWeeksAhead=1 => current week + next week (2 weeks total)
 *  - nextWeeksAhead=2 => current week + next 2 weeks (3 weeks total)
 */
export function getExerciseDateBounds(nextWeeksAhead = 1) {
    const now = new Date();
    const day = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const toMonday = day === 0 ? -6 : 1 - day;
    const startCurrentWeek = new Date(now);
    startCurrentWeek.setDate(now.getDate() + toMonday);
    startCurrentWeek.setHours(0, 0, 0, 0);

    // totalWeeks includes current week (1) + the "ahead" weeks.
    // endDayOffset = (totalWeeks * 7) - 1
    const totalWeeks = 1 + Number(nextWeeksAhead);
    const endAllowed = new Date(startCurrentWeek);
    endAllowed.setDate(startCurrentWeek.getDate() + totalWeeks * 7 - 1);
    return {
        min: startCurrentWeek.toISOString().slice(0, 10),
        max: endAllowed.toISOString().slice(0, 10)
    };
}

/**
 * Check if a date string (YYYY-MM-DD) is within allowed range.
 */
export function isDateInAllowedRange(dateStr, nextWeeksAhead = 1) {
    if (!dateStr) return false;
    const { min, max } = getExerciseDateBounds(nextWeeksAhead);
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
