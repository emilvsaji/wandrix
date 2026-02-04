const API_BASE_URL = 'http://localhost:5000/api';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('wandrix_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const api = {
  // Health check
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  },

  // ==================== AUTH ====================
  
  // Register new user
  async register(name, email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  },

  // Login user
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  // Get current user
  async getMe() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { ...getAuthHeaders() },
    });
    return response.json();
  },

  // ==================== WISHLIST ====================

  // Get wishlist
  async getWishlist() {
    const response = await fetch(`${API_BASE_URL}/auth/wishlist`, {
      headers: { ...getAuthHeaders() },
    });
    return response.json();
  },

  // Add to wishlist
  async addToWishlist(destination) {
    const response = await fetch(`${API_BASE_URL}/auth/wishlist/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ destination }),
    });
    return response.json();
  },

  // Remove from wishlist
  async removeFromWishlist(destinationName) {
    const response = await fetch(`${API_BASE_URL}/auth/wishlist/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ name: destinationName }),
    });
    return response.json();
  },

  // ==================== DESTINATIONS ====================

  // Get destination information
  async getDestinationInfo(destination) {
    const response = await fetch(`${API_BASE_URL}/destination/info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination }),
    });
    return response.json();
  },

  // Get destination highlights
  async getDestinationHighlights(destination) {
    const response = await fetch(`${API_BASE_URL}/destination/highlights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination }),
    });
    return response.json();
  },

  // Compare two destinations
  async compareDestinations(destination1, destination2, preferences) {
    const response = await fetch(`${API_BASE_URL}/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination1, destination2, preferences }),
    });
    return response.json();
  },

  // Generate itinerary
  async generateItinerary(destination, preferences) {
    const response = await fetch(`${API_BASE_URL}/itinerary/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination, preferences }),
    });
    return response.json();
  },

  // Get saved itinerary
  async getItinerary(itineraryId) {
    const response = await fetch(`${API_BASE_URL}/itinerary/${itineraryId}`);
    return response.json();
  },

  // Get popular destinations
  async getPopularDestinations() {
    const response = await fetch(`${API_BASE_URL}/destinations/popular`);
    return response.json();
  },

  // Get comparison history
  async getComparisonHistory() {
    const response = await fetch(`${API_BASE_URL}/comparisons/history`);
    return response.json();
  },
};

export default api;
