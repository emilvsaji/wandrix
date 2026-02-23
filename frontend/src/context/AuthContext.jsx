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
      const data = await api.getMe();
      setUser(data.user);
      setWishlist(data.user?.wishlist || []);
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('wandrix_token');
      setUser(null);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const data = await api.login(email, password);
      localStorage.setItem('wandrix_token', data.token);
      setUser(data.user);
      setWishlist(data.user?.wishlist || []);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await api.register(name, email, password);
      localStorage.setItem('wandrix_token', data.token);
      setUser(data.user);
      setWishlist(data.user?.wishlist || []);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('wandrix_token');
    setUser(null);
    setWishlist([]);
  };

  const addToWishlist = async (destination) => {
    if (!user) return { success: false, error: 'Please login first' };

    try {
      const data = await api.addToWishlist(destination);
      setWishlist(data.wishlist || []);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const removeFromWishlist = async (destinationName) => {
    if (!user) return { success: false, error: 'Please login first' };

    try {
      const data = await api.removeFromWishlist(destinationName);
      setWishlist(data.wishlist || []);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
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
