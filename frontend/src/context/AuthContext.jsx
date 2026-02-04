import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('wandrix_token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.getMe();
      if (response.user) {
        setUser(response.user);
        setWishlist(response.user.wishlist || []);
      } else {
        // Token invalid, clear it
        localStorage.removeItem('wandrix_token');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('wandrix_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.login(email, password);
    if (response.token) {
      localStorage.setItem('wandrix_token', response.token);
      setUser(response.user);
      setWishlist(response.user.wishlist || []);
      return { success: true };
    }
    return { success: false, error: response.error };
  };

  const register = async (name, email, password) => {
    const response = await api.register(name, email, password);
    if (response.token) {
      localStorage.setItem('wandrix_token', response.token);
      setUser(response.user);
      setWishlist([]);
      return { success: true };
    }
    return { success: false, error: response.error };
  };

  const logout = () => {
    localStorage.removeItem('wandrix_token');
    setUser(null);
    setWishlist([]);
  };

  const addToWishlist = async (destination) => {
    if (!user) return { success: false, error: 'Please login first' };
    
    const response = await api.addToWishlist(destination);
    if (response.message) {
      setWishlist(prev => [...prev, { ...destination, added_at: new Date().toISOString() }]);
      return { success: true };
    }
    return { success: false, error: response.error };
  };

  const removeFromWishlist = async (destinationName) => {
    if (!user) return { success: false, error: 'Please login first' };
    
    const response = await api.removeFromWishlist(destinationName);
    if (response.message) {
      setWishlist(prev => prev.filter(item => item.name !== destinationName));
      return { success: true };
    }
    return { success: false, error: response.error };
  };

  const isInWishlist = (destinationName) => {
    return wishlist.some(item => item.name === destinationName);
  };

  const value = {
    user,
    loading,
    wishlist,
    login,
    register,
    logout,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
