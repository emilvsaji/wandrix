import './AboutPage.css';

const PILLARS = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    title: 'Global Reach',
    desc: 'Continuously expanding coverage with real-time destination data from around the world.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
      </svg>
    ),
    title: 'AI at the Core',
    desc: 'Every recommendation is powered by advanced algorithms that understand your unique travel style.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: 'Community Driven',
    desc: 'Built by travelers, for travelers — shaped by real feedback and millions of itineraries.',
  },
];

const VALUES = [
  {
    num: '01',
    title: 'Intelligent Discovery',
    desc: 'Our AI doesn\'t just list destinations — it understands your travel personality and finds places that truly resonate with you.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
        <path d="M11 8v6M8 11h6" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Unbiased Comparison',
    desc: 'We analyze real data across climate, cost, culture, safety, and more — giving you transparent, side-by-side insights.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M7 16l4-8 4 4 5-9" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Human-First Design',
    desc: 'Every feature is crafted around how people actually plan trips — intuitive, beautiful, and built to inspire confidence.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
];

function AboutPage() {
  return (
    <div className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero-bg" aria-hidden="true" />
        <div className="about-hero-inner">
          <span className="about-eyebrow">
            <span className="about-eyebrow-dot" />
            Our Story
          </span>
          <h1 className="about-headline">
            Travel planning,
            <br />
            <span className="about-headline-accent">reimagined</span>
          </h1>
          <p className="about-subtitle">
            Wandrix was born from a simple frustration: why is choosing a destination
            so overwhelming? We built an AI-powered platform that turns travel planning
            from a chore into a joy.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="about-stats">
        <div className="about-stat">
          <span className="about-stat-number">190+</span>
          <span className="about-stat-label">Destinations</span>
        </div>
        <div className="about-stat-sep" aria-hidden="true" />
        <div className="about-stat">
          <span className="about-stat-number">2.4M</span>
          <span className="about-stat-label">Itineraries Created</span>
        </div>
        <div className="about-stat-sep" aria-hidden="true" />
        <div className="about-stat">
          <span className="about-stat-number">98%</span>
          <span className="about-stat-label">Satisfaction</span>
        </div>
      </section>

      {/* Mission */}
      <section className="about-mission">
        <div className="about-mission-inner">
          <div className="about-mission-text">
            <span className="about-section-tag">Our Mission</span>
            <h2 className="about-section-title">
              Empower every traveler with <span className="about-headline-accent">intelligent</span> insights
            </h2>
            <p className="about-section-desc">
              We believe every person deserves a trip that matches their dreams.
              Wandrix combines curated destination data with advanced AI to deliver
              personalized, unbiased travel recommendations — whether you're a
              budget backpacker or a luxury seeker.
            </p>
            <p className="about-section-desc">
              From our smart comparison engine to AI-generated day-by-day
              itineraries, every feature is designed to remove guesswork and
              replace it with confidence.
            </p>
          </div>
          <div className="about-mission-cards">
            <div className="about-glass-card">
              <div className="about-glass-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <h4>Global Coverage</h4>
              <p>190+ destinations across 6 continents, with data updated continuously.</p>
            </div>
            <div className="about-glass-card">
              <div className="about-glass-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
                </svg>
              </div>
              <h4>AI-Powered</h4>
              <p>Advanced algorithms that learn your travel style and refine recommendations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-values">
        {VALUES.map((val) => (
          <div key={val.num} className="about-value">
            <div className="about-value-num">{val.num}</div>
            <div className="about-value-icon-wrap">{val.icon}</div>
            <h3 className="about-value-title">{val.title}</h3>
            <p className="about-value-desc">{val.desc}</p>
          </div>
        ))}
      </section>

      {/* Pillars (replaces team section) */}
      <section className="about-team">
        <div className="about-team-header">
          <span className="about-section-tag">What We Stand For</span>
          <h2 className="about-section-title">The pillars behind Wandrix</h2>
          <p className="about-section-desc">
            A platform built on real traveler needs — powered by data,
            designed with care, and always evolving.
          </p>
        </div>
        <div className="about-team-grid">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="about-team-card">
              <div className="about-pillar-icon">{pillar.icon}</div>
              <h3 className="about-team-name">{pillar.title}</h3>
              <p className="about-team-desc">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="about-cta-bg" aria-hidden="true" />
        <div className="about-cta-inner">
          <h2 className="about-cta-title">
            Ready to discover your next destination?
          </h2>
          <p className="about-cta-desc">
            Join millions of travelers who plan smarter with Wandrix.
          </p>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
