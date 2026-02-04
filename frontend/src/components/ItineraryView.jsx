import './ItineraryView.css';

function ItineraryView({ itinerary, onBack }) {
  if (!itinerary || itinerary.error) {
    return (
      <div className="itinerary-error">
        <p>Unable to generate journey schedule. Please try again.</p>
        <button className="back-btn" onClick={onBack}>← Go Back</button>
      </div>
    );
  }

  return (
    <div className="itinerary-view">
      {/* Header */}
      <div className="itinerary-header">
        <button className="back-btn" onClick={onBack}>← Back to Compare</button>
        
        <div className="header-content">
          <h1 className="itinerary-title">
            Your {itinerary.duration_days}-Day {itinerary.destination} Adventure
          </h1>
          <p className="itinerary-overview">{itinerary.overview}</p>
          
          <div className="header-info">
            <div className="info-badge">
              <span className="badge-label">Location</span>
              <span className="badge-value">{itinerary.destination}</span>
            </div>
            <div className="info-badge">
              <span className="badge-label">Duration</span>
              <span className="badge-value">{itinerary.duration_days} Days</span>
            </div>
            <div className="info-badge">
              <span className="badge-label">Est. Cost</span>
              <span className="badge-value">{itinerary.total_estimated_cost}</span>
            </div>
            {itinerary.best_time_to_visit && (
              <div className="info-badge">
                <span className="badge-label">Best Time</span>
                <span className="badge-value">{itinerary.best_time_to_visit}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Days Timeline */}
      <div className="days-section">
        <h2 className="section-title">Day-by-Day Journey Schedule</h2>
        
        <div className="timeline">
          {(itinerary.days || []).map((day, idx) => (
            <div key={idx} className="day-card">
              <div className="day-marker">
                <span className="day-number">{day.day_number || idx + 1}</span>
              </div>
              
              <div className="day-content">
                <h3 className="day-title">{day.title}</h3>
                
                <div className="activities">
                  {/* Morning */}
                  <div className="activity morning">
                    <div className="activity-time">
                      <span className="time-label">Morning</span>
                    </div>
                    <div className="activity-details">
                      <h4>{day.morning?.activity || day.morning}</h4>
                      {day.morning?.location && (
                        <p className="location">{day.morning.location}</p>
                      )}
                      {day.morning?.tips && (
                        <p className="tip">{day.morning.tips}</p>
                      )}
                    </div>
                  </div>

                  {/* Afternoon */}
                  <div className="activity afternoon">
                    <div className="activity-time">
                      <span className="time-label">Afternoon</span>
                    </div>
                    <div className="activity-details">
                      <h4>{day.afternoon?.activity || day.afternoon}</h4>
                      {day.afternoon?.location && (
                        <p className="location">{day.afternoon.location}</p>
                      )}
                      {day.afternoon?.tips && (
                        <p className="tip">{day.afternoon.tips}</p>
                      )}
                    </div>
                  </div>

                  {/* Evening */}
                  <div className="activity evening">
                    <div className="activity-time">
                      <span className="time-label">Evening</span>
                    </div>
                    <div className="activity-details">
                      <h4>{day.evening?.activity || day.evening}</h4>
                      {day.evening?.location && (
                        <p className="location">{day.evening.location}</p>
                      )}
                      {day.evening?.tips && (
                        <p className="tip">{day.evening.tips}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Meals */}
                {day.meals && (
                  <div className="meals">
                    <h4>Meal Recommendations</h4>
                    <div className="meals-grid">
                      {day.meals.breakfast && (
                        <div className="meal-item">
                          <span className="meal-type">Breakfast</span>
                          <span className="meal-rec">{day.meals.breakfast}</span>
                        </div>
                      )}
                      {day.meals.lunch && (
                        <div className="meal-item">
                          <span className="meal-type">Lunch</span>
                          <span className="meal-rec">{day.meals.lunch}</span>
                        </div>
                      )}
                      {day.meals.dinner && (
                        <div className="meal-item">
                          <span className="meal-type">Dinner</span>
                          <span className="meal-rec">{day.meals.dinner}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {day.estimated_daily_cost && (
                  <div className="day-cost">
                    Estimated: {day.estimated_daily_cost}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <div className="additional-info">
        {/* Packing List */}
        {itinerary.packing_list && itinerary.packing_list.length > 0 && (
          <div className="info-card">
            <h3>Packing List</h3>
            <div className="checklist">
              {itinerary.packing_list.map((item, idx) => (
                <label key={idx} className="check-item">
                  <input type="checkbox" />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Important Tips */}
        {itinerary.important_tips && itinerary.important_tips.length > 0 && (
          <div className="info-card">
            <h3>Important Tips</h3>
            <ul className="tips-list">
              {itinerary.important_tips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Local Phrases */}
        {itinerary.local_phrases && itinerary.local_phrases.length > 0 && (
          <div className="info-card">
            <h3>Useful Local Phrases</h3>
            <div className="phrases-list">
              {itinerary.local_phrases.map((phrase, idx) => (
                <div key={idx} className="phrase-item">
                  <span className="phrase">{phrase.phrase}</span>
                  <span className="meaning">{phrase.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emergency Contacts */}
        {itinerary.emergency_contacts && (
          <div className="info-card emergency">
            <h3>Emergency Contacts</h3>
            <div className="contacts-grid">
              {itinerary.emergency_contacts.police && (
                <div className="contact-item">
                  <span className="contact-type">🚔 Police</span>
                  <span className="contact-number">{itinerary.emergency_contacts.police}</span>
                </div>
              )}
              {itinerary.emergency_contacts.ambulance && (
                <div className="contact-item">
                  <span className="contact-type">🚑 Ambulance</span>
                  <span className="contact-number">{itinerary.emergency_contacts.ambulance}</span>
                </div>
              )}
              {itinerary.emergency_contacts.tourist_helpline && (
                <div className="contact-item">
                  <span className="contact-type">📞 Tourist Help</span>
                  <span className="contact-number">{itinerary.emergency_contacts.tourist_helpline}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Print/Save Actions */}
      <div className="itinerary-actions">
        <button className="action-btn" onClick={() => window.print()}>
          🖨️ Print Itinerary
        </button>
        <button className="action-btn secondary" onClick={onBack}>
          🔄 Compare Other Destinations
        </button>
      </div>
    </div>
  );
}

export default ItineraryView;
