import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserComparisons } from '../hooks/useUserComparisons';
import { useUserItineraries } from '../hooks/useUserItineraries';
import './ProfilePage.css';

function ProfilePage() {
  const navigate = useNavigate();
  const { user, wishlist, logout } = useAuth();
  const { comparisons, loading: comparisonsLoading } = useUserComparisons(Boolean(user));
  const { itineraries, loading: itinerariesLoading } = useUserItineraries(Boolean(user));
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTrips: 0,
    wishlistCount: 0,
    comparisonsCount: 0
  });

  useEffect(() => {
    const isLoading = comparisonsLoading || itinerariesLoading;
    setLoading(isLoading);

    if (!isLoading) {
      setStats({
        totalTrips: itineraries?.length || 0,
        wishlistCount: wishlist?.length || 0,
        comparisonsCount: comparisons?.length || 0,
      });
    }
  }, [comparisons, itineraries, wishlist, comparisonsLoading, itinerariesLoading]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="profile-dashboard">
      <div className="profile-container">
        
        {/* Profile Header */}
        <header className="profile-header-card">
          <div className="profile-header-content">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar-pulse"></div>
              <div className="profile-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
            <div className="profile-user-details">
              <h1 className="profile-name">{user?.name || 'User'}</h1>
              <p className="profile-email">{user?.email || 'user@example.com'}</p>
              <span className="profile-badge">Member since {formatDate(user?.created_at)}</span>
            </div>
          </div>
          <div className="profile-header-actions">
            <button className="btn-edit-profile">Edit Profile</button>
            <button className="btn-logout" onClick={handleLogout}>Log Out</button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          
          {/* Card 1: Account Info */}
          <div className="dashboard-card account-info-card">
            <div className="card-header">
              <div className="card-icon">👤</div>
              <h2>Account Info</h2>
            </div>
            <div className="card-body">
              <div className="info-row">
                <span className="info-label">Full Name</span>
                <span className="info-value">{user?.name || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email Address</span>
                <span className="info-value">{user?.email || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Travel Style</span>
                <span className="info-value badge-style">Explorer</span>
              </div>
            </div>
            <div className="card-footer">
              <button className="btn-text">Manage Account →</button>
            </div>
          </div>

          {/* Card 2: Travel Stats */}
          <div className="dashboard-card travel-stats-card">
            <div className="card-header">
              <div className="card-icon">📊</div>
              <h2>Travel Stats</h2>
            </div>
            <div className="card-body stats-grid">
              <div className="stat-box">
                {loading ? <div className="skeleton skeleton-stat"></div> : <span className="stat-value">{stats.totalTrips}</span>}
                <span className="stat-name">Itineraries</span>
              </div>
              <div className="stat-box">
                {loading ? <div className="skeleton skeleton-stat"></div> : <span className="stat-value">{stats.comparisonsCount}</span>}
                <span className="stat-name">Comparisons</span>
              </div>
              <div className="stat-box">
                {loading ? <div className="skeleton skeleton-stat"></div> : <span className="stat-value">{stats.wishlistCount}</span>}
                <span className="stat-name">Wishlist</span>
              </div>
            </div>
          </div>

          {/* Card 3: Quick Actions */}
          <div className="dashboard-card quick-actions-card">
            <div className="card-header">
              <div className="card-icon">⚡</div>
              <h2>Quick Actions</h2>
            </div>
            <div className="card-body actions-list">
              <button className="action-item" onClick={() => navigate('/wishlist')}>
                <div className="action-icon">❤️</div>
                <div className="action-text">
                  <span className="action-title">View Wishlist</span>
                  <span className="action-desc">Manage your saved destinations</span>
                </div>
                <div className="action-arrow">→</div>
              </button>
              <button className="action-item" onClick={() => navigate('/compare')}>
                <div className="action-icon">⚖️</div>
                <div className="action-text">
                  <span className="action-title">Compare Destinations</span>
                  <span className="action-desc">Find your perfect match</span>
                </div>
                <div className="action-arrow">→</div>
              </button>
              <button className="action-item" onClick={() => navigate('/explore')}>
                <div className="action-icon">🗺️</div>
                <div className="action-text">
                  <span className="action-title">Generate Itinerary</span>
                  <span className="action-desc">Plan your next adventure</span>
                </div>
                <div className="action-arrow">→</div>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
