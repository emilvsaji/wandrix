import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './ProfilePage.css';

function AdminPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAdminData = async () => {
      if (!user?.is_admin) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const [overviewData, usersData] = await Promise.all([
          api.getAdminOverview(),
          api.getAdminUsers(),
        ]);

        setMetrics(overviewData.metrics || {});
        setUsers(usersData.users || []);
      } catch (err) {
        setError(err.message || 'Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, [user]);

  if (!user) {
    return (
      <div className="profile-page">
        <div className="empty-state">
          <div className="empty-icon">🔒</div>
          <p>Please sign in to access admin panel</p>
        </div>
      </div>
    );
  }

  if (!user.is_admin) {
    return (
      <div className="profile-page">
        <div className="empty-state">
          <div className="empty-icon">⛔</div>
          <p>Admin access required</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-info">
            <h1 className="profile-name">Admin Panel</h1>
            <p className="profile-email">Platform control dashboard</p>
          </div>
        </div>

        {error && (
          <div className="empty-state">
            <p>{error}</p>
          </div>
        )}

        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-number">{metrics?.users || 0}</div>
            <div className="stat-label">Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{metrics?.comparisons || 0}</div>
            <div className="stat-label">Comparisons</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{metrics?.itineraries || 0}</div>
            <div className="stat-label">Itineraries</div>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Users</h2>
          {users.length === 0 ? (
            <div className="empty-state">
              <p>No users found</p>
            </div>
          ) : (
            <div className="comparison-history">
              {users.map((listedUser) => (
                <div key={listedUser._id} className="comparison-item">
                  <div className="comparison-destinations">
                    <span className="destination-name">{listedUser.name || 'Unknown'}</span>
                    <span className="vs">•</span>
                    <span className="destination-name">{listedUser.email}</span>
                  </div>
                  <div className="comparison-date">
                    {listedUser.is_admin ? 'Admin' : 'User'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
