import { useState, useEffect } from 'react';
import './ExplorePage.css';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getDestinationImage } from '../utils/images';

const toArray = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);
const firstString = (...values) => values.find((v) => typeof v === 'string' && v.trim())?.trim() || '';

const parseCoordinates = (value) => {
  if (!value) return null;

  if (Array.isArray(value) && value.length >= 2) {
    const lat = Number(value[0]);
    const lng = Number(value[1]);
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) return { lat, lng };
  }

  if (typeof value === 'object') {
    const lat = Number(value.lat ?? value.latitude);
    const lng = Number(value.lng ?? value.lon ?? value.longitude);
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) return { lat, lng };
  }

  return null;
};

const normalizeAttraction = (item) => {
  if (!item) return null;

  if (typeof item === 'string') {
    return {
      name: item,
      description: '',
      entryFee: '',
      timings: '',
      distance: '',
    };
  }

  return {
    name: firstString(item.name, item.title, 'Attraction'),
    description: firstString(item.description, item.overview),
    entryFee: firstString(item.entry_fee, item.fee),
    timings: firstString(item.timings, item.opening_hours),
    distance: firstString(item.distance_from_main_place, item.distance),
  };
};

const normalizeNearbyPlace = (item) => {
  if (!item) return null;

  if (typeof item === 'string') {
    return { name: item, distance: '', travelTime: '' };
  }

  return {
    name: firstString(item.name, item.place, 'Nearby Place'),
    distance: firstString(item.distance),
    travelTime: firstString(item.travel_time, item.time),
  };
};

const normalizePlaceDetails = (destination, info, highlights) => {
  const attractions = [...toArray(info?.top_attractions), ...toArray(highlights?.famous_attractions)]
    .map(normalizeAttraction)
    .filter(Boolean)
    .slice(0, 8);

  const keyHighlights = [
    ...toArray(highlights?.exclusive_experiences),
    ...toArray(highlights?.hidden_gems),
    ...toArray(highlights?.cultural_highlights?.traditions),
    ...attractions.map((a) => a.name),
  ]
    .map((item) => (typeof item === 'string' ? item : item?.name || item?.title || ''))
    .filter(Boolean)
    .slice(0, 6);

  const thingsToDo = [...toArray(info?.unique_experiences), ...toArray(highlights?.exclusive_experiences)]
    .map((item) => (typeof item === 'string' ? item : item?.name || item?.activity || ''))
    .filter(Boolean)
    .slice(0, 8);

  const localFood = [...toArray(info?.local_cuisine), ...toArray(info?.cuisine), ...toArray(highlights?.culinary_experiences?.must_try_dishes)]
    .map((item) => (typeof item === 'string' ? item : item?.name || item?.dish || ''))
    .filter(Boolean)
    .slice(0, 10);

  const travelTips = [...toArray(highlights?.local_tips), ...toArray(info?.travel_tips)]
    .map((item) => (typeof item === 'string' ? item : item?.tip || item?.note || ''))
    .filter(Boolean)
    .slice(0, 8);

  const seasonalBreakdown = toArray(
    info?.best_time_to_visit?.seasonal_breakdown || info?.seasonal_breakdown || info?.best_seasons,
  )
    .map((item) => (typeof item === 'string' ? item : firstString(item.season, item.name, item.period, item.details)))
    .filter(Boolean)
    .slice(0, 6);

  return {
    placeName: firstString(info?.name, destination.name),
    shortDescription: firstString(info?.description, highlights?.tagline),
    category: firstString(info?.category, info?.destination_type),
    locationState: firstString(info?.state, info?.region, info?.location?.state),
    locationCountry: firstString(info?.country, destination.country),
    coordinates: parseCoordinates(info?.coordinates || info?.location?.coordinates || info?.map_coordinates),
    galleryImages: [
      getDestinationImage(destination.name, 1200, 600),
      getDestinationImage(`${destination.name}-landmark`, 800, 500),
      getDestinationImage(`${destination.name}-street`, 800, 500),
      getDestinationImage(`${destination.name}-culture`, 800, 500),
    ],
    keyHighlights,
    attractions,
    thingsToDo,
    seasonalBreakdown,
    weatherInfo: firstString(info?.weather, info?.climate, info?.best_time_to_visit?.weather_info),
    howToReach: {
      airport: firstString(info?.how_to_reach?.nearest_airport, info?.nearest_airport, info?.transport?.airport),
      airportDistance: firstString(info?.how_to_reach?.airport_distance, info?.airport_distance),
      railway: firstString(info?.how_to_reach?.nearest_railway_station, info?.nearest_railway_station, info?.transport?.railway),
      road: firstString(info?.how_to_reach?.road_connectivity, info?.road_connectivity, info?.transport?.road, info?.accessibility),
    },
    accommodation: {
      luxury: firstString(info?.accommodation_options?.luxury, info?.estimated_daily_cost?.luxury),
      midRange: firstString(info?.accommodation_options?.mid_range, info?.estimated_daily_cost?.mid_range),
      budget: firstString(info?.accommodation_options?.budget, info?.estimated_daily_cost?.budget),
      averagePriceRange: firstString(info?.accommodation_options?.average_price_range, info?.estimated_daily_cost?.average_price_range),
    },
    localFood,
    travelTips,
    nearbyPlaces: toArray(info?.nearby_places).map(normalizeNearbyPlace).filter(Boolean).slice(0, 8),
    itinerary1Day: toArray(info?.suggested_itinerary?.one_day || info?.itinerary?.one_day)
      .map((item) => (typeof item === 'string' ? item : firstString(item.time, item.activity, item.plan)))
      .filter(Boolean)
      .slice(0, 6),
    itinerary2Day: toArray(info?.suggested_itinerary?.two_day || info?.itinerary?.two_day)
      .map((item) => (typeof item === 'string' ? item : firstString(item.time, item.activity, item.plan)))
      .filter(Boolean)
      .slice(0, 10),
  };
};

