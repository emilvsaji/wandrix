import { useAuth } from '../context/AuthContext';
import { getDestinationImage } from '../utils/images';
import './WishlistPage.css';

function WishlistPage({ onSelectDestination }) {
  const { user, wishlist, removeFromWishlist, loading } = useAuth();

  const handleRemove = async (destinationName) => {
    await removeFromWishlist(destinationName);
  };

  const handleExplore = (destination) => {
    onSelectDestination(destination.name);
  };

  if (!user) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-empty">
          <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <h2>Sign in to view your wishlist</h2>
          <p>Save your favorite destinations and access them anytime</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-loading">Loading your wishlist...</div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <h1>Your Wishlist</h1>
        <p>{wishlist.length} {wishlist.length === 1 ? 'destination' : 'destinations'} saved</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="wishlist-empty">
          <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <h2>Your wishlist is empty</h2>
          <p>Explore destinations and add your favorites here</p>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map((destination, index) => (
            <div key={index} className="wishlist-card">
              <div 
                className="wishlist-card-image"
                style={{ backgroundImage: `url(${getDestinationImage(destination.name)})` }}
              />
              <div className="wishlist-card-body">
                <div className="wishlist-card-info">
                  <h3>{destination.name}</h3>
                  <span className="country">{destination.country}</span>
                  {destination.tagline && (
                    <p className="tagline">{destination.tagline}</p>
                  )}
                </div>
                <div className="wishlist-card-actions">
                  <button 
                    className="explore-btn"
                    onClick={() => handleExplore(destination)}
                  >
                    Compare
                  </button>
                  <button 
                    className="remove-btn"
                    onClick={() => handleRemove(destination.name)}
                    title="Remove from wishlist"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
              {destination.added_at && (
                <div className="wishlist-card-date">
                  Added {new Date(destination.added_at).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WishlistPage;
