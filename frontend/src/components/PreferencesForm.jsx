import { useState } from 'react';
import './PreferencesForm.css';

function PreferencesForm({ preferences, setPreferences, onSubmit, isLoading }) {
  const budgetOptions = [
    { value: 'budget', label: 'Budget', desc: 'Cost-conscious' },
    { value: 'medium', label: 'Mid-Range', desc: 'Balanced' },
    { value: 'high', label: 'Premium', desc: 'Comfort first' },
    { value: 'luxury', label: 'Luxury', desc: 'No limits' },
  ];

  const interestOptions = [
    { value: 'adventure', label: 'Adventure' },
    { value: 'culture', label: 'Culture' },
    { value: 'nature', label: 'Nature' },
    { value: 'food', label: 'Food' },
    { value: 'history', label: 'History' },
    { value: 'beach', label: 'Beach' },
    { value: 'nightlife', label: 'Nightlife' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'wellness', label: 'Wellness' },
    { value: 'photography', label: 'Photography' },
  ];

  const seasonOptions = [
    { value: 'spring', label: 'Spring' },
    { value: 'summer', label: 'Summer' },
    { value: 'fall', label: 'Fall' },
    { value: 'winter', label: 'Winter' },
  ];

  const travelTypeOptions = [
    { value: 'solo', label: 'Solo' },
    { value: 'couple', label: 'Couple' },
    { value: 'family', label: 'Family' },
    { value: 'group', label: 'Group' },
  ];

  const toggleInterest = (interest) => {
    const currentInterests = preferences.interests || [];
    if (currentInterests.includes(interest)) {
      setPreferences({
        ...preferences,
        interests: currentInterests.filter((i) => i !== interest),
      });
    } else {
      setPreferences({
        ...preferences,
        interests: [...currentInterests, interest],
      });
    }
  };

  return (
    <div className="preferences-form">
      <h3 className="form-title">Travel Preferences</h3>

      {/* Budget Selection */}
      <div className="form-section">
        <label className="section-label">Budget Level</label>
        <div className="option-grid budget-grid">
          {budgetOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`option-card ${preferences.budget === option.value ? 'selected' : ''}`}
              onClick={() => setPreferences({ ...preferences, budget: option.value })}
            >
              <span className="option-label">{option.label}</span>
              <span className="option-desc">{option.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="form-section">
        <label className="section-label">Trip Duration</label>
        <div className="duration-input">
          <button
            type="button"
            className="duration-btn"
            onClick={() =>
              setPreferences({
                ...preferences,
                travel_duration: Math.max(1, (preferences.travel_duration || 7) - 1),
              })
            }
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14"/>
            </svg>
          </button>
          <div className="duration-display">
            <span className="duration-number">{preferences.travel_duration || 7}</span>
            <span className="duration-label">days</span>
          </div>
          <button
            type="button"
            className="duration-btn"
            onClick={() =>
              setPreferences({
                ...preferences,
                travel_duration: Math.min(30, (preferences.travel_duration || 7) + 1),
              })
            }
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Interests */}
      <div className="form-section">
        <label className="section-label">Your Interests</label>
        <div className="interests-grid">
          {interestOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`interest-chip ${
                (preferences.interests || []).includes(option.value) ? 'selected' : ''
              }`}
              onClick={() => toggleInterest(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Season */}
      <div className="form-section">
        <label className="section-label">Preferred Season</label>
        <div className="option-grid season-grid">
          {seasonOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`option-card small ${preferences.season === option.value ? 'selected' : ''}`}
              onClick={() => setPreferences({ ...preferences, season: option.value })}
            >
              <span className="option-label">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Travel Type */}
      <div className="form-section">
        <label className="section-label">Travel Type</label>
        <div className="option-grid travel-grid">
          {travelTypeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`option-card small ${preferences.travel_type === option.value ? 'selected' : ''}`}
              onClick={() => setPreferences({ ...preferences, travel_type: option.value })}
            >
              <span className="option-label">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="button"
        className={`submit-btn ${isLoading ? 'loading' : ''}`}
        onClick={onSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="spinner"></span>
            Analyzing...
          </>
        ) : (
          'Get AI Recommendation'
        )}
      </button>
    </div>
  );
}

export default PreferencesForm;