function ExplorePage({ onSelectDestination }) {
  const [destinations, setDestinations] = useState([]);
  const [destinationsError, setDestinationsError] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [highlights, setHighlights] = useState(null);
  const [destinationInfo, setDestinationInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customSearchResult, setCustomSearchResult] = useState(null);
  const { user, isInWishlist, addToWishlist, removeFromWishlist } = useAuth();

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
    const loadDestinations = async () => {
      try {
        const data = await api.getPopularDestinations();
        const fromApi = data?.destinations || [];
        setDestinations(fromApi.length ? fromApi : defaultDestinations);
      } catch {
        setDestinations(defaultDestinations);
        setDestinationsError('Unable to load destinations from database. Showing local list.');
      }
    };

    loadDestinations();
  }, []);

  const filteredDestinations = destinations.filter(
    (dest) =>
      dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const searchMatchesExisting = destinations.some(
    (dest) => dest.name.toLowerCase() === searchTerm.toLowerCase().trim(),
  );

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmedSearch = searchTerm.trim();
    if (trimmedSearch && !searchMatchesExisting && trimmedSearch.length >= 2) {
      const formattedName = trimmedSearch
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      setCustomSearchResult({
        name: formattedName,
        country: 'Explore this destination',
        tagline: 'Discover what awaits you',
        isCustomSearch: true,
      });
    }
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      setCustomSearchResult(null);
    }
  }, [searchTerm]);

  const handleExplore = async (destination) => {
    setSelectedDestination(destination);
    setDestinationInfo(null);
    setHighlights(null);
    setIsLoading(true);

    try {
      const [infoResult, highlightsResult] = await Promise.allSettled([
        api.getDestinationInfo(destination.name),
        api.getDestinationHighlights(destination.name),
      ]);

      if (infoResult.status === 'fulfilled') setDestinationInfo(infoResult.value || {});
      if (highlightsResult.status === 'fulfilled') setHighlights(highlightsResult.value || {});

      if (infoResult.status === 'rejected' && highlightsResult.status === 'rejected') {
        const errMsg = highlightsResult.reason?.message || infoResult.reason?.message || 'Failed to load place details';
        setHighlights({ error: errMsg });
      }
    } catch (error) {
      setHighlights({ error: error.message || 'Failed to load place details' });
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedDestination(null);
    setDestinationInfo(null);
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

  const details = selectedDestination
    ? normalizePlaceDetails(selectedDestination, destinationInfo || {}, highlights || {})
    : null;

  const hasCoordinates = Boolean(details?.coordinates);
  const hasHowToReach = Boolean(details?.howToReach.airport || details?.howToReach.railway || details?.howToReach.road);
  const hasAccommodation = Boolean(
    details?.accommodation.luxury ||
    details?.accommodation.midRange ||
    details?.accommodation.budget ||
    details?.accommodation.averagePriceRange,
  );

  return (
    <div className="explore-page">
      <div className="explore-header">
        <h1>Explore Destinations</h1>
        <p>Discover amazing places around the world</p>
        {destinationsError && <p className="search-hint">{destinationsError}</p>}

        <form className="search-box" onSubmit={handleSearchSubmit}>
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
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
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </form>

        {searchTerm.trim() && !searchMatchesExisting && filteredDestinations.length === 0 && !customSearchResult && (
          <p className="search-hint">Press Enter or click the arrow to explore "{searchTerm}"</p>
        )}
      </div>

      {customSearchResult && (
        <div className="search-result-section">
          <h2 className="search-result-title">Search Result</h2>
          <div className="search-result-card" onClick={() => handleExplore(customSearchResult)}>
            <div className="search-result-image">
              <img src={getDestinationImage(customSearchResult.name, 800, 400)} alt={customSearchResult.name} />
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
                <button className="explore-btn" onClick={() => handleExplore(customSearchResult)}>View Details</button>
                <button className="compare-btn" onClick={(e) => { e.stopPropagation(); onSelectDestination(customSearchResult.name); }}>Compare</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredDestinations.length > 0 && (
        <div className="popular-section">
          <h2 className="section-title">{searchTerm ? 'Matching Destinations' : 'Popular Destinations'}</h2>
          <div className="destinations-grid">
            {filteredDestinations.map((dest) => (
              <div key={dest.name} className="destination-tile" onClick={() => handleExplore(dest)}>
                <div className="tile-image">
                  <img src={getDestinationImage(dest.name, 400, 200)} alt={dest.name} loading="lazy" />
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

      {selectedDestination && (
        <div className="destination-modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="modal-image">
              <img src={getDestinationImage(selectedDestination.name, 640, 300)} alt={selectedDestination.name} />
            </div>

            <div className="modal-header">
              <h2>{details.placeName}</h2>
              <p>{[details.locationState, details.locationCountry].filter(Boolean).join(', ') || selectedDestination.country}</p>
            </div>

            {isLoading ? (
              <div className="modal-loading">
                <div className="loading-spinner"></div>
                <p>Loading destination details...</p>
              </div>
            ) : highlights?.error ? (
              <div className="modal-body">
                <div className="no-highlights">
                  <p>Unable to load destination details. Please try again later.</p>
                </div>
              </div>
            ) : (
              <div className="modal-body place-details">
                {details.shortDescription && (
                  <section className="details-section">
                    <h3>Short Description</h3>
                    <p className="details-paragraph">{details.shortDescription}</p>
                  </section>
                )}

                {(details.category || details.locationCountry || details.locationState) && (
                  <section className="details-section compact-meta">
                    {details.category && <span className="meta-chip">Category: {details.category}</span>}
                    {(details.locationState || details.locationCountry) && (
                      <span className="meta-chip">Location: {[details.locationState, details.locationCountry].filter(Boolean).join(', ')}</span>
                    )}
                  </section>
                )}

                {hasCoordinates && (
                  <section className="details-section">
                    <h3>Map View</h3>
                    <p className="details-subtext">Coordinates: {details.coordinates.lat.toFixed(4)}, {details.coordinates.lng.toFixed(4)}</p>
                    <div className="map-wrap">
                      <iframe
                        title={`${details.placeName} map`}
                        loading="lazy"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${details.coordinates.lng - 0.12}%2C${details.coordinates.lat - 0.08}%2C${details.coordinates.lng + 0.12}%2C${details.coordinates.lat + 0.08}&layer=mapnik&marker=${details.coordinates.lat}%2C${details.coordinates.lng}`}
                      />
                    </div>
                  </section>
                )}

                {details.galleryImages.length > 0 && (
                  <section className="details-section">
                    <h3>Image Gallery</h3>
                    <div className="gallery-grid">
                      {details.galleryImages.map((src, index) => (
                        <img key={`${src}-${index}`} src={src} alt={`${details.placeName} view ${index + 1}`} loading="lazy" />
                      ))}
                    </div>
                  </section>
                )}

                {details.keyHighlights.length > 0 && (
                  <section className="details-section">
                    <h3>Key Highlights</h3>
                    <ul className="details-list">
                      {details.keyHighlights.map((item, index) => (
                        <li key={`${item}-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {details.attractions.length > 0 && (
                  <section className="details-section">
                    <h3>Top Attractions</h3>
                    <div className="attractions-list">
                      {details.attractions.map((attr, index) => (
                        <div key={`${attr.name}-${index}`} className="attraction-card">
                          <h4>{attr.name}</h4>
                          {attr.description && <p>{attr.description}</p>}
                          <div className="attraction-meta">
                            {attr.entryFee && <span>Entry: {attr.entryFee}</span>}
                            {attr.timings && <span>Timings: {attr.timings}</span>}
                            {attr.distance && <span>Distance: {attr.distance}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {details.thingsToDo.length > 0 && (
                  <section className="details-section">
                    <h3>Things To Do</h3>
                    <ul className="details-list">
                      {details.thingsToDo.map((item, index) => (
                        <li key={`${item}-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {(details.seasonalBreakdown.length > 0 || details.weatherInfo) && (
                  <section className="details-section">
                    <h3>Best Time to Visit</h3>
                    {details.seasonalBreakdown.length > 0 && (
                      <ul className="details-list">
                        {details.seasonalBreakdown.map((item, index) => (
                          <li key={`${item}-${index}`}>{item}</li>
                        ))}
                      </ul>
                    )}
                    {details.weatherInfo && <p className="details-subtext">Weather: {details.weatherInfo}</p>}
                  </section>
                )}

                {hasHowToReach && (
                  <section className="details-section">
                    <h3>How to Reach</h3>
                    <div className="reach-grid">
                      {details.howToReach.airport && (
                        <div className="info-card">
                          <h4>Nearest Airport</h4>
                          <p>{details.howToReach.airport}</p>
                          {details.howToReach.airportDistance && <span>{details.howToReach.airportDistance}</span>}
                        </div>
                      )}
                      {details.howToReach.railway && (
                        <div className="info-card">
                          <h4>Nearest Railway Station</h4>
                          <p>{details.howToReach.railway}</p>
                        </div>
                      )}
                      {details.howToReach.road && (
                        <div className="info-card">
                          <h4>Road Connectivity</h4>
                          <p>{details.howToReach.road}</p>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {hasAccommodation && (
                  <section className="details-section">
                    <h3>Accommodation Options</h3>
                    <div className="reach-grid">
                      {details.accommodation.luxury && (
                        <div className="info-card">
                          <h4>Luxury</h4>
                          <p>{details.accommodation.luxury}</p>
                        </div>
                      )}
                      {details.accommodation.midRange && (
                        <div className="info-card">
                          <h4>Mid-range</h4>
                          <p>{details.accommodation.midRange}</p>
                        </div>
                      )}
                      {details.accommodation.budget && (
                        <div className="info-card">
                          <h4>Budget</h4>
                          <p>{details.accommodation.budget}</p>
                        </div>
                      )}
                      {details.accommodation.averagePriceRange && (
                        <div className="info-card">
                          <h4>Average Price Range</h4>
                          <p>{details.accommodation.averagePriceRange}</p>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {details.localFood.length > 0 && (
                  <section className="details-section">
                    <h3>Local Food / Cuisine Highlights</h3>
                    <div className="dishes">
                      {details.localFood.map((dish, index) => (
                        <span key={`${dish}-${index}`} className="dish-tag">{dish}</span>
                      ))}
                    </div>
                  </section>
                )}

                {details.travelTips.length > 0 && (
                  <section className="details-section">
                    <h3>Travel Tips</h3>
                    <ul className="details-list">
                      {details.travelTips.map((tip, index) => (
                        <li key={`${tip}-${index}`}>{tip}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {details.nearbyPlaces.length > 0 && (
                  <section className="details-section">
                    <h3>Nearby Places</h3>
                    <div className="nearby-list">
                      {details.nearbyPlaces.map((item, index) => (
                        <div key={`${item.name}-${index}`} className="nearby-item">
                          <h4>{item.name}</h4>
                          <p>{[item.distance, item.travelTime].filter(Boolean).join(' • ') || 'Distance info not available'}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {(details.itinerary1Day.length > 0 || details.itinerary2Day.length > 0) && (
                  <section className="details-section">
                    <h3>Suggested Itinerary</h3>
                    <div className="itinerary-wrap">
                      {details.itinerary1Day.length > 0 && (
                        <div className="itinerary-card">
                          <h4>1-Day Plan</h4>
                          <ul className="details-list">
                            {details.itinerary1Day.map((item, index) => (
                              <li key={`${item}-${index}`}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {details.itinerary2Day.length > 0 && (
                        <div className="itinerary-card">
                          <h4>2-Day Plan</h4>
                          <ul className="details-list">
                            {details.itinerary2Day.map((item, index) => (
                              <li key={`${item}-${index}`}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {!details.shortDescription && details.keyHighlights.length === 0 && details.attractions.length === 0 && details.thingsToDo.length === 0 && (
                  <div className="no-highlights">
                    <p>Explore {selectedDestination.name} — destination details will appear when available.</p>
                  </div>
                )}

                <div className="modal-actions">
                  <button
                    className={`action-btn wishlist-action ${isInWishlist(selectedDestination.name) ? 'active' : ''}`}
                    onClick={() => handleToggleWishlist({ stopPropagation: () => {} }, selectedDestination)}
                  >
                    {isInWishlist(selectedDestination.name) ? 'In Wishlist' : 'Add to Wishlist'}
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
