/* ================================================================
   HomePage — Premium editorial travel landing page
   Split hero + floating glass cards + stats + numbered features
   ================================================================ */

import './HomePage.css';
import { useEffect, useRef, useState } from 'react';

/* ── Destination card data ── */
const DESTINATIONS = [
  {
    emoji: '🗼',
    city: 'Paris',
    country: 'France',
    score: 97,
    tags: ['Culture', 'Cuisine', 'Romance'],
  },
  {
    emoji: '⛩️',
    city: 'Kyoto',
    country: 'Japan',
    score: 94,
    tags: ['Temples', 'Nature', 'Tradition'],
  },
  {
    emoji: '🏔️',
    city: 'Santorini',
    country: 'Greece',
    score: 91,
    tags: ['Islands', 'Views', 'Relaxation'],
  },
];

/* ── Feature data for numbered strip ── */
const FEATURES = [
  {
    num: '01',
    title: 'Smart Comparison',
    desc: 'Compare destinations side-by-side with AI-weighted scoring across climate, cost, culture, and more.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'AI Recommendations',
    desc: 'Get personalized destination picks tailored to your preferences, travel style, and budget.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Custom Itineraries',
    desc: 'Generate detailed day-by-day travel plans with local insights, budgets, and insider tips.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
      </svg>
    ),
  },
];

function HomePage({ onGetStarted }) {
  const cardsRef = useRef([]);
  const [cardsAnimated, setCardsAnimated] = useState(false);

  /* After slide-in animations complete, switch to float animation */
  useEffect(() => {
    const timer = setTimeout(() => setCardsAnimated(true), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="homepage">
      {/* ════════════════════════════════════════════
          HERO SECTION — Split layout
          ════════════════════════════════════════════ */}
      <section className="hp-hero">
        {/* Background: mesh gradient + dot grid */}
        <div className="hp-hero-bg" aria-hidden="true" />

        <div className="hp-hero-inner">
          {/* ── Left: editorial text ── */}
          <div className="hp-hero-left">
            <span className="hp-eyebrow">
              <span className="hp-eyebrow-dot" />
              AI-Powered Travel
            </span>

            <h1 className="hp-headline">
              Discover your
              <br />
              <span className="hp-headline-accent">perfect</span> destination
            </h1>

            <p className="hp-subtitle">
              Compare destinations, get AI-curated recommendations, and craft
              detailed itineraries — all in one beautifully intelligent platform.
            </p>

            <div className="hp-cta-row">
              <button
                className="hp-btn-primary"
                onClick={() => onGetStarted('compare')}
              >
                Start Comparing
                <svg className="hp-btn-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>

              <button
                className="hp-btn-secondary"
                onClick={() => onGetStarted('explore')}
              >
                Explore Destinations
              </button>
            </div>
          </div>

          {/* ── Right: floating destination cards ── */}
          <div className="hp-hero-right">
            {DESTINATIONS.map((dest, i) => (
              <div
                key={dest.city}
                ref={(el) => (cardsRef.current[i] = el)}
                className={`hp-dest-card${cardsAnimated ? ' hp-animated' : ''}`}
              >
                <div className="hp-card-header">
                  <div className="hp-card-icon">{dest.emoji}</div>
                  <div className="hp-card-location">
                    <div className="hp-card-city">{dest.city}</div>
                    <div className="hp-card-country">{dest.country}</div>
                  </div>
                </div>

                <div className="hp-card-score">
                  <span className="hp-score-label">Match Score</span>
                  <span className="hp-score-value">{dest.score}%</span>
                </div>

                <div className="hp-card-tags">
                  {dest.tags.map((tag) => (
                    <span key={tag} className="hp-card-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {/* AI status indicator */}
            <div className="hp-ai-indicator">
              <div className="hp-ai-dot-wrap">
                <div className="hp-ai-dot" />
                <div className="hp-ai-dot-ring" />
              </div>
              <span className="hp-ai-text">
                <strong>AI Engine</strong> — Analyzing 190+ destinations
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          STATS ROW — Social proof
          ════════════════════════════════════════════ */}
      <section className="hp-stats">
        <div className="hp-stat">
          <span className="hp-stat-number">190+</span>
          <span className="hp-stat-label">Destinations</span>
        </div>
        <div className="hp-stat-sep" aria-hidden="true" />
        <div className="hp-stat">
          <span className="hp-stat-number">2.4M</span>
          <span className="hp-stat-label">Itineraries Created</span>
        </div>
        <div className="hp-stat-sep" aria-hidden="true" />
        <div className="hp-stat">
          <span className="hp-stat-number">98%</span>
          <span className="hp-stat-label">Satisfaction</span>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FEATURES STRIP — Numbered 01 / 02 / 03
          ════════════════════════════════════════════ */}
      <section className="hp-features">
        {FEATURES.map((feat) => (
          <div key={feat.num} className="hp-feature">
            <div className="hp-feature-num">{feat.num}</div>
            <div className="hp-feature-icon-wrap">{feat.icon}</div>
            <h3 className="hp-feature-title">{feat.title}</h3>
            <p className="hp-feature-desc">{feat.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default HomePage;
