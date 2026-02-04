import { useState, useEffect } from 'react';
import './ExplorePage.css';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function ExplorePage({ onSelectDestination }) {
  const [destinations, setDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [highlights, setHighlights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, isInWishlist, addToWishlist, removeFromWishlist } = useAuth();

  // Default destinations for display
  const defaultDestinations = [
    { name: 'Paris', country: 'France', tagline: 'City of Love' },
    { name: 'Tokyo', country: 'Japan', tagline: 'Where Tradition Meets Future' },
    { name: 'Bali', country: 'Indonesia', tagline: 'Island of Gods' },
    { name: 'New York', country: 'USA', tagline: 'The City That Never Sleeps' },
    { name: 'Rome', country: 'Italy', tagline: 'Eternal City' },
    { name: 'Dubai', country: 'UAE', tagline: 'City of Gold' },
    { name: 'Sydney', country: 'Australia', tagline: 'Harbor City' },
    { name: 'Maldives', country: 'Maldives', tagline: 'Paradise on Earth' },
    { name: 'Barcelona', country: 'Spain', tagline: 'City of Gaudi' },
    { name: 'Singapore', country: 'Singapore', tagline: 'Garden City' },
    { name: 'London', country: 'UK', tagline: 'The Great Wen' },
    { name: 'Santorini', country: 'Greece', tagline: 'Jewel of the Aegean' },
  ];

  useEffect(() => {
    setDestinations(defaultDestinations);
  }, []);

  const filteredDestinations = destinations.filter(
    (dest) =>
      dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExplore = async (destination) => {
    setSelectedDestination(destination);
    setIsLoading(true);
    setHighlights(null);

    try {
      const result = await api.getDestinationHighlights(destination.name);
      setHighlights(result);
    } catch (error) {
      console.error('Error fetching highlights:', error);
      setHighlights({ error: 'Failed to load highlights' });
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedDestination(null);
    setHighlights(null);
  };

  const handleToggleWishlist = async (e, destination) => {
    e.stopPropagation();
    if (!user) {
      alert('Please sign in to add destinations to your wishlist');
      return;
    }
    
    if (isInWishlist(destination.name)) {
      await removeFromWishlist(destination.name);
    } else {
      await addToWishlist(destination);
    }
  };

  return (
    <div className="explore-page">
      <div className="explore-header">
        <h1>Explore Destinations</h1>
        <p>Discover amazing places around the world</p>

        <div className="search-box">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search destinations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="destinations-grid">
        {filteredDestinations.map((dest) => (
          <div
            key={dest.name}
            className="destination-tile"
            onClick={() => handleExplore(dest)}
          >
            <button 
              className={`wishlist-btn ${isInWishlist(dest.name) ? 'active' : ''}`}
              onClick={(e) => handleToggleWishlist(e, dest)}
              title={isInWishlist(dest.name) ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <svg viewBox="0 0 24 24" fill={isInWishlist(dest.name) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            <div className="tile-content">
              <h3>{dest.name}</h3>
              <p className="tile-country">{dest.country}</p>
              <p className="tile-tagline">{dest.tagline}</p>
            </div>
            <span className="explore-arrow">→</span>
          </div>
        ))}
      </div>

      {/* Destination Modal */}
      {selectedDestination && (
        <div className="destination-modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>

            <div className="modal-header">
              <h2>{selectedDestination.name}</h2>
              <p>{selectedDestination.country}</p>
            </div>

            {isLoading ? (
              <div className="modal-loading">
                <div className="loading-spinner"></div>
                <p>Loading destination highlights...</p>
              </div>
            ) : highlights && !highlights.error ? (
              <div className="modal-body">
                {highlights.tagline && (
                  <p className="highlight-tagline">"{highlights.tagline}"</p>
                )}

                {/* Cultural Highlights */}
                {highlights.cultural_highlights && (
                  <div className="highlight-section">
                    <h3>Cultural Highlights</h3>
                    {highlights.cultural_highlights.history && (
                      <p className="history">{highlights.cultural_highlights.history}</p>
                    )}
                    {highlights.cultural_highlights.traditions && (
                      <div className="tags">
                        {highlights.cultural_highlights.traditions.map((t, i) => (
                          <span key={i} className="tag">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Famous Attractions */}
                {highlights.famous_attractions && highlights.famous_attractions.length > 0 && (
                  <div className="highlight-section">
                    <h3>Famous Attractions</h3>
                    <div className="attractions-list">
                      {highlights.famous_attractions.slice(0, 4).map((attr, i) => (
                        <div key={i} className="attraction-card">
                          <h4>{attr.name}</h4>
                          <p>{attr.description}</p>
                          {attr.best_time && (
                            <span className="best-time">{attr.best_time}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Culinary Experiences */}
                {highlights.culinary_experiences && (
                  <div className="highlight-section">
                    <h3>Culinary Experiences</h3>
                    {highlights.culinary_experiences.must_try_dishes && (
                      <div className="dishes">
                        {highlights.culinary_experiences.must_try_dishes.slice(0, 5).map((dish, i) => (
                          <span key={i} className="dish-tag">{dish}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Hidden Gems */}
                {highlights.hidden_gems && highlights.hidden_gems.length > 0 && (
                  <div className="highlight-section">
                    <h3>Hidden Gems</h3>
                    <ul className="gems-list">
                      {highlights.hidden_gems.map((gem, i) => (
                        <li key={i}>{gem}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Local Tips */}
                {highlights.local_tips && highlights.local_tips.length > 0 && (
                  <div className="highlight-section">
                    <h3>Local Tips</h3>
                    <ul className="tips-list">
                      {highlights.local_tips.slice(0, 4).map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="modal-actions">
                  <button
                    className={`action-btn wishlist-action ${isInWishlist(selectedDestination.name) ? 'active' : ''}`}
                    onClick={() => handleToggleWishlist({ stopPropagation: () => {} }, selectedDestination)}
                  >
                    {isInWishlist(selectedDestination.name) ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        In Wishlist
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        Add to Wishlist
                      </>
                    )}
                  </button>
                  <button
                    className="action-btn primary"
                    onClick={() => {
                      closeModal();
                      onSelectDestination(selectedDestination.name);
                    }}
                  >
                    Compare This Destination
                  </button>
                </div>
              </div>
            ) : (
              <div className="modal-error">
                <p>Unable to load destination highlights. Please try again.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ExplorePage;
