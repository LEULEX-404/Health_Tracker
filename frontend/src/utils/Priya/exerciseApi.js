const BASE_URL = `${import.meta.env.VITE_API_URL}/exercise`;

function getAuthHeaders(token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Get allowed bounds from today through the next N weeks.
 *
 * @param {number} nextWeeksAhead - How many weeks ahead from today to allow.
 */
export function getExerciseDateBounds(nextWeeksAhead = 2) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endAllowed = new Date(today);
    endAllowed.setDate(today.getDate() + Number(nextWeeksAhead) * 7);

    return {
        min: formatLocalDate(today),
        max: formatLocalDate(endAllowed)
    };
}

/**
 * Check if a date string (YYYY-MM-DD) is within allowed range.
 */
export function isDateInAllowedRange(dateStr, nextWeeksAhead = 2) {
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
