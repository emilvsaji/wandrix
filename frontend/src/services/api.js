const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function getAuthToken() {
  return localStorage.getItem('wandrix_token');
}

async function request(path, { method = 'GET', body, requiresAuth = false } = {}) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (requiresAuth) {
    const token = getAuthToken();
    if (!token) {
      throw new ApiError('Authentication required', 401);
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError('Invalid server response', response.status);
  }

  if (!response.ok || payload?.success === false) {
    throw new ApiError(payload?.message || 'Request failed', response.status);
  }

  return payload?.data || {};
}

export const api = {
  healthCheck() {
    return request('/health');
  },

  register(name, email, password) {
    return request('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });
  },

  login(email, password) {
    return request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  getMe() {
    return request('/auth/me', { requiresAuth: true });
  },

  updateProfile({ name, avatar_url }) {
    return request('/auth/profile', {
      method: 'PUT',
      requiresAuth: true,
      body: { name, avatar_url },
    });
  },

  getWishlist() {
    return request('/auth/wishlist', { requiresAuth: true });
  },

  addToWishlist(destination) {
    return request('/auth/wishlist/add', {
      method: 'POST',
      requiresAuth: true,
      body: { destination },
    });
  },

  removeFromWishlist(destinationName) {
    return request('/auth/wishlist/remove', {
      method: 'POST',
      requiresAuth: true,
      body: { name: destinationName },
    });
  },

  getDestinationInfo(destination) {
    return request('/destination/info', {
      method: 'POST',
      body: { destination },
    });
  },

  getDestinationHighlights(destination) {
    return request('/destination/highlights', {
      method: 'POST',
      body: { destination },
    });
  },

  compareDestinations(destination1, destination2, preferences) {
    return request('/compare', {
      method: 'POST',
      requiresAuth: true,
      body: { destination1, destination2, preferences },
    });
  },

  generateItinerary(destination, preferences) {
    return request('/itinerary/generate', {
      method: 'POST',
      requiresAuth: true,
      body: { destination, preferences },
    });
  },

  getItinerary(itineraryId) {
    return request(`/itinerary/${itineraryId}`, { requiresAuth: true });
  },

  getPopularDestinations() {
    return request('/destinations/popular');
  },

  getComparisonHistory() {
    return request('/comparisons/history', { requiresAuth: true });
  },

  getItineraryHistory() {
    return request('/itineraries/history', { requiresAuth: true });
  },

  getAdminOverview() {
    return request('/admin/overview', { requiresAuth: true });
  },

  getAdminUsers() {
    return request('/admin/users', { requiresAuth: true });
  },

  updateAdminUserRole(userId, is_admin) {
    return request(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      requiresAuth: true,
      body: { is_admin },
    });
  },

  deleteAdminUser(userId) {
    return request(`/admin/users/${userId}`, {
      method: 'DELETE',
      requiresAuth: true,
    });
  },

  getAdminUserActivity(userId) {
    return request(`/admin/users/${userId}/activity`, {
      requiresAuth: true,
    });
  },

  updateAdminUserStatus(userId, is_blocked, blocked_reason = '') {
    return request(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      requiresAuth: true,
      body: { is_blocked, blocked_reason },
    });
  },

  resetAdminUserPassword(userId, new_password) {
    return request(`/admin/users/${userId}/password`, {
      method: 'PATCH',
      requiresAuth: true,
      body: { new_password },
    });
  },
};

export { ApiError };
export default api;
