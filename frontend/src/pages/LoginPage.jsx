import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      onNavigate('home');
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      {/* Decorative background */}
      <div className="auth-bg" aria-hidden="true" />

      <div className="auth-wrapper">
        {/* Left decorative panel */}
        <div className="auth-side">
          <div className="auth-side-content">
            <span className="auth-side-eyebrow">
              <span className="auth-side-dot" />
              Welcome Back
            </span>
            <h2 className="auth-side-title">
              Your next <em>adventure</em> awaits
            </h2>
            <p className="auth-side-desc">
              Sign in to access your saved destinations, wishlists, and personalized travel recommendations.
            </p>

            {/* Decorative floating cards */}
            <div className="auth-side-cards">
              <div className="auth-mini-card">
                <span className="auth-mini-emoji">🗼</span>
                <div>
                  <div className="auth-mini-city">Paris</div>
                  <div className="auth-mini-score">97% match</div>
                </div>
              </div>
              <div className="auth-mini-card">
                <span className="auth-mini-emoji">⛩️</span>
                <div>
                  <div className="auth-mini-city">Kyoto</div>
                  <div className="auth-mini-score">94% match</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="auth-form-panel">
          <div className="auth-container">
            <div className="auth-logo-mark">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>

            <div className="auth-header">
              <h1>Sign In</h1>
              <p>Enter your credentials to continue</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {error && <div className="auth-error">{error}</div>}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-with-icon">
                  <svg className="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 4l-10 8L2 4" />
                  </svg>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-with-icon">
                  <svg className="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="auth-spinner" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Don't have an account?{' '}
                <button
                  className="link-btn"
                  onClick={() => onNavigate('register')}
                >
                  Create one
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
