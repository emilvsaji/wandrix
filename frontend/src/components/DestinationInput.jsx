import { useState } from 'react';
import './DestinationInput.css';

const popularDestinations = [
  { name: 'Paris', country: 'France' },
  { name: 'Tokyo', country: 'Japan' },
  { name: 'Bali', country: 'Indonesia' },
  { name: 'New York', country: 'USA' },
  { name: 'Rome', country: 'Italy' },
  { name: 'Dubai', country: 'UAE' },
  { name: 'Sydney', country: 'Australia' },
  { name: 'Maldives', country: 'Maldives' },
  { name: 'Barcelona', country: 'Spain' },
  { name: 'Singapore', country: 'Singapore' },
  { name: 'London', country: 'UK' },
  { name: 'Santorini', country: 'Greece' },
];

function DestinationInput({ label, value, onChange, otherValue }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDestinations = popularDestinations.filter(
    (dest) =>
      dest.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      dest.name.toLowerCase() !== otherValue?.toLowerCase()
  );

  const handleSelect = (destination) => {
    onChange(destination.name);
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    onChange(val);
    setShowSuggestions(true);
  };

  return (
    <div className="destination-input">
      <label className="input-label">{label}</label>
      
      <div className="input-wrapper">
        <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Enter destination..."
          className="destination-text-input"
        />
      </div>

      {showSuggestions && (
        <div className="suggestions-dropdown">
          <div className="suggestions-header">Popular Destinations</div>
          <div className="suggestions-list">
            {filteredDestinations.slice(0, 6).map((dest) => (
              <button
                key={dest.name}
                type="button"
                className="suggestion-item"
                onClick={() => handleSelect(dest)}
              >
                <div className="suggestion-info">
                  <span className="suggestion-name">{dest.name}</span>
                  <span className="suggestion-country">{dest.country}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick select chips */}
      <div className="quick-select">
        {popularDestinations
          .filter((d) => d.name.toLowerCase() !== otherValue?.toLowerCase())
          .slice(0, 4)
          .map((dest) => (
            <button
              key={dest.name}
              type="button"
              className={`quick-chip ${value === dest.name ? 'selected' : ''}`}
              onClick={() => handleSelect(dest)}
            >
              {dest.name}
            </button>
          ))}
      </div>
    </div>
  );
}

export default DestinationInput;
