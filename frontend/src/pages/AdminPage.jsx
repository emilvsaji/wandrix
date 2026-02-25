import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './AdminPage.css';

function AdminPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserActivity, setSelectedUserActivity] = useState(null);
  const [search, setSearch] = useState('');
  const [busyUserId, setBusyUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  useEffect(() => {
    loadAdminData();
  }, [user]);

  const filteredUsers = users.filter((listedUser) => {
    const value = search.toLowerCase().trim();
    if (!value) return true;

    return (
      (listedUser.name || '').toLowerCase().includes(value) ||
      (listedUser.email || '').toLowerCase().includes(value)
    );
  });

  const handleToggleRole = async (listedUser) => {
    if (!listedUser?._id || listedUser._id === user.id) return;

    try {
      setBusyUserId(listedUser._id);
      await api.updateAdminUserRole(listedUser._id, !Boolean(listedUser.is_admin));
      await loadAdminData();
    } catch (err) {
      setError(err.message || 'Failed to update role');
    } finally {
      setBusyUserId('');
    }
  };

  const handleDeleteUser = async (listedUser) => {
    if (!listedUser?._id || listedUser._id === user.id) return;

    const confirmed = window.confirm(`Delete ${listedUser.name || listedUser.email}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      setBusyUserId(listedUser._id);
      await api.deleteAdminUser(listedUser._id);
      if (selectedUserActivity?.user?._id === listedUser._id) {
        setSelectedUserActivity(null);
      }
      await loadAdminData();
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setBusyUserId('');
    }
  };

  const handleViewActivity = async (listedUser) => {
    try {
      setBusyUserId(listedUser._id);
      const data = await api.getAdminUserActivity(listedUser._id);
      setSelectedUserActivity(data || null);
    } catch (err) {
      setError(err.message || 'Failed to load user activity');
    } finally {
      setBusyUserId('');
    }
  };

  if (!user) {
    return (
      <div className="admin-page">
        <div className="admin-empty">
          <p>Please sign in to access admin dashboard.</p>
        </div>
      </div>
    );
  }

  if (!user.is_admin) {
    return (
      <div className="admin-page">
        <div className="admin-empty">
          <p>Admin access required.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-empty">
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Manage users, permissions, and activity across the platform.</p>
        </div>

        {error && <div className="admin-error">{error}</div>}

        <div className="admin-metrics">
          <div className="metric-card">
            <span>Total Users</span>
            <strong>{metrics?.users || 0}</strong>
          </div>
          <div className="metric-card">
            <span>Admins</span>
            <strong>{metrics?.admins || 0}</strong>
          </div>
          <div className="metric-card">
            <span>Comparisons</span>
            <strong>{metrics?.comparisons || 0}</strong>
          </div>
          <div className="metric-card">
            <span>Itineraries</span>
            <strong>{metrics?.itineraries || 0}</strong>
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-users">
            <div className="users-header">
              <h2>Users</h2>
              <input
                type="text"
                placeholder="Search by name or email"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            {filteredUsers.length === 0 ? (
              <div className="admin-empty small">
                <p>No users found.</p>
              </div>
            ) : (
              <div className="users-list">
                {filteredUsers.map((listedUser) => {
                  const isBusy = busyUserId === listedUser._id;
                  const isSelf = listedUser._id === user.id;

                  return (
                    <div className="user-row" key={listedUser._id}>
                      <div className="user-main">
                        <h3>{listedUser.name || 'Unknown User'}</h3>
                        <p>{listedUser.email}</p>
                        <div className="user-badges">
                          <span className={`badge ${listedUser.is_admin ? 'admin' : 'member'}`}>
                            {listedUser.is_admin ? 'Admin' : 'User'}
                          </span>
                          <span className="badge">Wishlist: {listedUser.wishlist_count || 0}</span>
                          <span className="badge">Comparisons: {listedUser.comparison_count || 0}</span>
                          <span className="badge">Itineraries: {listedUser.itinerary_count || 0}</span>
                        </div>
                      </div>
                      <div className="user-actions">
                        <button onClick={() => handleViewActivity(listedUser)} disabled={isBusy}>
                          Activity
                        </button>
                        <button onClick={() => handleToggleRole(listedUser)} disabled={isBusy || isSelf}>
                          {listedUser.is_admin ? 'Remove Admin' : 'Make Admin'}
                        </button>
                        <button
                          className="danger"
                          onClick={() => handleDeleteUser(listedUser)}
                          disabled={isBusy || isSelf}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="admin-activity">
            <h2>User Activity</h2>
            {!selectedUserActivity ? (
              <div className="admin-empty small">
                <p>Select a user to inspect recent comparisons and itineraries.</p>
              </div>
            ) : (
              <>
                <div className="activity-user">
                  <h3>{selectedUserActivity.user?.name || 'User'}</h3>
                  <p>{selectedUserActivity.user?.email}</p>
                </div>

                <div className="activity-group">
                  <h4>Recent Comparisons</h4>
                  {(selectedUserActivity.activity?.recent_comparisons || []).length === 0 ? (
                    <p className="muted">No recent comparisons.</p>
                  ) : (
                    <ul>
                      {selectedUserActivity.activity.recent_comparisons.map((item) => (
                        <li key={item._id}>
                          <span>{item.destination1} vs {item.destination2}</span>
                          <small>{item.created_at ? new Date(item.created_at).toLocaleString() : '-'}</small>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="activity-group">
                  <h4>Recent Itineraries</h4>
                  {(selectedUserActivity.activity?.recent_itineraries || []).length === 0 ? (
                    <p className="muted">No recent itineraries.</p>
                  ) : (
                    <ul>
                      {selectedUserActivity.activity.recent_itineraries.map((item) => (
                        <li key={item._id}>
                          <span>{item.destination}</span>
                          <small>{item.created_at ? new Date(item.created_at).toLocaleString() : '-'}</small>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="admin-footer-note">
          <p>Admins can manage users, inspect activity, assign/revoke admin rights, and remove accounts.</p>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
