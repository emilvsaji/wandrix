import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUserComparisons } from '../hooks/useUserComparisons';
import { useUserItineraries } from '../hooks/useUserItineraries';
import './ProfilePage.css';

function ProfilePage() {
  const { user, wishlist } = useAuth();
  const { comparisons, loading: comparisonsLoading } = useUserComparisons(Boolean(user));
  const { itineraries, loading: itinerariesLoading } = useUserItineraries(Boolean(user));
  const [comparisonHistory, setComparisonHistory] = useState([]);
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
      setComparisonHistory(comparisons.slice(0, 5));
      setStats({
        totalTrips: itineraries.length,
        wishlistCount: wishlist.length,
        comparisonsCount: comparisons.length,
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

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{user?.name || 'User'}</h1>
            <p className="profile-email">{user?.email || 'user@example.com'}</p>
            <p className="profile-join-date">
              Member since {formatDate(user?.created_at)}
            </p>
          </div>
        </div>

        {/* Travel Statistics */}
        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.totalTrips}</div>
            <div className="stat-label">Trips Planned</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.wishlistCount}</div>
            <div className="stat-label">Saved Destinations</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.comparisonsCount}</div>
            <div className="stat-label">Comparisons Made</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="profile-sections">
          {/* Wishlist Preview */}
          <div className="profile-section">
            <h2 className="section-title">My Wishlist</h2>
            {wishlist.length > 0 ? (
              <div className="wishlist-preview">
                {wishlist.slice(0, 4).map((destination, index) => (
                  <div key={index} className="wishlist-item">
                    <div className="destination-icon">📍</div>
                    <div className="destination-info">
                      <h4>{destination.name}</h4>
                      <p>{destination.country}</p>
                    </div>
                  </div>
                ))}
                {wishlist.length > 4 && (
                  <div className="more-items">
                    +{wishlist.length - 4} more destinations
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">❤️</div>
                <p>No destinations in your wishlist yet</p>
                <p>Start exploring and save your favorite places!</p>
              </div>
            )}
          </div>

          {/* Recent Comparisons */}
          <div className="profile-section">
            <h2 className="section-title">Recent Comparisons</h2>
            {comparisonHistory.length > 0 ? (
              <div className="comparison-history">
                {comparisonHistory.map((comparison, index) => (
                  <div key={index} className="comparison-item">
                    <div className="comparison-destinations">
                      <span className="destination-name">{comparison.destination1_analysis?.name || comparison.destination1}</span>
                      <span className="vs">vs</span>
                      <span className="destination-name">{comparison.destination2_analysis?.name || comparison.destination2}</span>
                    </div>
                    <div className="comparison-date">
                      {formatDate(comparison.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">⚖️</div>
                <p>No comparisons made yet</p>
                <p>Compare destinations to find your perfect match!</p>
              </div>
            )}
          </div>

          {/* Travel Preferences */}
          <div className="profile-section">
            <h2 className="section-title">Travel Preferences</h2>
            <div className="preferences-grid">
              <div className="preference-item">
                <div className="preference-icon">💰</div>
                <div className="preference-info">
                  <h4>Budget</h4>
                  <p>Not specified</p>
                </div>
              </div>
              <div className="preference-item">
                <div className="preference-icon">📅</div>
                <div className="preference-info">
                  <h4>Trip Duration</h4>
                  <p>Not specified</p>
                </div>
              </div>
              <div className="preference-item">
                <div className="preference-icon">🎯</div>
                <div className="preference-info">
                  <h4>Interests</h4>
                  <p>Not specified</p>
                </div>
              </div>
              <div className="preference-item">
                <div className="preference-icon">👥</div>
                <div className="preference-info">
                  <h4>Travel Type</h4>
                  <p>Not specified</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;