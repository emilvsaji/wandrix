import './HomePage.css';

function HomePage({ onGetStarted }) {
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="hero-eyebrow">AI-Powered Travel Planning</p>
        
        <h1 className="hero-title">
          Find your perfect<br />destination
        </h1>
        
        <p className="hero-subtitle">
          Compare destinations, get personalized recommendations, and create 
          detailed itineraries with AI assistance.
        </p>
        
        <div className="hero-features">
          <div className="feature-item">
            <div className="feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18"/>
              </svg>
            </div>
            <span>Smart Comparison</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <span>AI Recommendations</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
            </div>
            <span>Custom Itineraries</span>
          </div>
        </div>
        
        <div className="hero-actions">
          <button className="btn-primary" onClick={() => onGetStarted('compare')}>
            Start Comparing
          </button>
          <button className="btn-secondary" onClick={() => onGetStarted('explore')}>
            Explore Destinations
          </button>
        </div>
      </div>
    </section>
  );
}

export default HomePage;
