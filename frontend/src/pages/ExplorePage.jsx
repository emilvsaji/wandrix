import { useState, useEffect } from 'react';
import './ExplorePage.css';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getDestinationImage } from '../utils/images';

function ExplorePage({ onSelectDestination }) {
  const [destinations, setDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [highlights, setHighlights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customSearchResult, setCustomSearchResult] = useState(null);
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

  // Filter existing destinations
  const filteredDestinations = destinations.filter(
    (dest) =>
      dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if search term matches any existing destination
  const searchMatchesExisting = destinations.some(
    (dest) => dest.name.toLowerCase() === searchTerm.toLowerCase().trim()
  );

  // Handle search submit for custom destinations
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmedSearch = searchTerm.trim();
    if (trimmedSearch && !searchMatchesExisting && trimmedSearch.length >= 2) {
      // Capitalize first letter of each word
      const formattedName = trimmedSearch
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      setCustomSearchResult({
        name: formattedName,
        country: 'Explore this destination',
        tagline: 'Discover what awaits you',
        isCustomSearch: true
      });
    }
  };

  // Clear custom search when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setCustomSearchResult(null);
    }
  }, [searchTerm]);

  const handleExplore = async (destination) => {
    setSelectedDestination(destination);
    setIsLoading(true);
    setHighlights(null);

    try {
      const result = await api.getDestinationHighlights(destination.name);
      console.log('API Response:', result); // Debug log
      if (result && !result.error) {
        setHighlights(result);
      } else {
        setHighlights({ error: result?.error || 'Failed to load highlights' });
      }
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

        <form className="search-box" onSubmit={handleSearchSubmit}>
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search any destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm.trim() && !searchMatchesExisting && (
            <button type="submit" className="search-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          )}
        </form>
        {searchTerm.trim() && !searchMatchesExisting && filteredDestinations.length === 0 && !customSearchResult && (
          <p className="search-hint">Press Enter or click the arrow to explore "{searchTerm}"</p>
        )}
      </div>

      {/* Custom Search Result */}
      {customSearchResult && (
        <div className="search-result-section">
          <h2 className="search-result-title">Search Result</h2>
          <div className="search-result-card" onClick={() => handleExplore(customSearchResult)}>
            <div className="search-result-image">
              <img 
                src={getDestinationImage(customSearchResult.name, 800, 400)} 
                alt={customSearchResult.name}
              />
              <div className="search-result-overlay">
                <button 
                  className={`wishlist-btn large ${isInWishlist(customSearchResult.name) ? 'active' : ''}`}
                  onClick={(e) => handleToggleWishlist(e, customSearchResult)}
                  title={isInWishlist(customSearchResult.name) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <svg viewBox="0 0 24 24" fill={isInWishlist(customSearchResult.name) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="search-result-content">
              <h3>{customSearchResult.name}</h3>
              <p className="search-result-tagline">{customSearchResult.tagline}</p>
              <div className="search-result-actions">
                <button className="explore-btn" onClick={() => handleExplore(customSearchResult)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4M12 8h.01"/>
                  </svg>
                  View Details
                </button>
                <button className="compare-btn" onClick={(e) => { e.stopPropagation(); onSelectDestination(customSearchResult.name); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>
                  </svg>
                  Compare
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popular Destinations */}
      {filteredDestinations.length > 0 && (
        <div className="popular-section">
          <h2 className="section-title">{searchTerm ? 'Matching Destinations' : 'Popular Destinations'}</h2>
          <div className="destinations-grid">
            {filteredDestinations.map((dest) => (
              <div
                key={dest.name}
                className="destination-tile"
                onClick={() => handleExplore(dest)}
              >
                <div className="tile-image">
                  <img 
                    src={getDestinationImage(dest.name, 400, 200)} 
                    alt={dest.name}
                loading="lazy"
              />
              <button 
                className={`wishlist-btn ${isInWishlist(dest.name) ? 'active' : ''}`}
                onClick={(e) => handleToggleWishlist(e, dest)}
                title={isInWishlist(dest.name) ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <svg viewBox="0 0 24 24" fill={isInWishlist(dest.name) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>
            <div className="tile-content">
              <h3>{dest.name}</h3>
              <p className="tile-country">{dest.country}</p>
              <p className="tile-tagline">{dest.tagline}</p>
            </div>
          </div>
        ))}
          </div>
        </div>
      )}

      {/* Destination Modal */}
      {selectedDestination && (
        <div className="destination-modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>

            <div className="modal-image">
              <img 
                src={getDestinationImage(selectedDestination.name, 640, 300)} 
                alt={selectedDestination.name}
              />
            </div>

            <div className="modal-header">
              <h2>{selectedDestination.name}</h2>
              <p>{selectedDestination.country}</p>
            </div>

            {isLoading ? (
              <div className="modal-loading">
                <div className="loading-spinner"></div>
                <p>Loading destination highlights...</p>
              </div>
            ) : highlights?.error ? (
              <div className="modal-body">
                <div className="no-highlights">
                  <p>Unable to load destination details. Please try again later.</p>
                </div>
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
              <div className="modal-body">
                {highlights?.tagline && (
                  <p className="highlight-tagline">"{highlights.tagline}"</p>
                )}

                {/* Cultural Highlights */}
                {highlights?.cultural_highlights && (
                  <div className="highlight-section">
                    <h3>Cultural Highlights</h3>
                    {highlights.cultural_highlights.history && (
                      <p className="history">{highlights.cultural_highlights.history}</p>
                    )}
                    {Array.isArray(highlights.cultural_highlights.traditions) && highlights.cultural_highlights.traditions.length > 0 && (
                      <div className="tags">
                        {highlights.cultural_highlights.traditions.map((t, i) => (
                          <span key={i} className="tag">{typeof t === 'string' ? t : t.name || 'Tradition'}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Famous Attractions */}
                {Array.isArray(highlights?.famous_attractions) && highlights.famous_attractions.length > 0 && (
                  <div className="highlight-section">
                    <h3>Famous Attractions</h3>
                    <div className="attractions-list">
                      {highlights.famous_attractions.slice(0, 4).map((attr, i) => (
                        <div key={i} className="attraction-card">
                          <h4>{attr?.name || 'Attraction'}</h4>
                          <p>{attr?.description || ''}</p>
                          {attr?.best_time && (
                            <span className="best-time">{attr.best_time}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Culinary Experiences */}
                {highlights?.culinary_experiences?.must_try_dishes && Array.isArray(highlights.culinary_experiences.must_try_dishes) && highlights.culinary_experiences.must_try_dishes.length > 0 && (
                  <div className="highlight-section">
                    <h3>Culinary Experiences</h3>
                    <div className="dishes">
                      {highlights.culinary_experiences.must_try_dishes.slice(0, 5).map((dish, i) => (
                        <span key={i} className="dish-tag">{typeof dish === 'string' ? dish : dish.name || 'Dish'}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hidden Gems */}
                {Array.isArray(highlights?.hidden_gems) && highlights.hidden_gems.length > 0 && (
                  <div className="highlight-section">
                    <h3>Hidden Gems</h3>
                    <ul className="gems-list">
                      {highlights.hidden_gems.map((gem, i) => (
                        <li key={i}>{typeof gem === 'string' ? gem : gem.name || 'Hidden Gem'}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Local Tips */}
                {Array.isArray(highlights?.local_tips) && highlights.local_tips.length > 0 && (
                  <div className="highlight-section">
                    <h3>Local Tips</h3>
                    <ul className="tips-list">
                      {highlights.local_tips.slice(0, 4).map((tip, i) => (
                        <li key={i}>{typeof tip === 'string' ? tip : tip.tip || 'Tip'}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Show message if no highlights sections rendered */}
                {!highlights?.tagline && !highlights?.cultural_highlights && !highlights?.famous_attractions?.length && (
                  <div className="no-highlights">
                    <p>Explore {selectedDestination.name} - a wonderful destination waiting to be discovered!</p>
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ExplorePage;
