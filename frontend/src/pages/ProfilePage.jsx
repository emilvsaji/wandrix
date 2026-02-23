import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserComparisons } from '../hooks/useUserComparisons';
import { useUserItineraries } from '../hooks/useUserItineraries';
import './ProfilePage.css';

function ProfilePage() {
  const navigate = useNavigate();
  const { user, wishlist, logout, updateProfile } = useAuth();
  const { comparisons, loading: comparisonsLoading, error: comparisonsError } = useUserComparisons(Boolean(user));
  const { itineraries, loading: itinerariesLoading, error: itinerariesError } = useUserItineraries(Boolean(user));

  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [form, setForm] = useState({
    name: '',
    avatar_url: '',
  });

  useEffect(() => {
    setForm({
      name: user?.name || '',
      avatar_url: user?.avatar_url || '',
    });
  }, [user]);

  useEffect(() => {
    const isLoading = comparisonsLoading || itinerariesLoading;
    setLoading(isLoading);
  }, [comparisonsLoading, itinerariesLoading]);

  const stats = useMemo(
    () => ({
      totalTrips: itineraries?.length || 0,
      wishlistCount: wishlist?.length || 0,
      comparisonsCount: comparisons?.length || 0,
    }),
    [itineraries, wishlist, comparisons],
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSaveError('Please choose a valid image file.');
      return;
    }

    if (file.size > 1024 * 1024) {
      setSaveError('Please choose an image under 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, avatar_url: reader.result }));
      setSaveError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveError('');
    setSaveSuccess('');

    const result = await updateProfile({
      name: form.name,
      avatar_url: form.avatar_url,
    });

    if (result.success) {
      setSaveSuccess('Profile updated successfully.');
      setTimeout(() => {
        setShowEditModal(false);
        setSaveSuccess('');
      }, 900);
    } else {
      setSaveError(result.error || 'Failed to update profile');
    }

    setSaveLoading(false);
  };

  const renderAvatar = () => {
    if (user?.avatar_url) {
      return <img src={user.avatar_url} alt={user?.name || 'User avatar'} className="profile-avatar-image" />;
    }

    return user?.name?.charAt(0)?.toUpperCase() || 'U';
  };

  const hasLoadError = Boolean(comparisonsError || itinerariesError);

  return (
    <div className="profile-dashboard">
      <div className="profile-container">
        <header className="profile-header-card">
          <div className="profile-header-content">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar-pulse"></div>
              <div className="profile-avatar">{renderAvatar()}</div>
            </div>
            <div className="profile-user-details">
              <h1 className="profile-name">{user?.name || 'User'}</h1>
              <p className="profile-email">{user?.email || 'user@example.com'}</p>
              <span className="profile-badge">Member since {formatDate(user?.created_at)}</span>
            </div>
          </div>
          <div className="profile-header-actions">
            <button className="btn-edit-profile" onClick={() => setShowEditModal(true)}>
              Edit Profile
            </button>
            <button className="btn-logout" onClick={handleLogout}>Log Out</button>
          </div>
        </header>

        {hasLoadError && (
          <div className="profile-error-banner">
            Unable to load some dashboard data right now. Please refresh and try again.
          </div>
        )}

        <div className="dashboard-grid">
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
                <span className="info-label">Travel Preferences</span>
                <span className="info-value badge-style">Explorer • Personalized AI trips</span>
              </div>
            </div>
            <div className="card-footer">
              <button className="btn-text" onClick={() => setShowEditModal(true)}>Manage Account →</button>
            </div>
          </div>

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
                  <span className="action-title">View Comparisons</span>
                  <span className="action-desc">Reuse your latest comparisons</span>
                </div>
                <div className="action-arrow">→</div>
              </button>
              <button className="action-item" onClick={() => navigate('/explore')}>
                <div className="action-icon">🗺️</div>
                <div className="action-text">
                  <span className="action-title">Generate New Itinerary</span>
                  <span className="action-desc">Create your next adventure plan</span>
                </div>
                <div className="action-arrow">→</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <div className="profile-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Profile</h3>
            <form className="profile-form" onSubmit={handleSaveProfile}>
              <label className="profile-form-label">
                Full Name
                <input
                  className="profile-form-input"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  minLength={2}
                />
              </label>

              <label className="profile-form-label">
                Profile Picture URL (optional)
                <input
                  className="profile-form-input"
                  type="text"
                  value={form.avatar_url}
                  onChange={(e) => setForm((prev) => ({ ...prev, avatar_url: e.target.value }))}
                  placeholder="https://..."
                />
              </label>

              <label className="profile-form-label">
                Or Upload Picture (max 1MB)
                <input className="profile-form-file" type="file" accept="image/*" onChange={handleFileChange} />
              </label>

              {form.avatar_url && (
                <div className="profile-avatar-preview-wrap">
                  <img src={form.avatar_url} alt="Avatar preview" className="profile-avatar-preview" />
                </div>
              )}

              {saveError && <p className="profile-form-error">{saveError}</p>}
              {saveSuccess && <p className="profile-form-success">{saveSuccess}</p>}

              <div className="profile-form-actions">
                <button type="button" className="btn-logout" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-edit-profile" disabled={saveLoading}>
                  {saveLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
