const BASE_URL = 'http://localhost:5000/api/users';

/**
 * Mark onboarding as complete for a user
 */
export async function completeUserOnboarding(userId, token) {
    const res = await fetch(`${BASE_URL}/${userId}/onboarding`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to complete onboarding');
    return data;
}
