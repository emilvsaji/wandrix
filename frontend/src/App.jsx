import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ComparePage from './pages/ComparePage';
import ExplorePage from './pages/ExplorePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WishlistPage from './pages/WishlistPage';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGetStarted = (page) => {
    navigate(`/${page === 'home' ? '' : page}`);
  };

  const handleSelectDestination = (destination) => {
    navigate('/compare', { state: { destination } });
  };

  const setCurrentPage = (page) => {
    navigate(`/${page === 'home' ? '' : page}`);
  };

  // Get current page from URL path
  const getCurrentPage = () => {
    const path = location.pathname.slice(1) || 'home';
    return path;
  };

  return (
    <div className="app">
      <Header currentPage={getCurrentPage()} setCurrentPage={setCurrentPage} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage onGetStarted={handleGetStarted} />} />
          <Route path="/home" element={<HomePage onGetStarted={handleGetStarted} />} />
          <Route 
            path="/compare" 
            element={<ComparePage initialDestination={location.state?.destination || ''} />} 
          />
          <Route path="/itinerary" element={<ComparePage initialDestination="" />} />
          <Route 
            path="/explore" 
            element={<ExplorePage onSelectDestination={handleSelectDestination} />} 
          />
          <Route path="/login" element={<LoginPage onNavigate={setCurrentPage} />} />
          <Route path="/register" element={<RegisterPage onNavigate={setCurrentPage} />} />
          <Route 
            path="/wishlist" 
            element={<WishlistPage onSelectDestination={handleSelectDestination} />} 
          />
        </Routes>
      </main>
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-logo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                <span>Wandrix</span>
              </div>
              <p className="footer-tagline">AI-Powered Tourism Planning</p>
              <p className="footer-description">
                Discover, compare, and plan your perfect trip with intelligent recommendations tailored just for you.
              </p>
            </div>

            <div className="footer-links">
              <div className="footer-section">
                <h4>Explore</h4>
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('explore'); }}>Destinations</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('compare'); }}>Compare Places</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('itinerary'); }}>Plan Itinerary</a>
              </div>
              <div className="footer-section">
                <h4>Account</h4>
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('login'); }}>Sign In</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('register'); }}>Create Account</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('wishlist'); }}>My Wishlist</a>
              </div>
              <div className="footer-section">
                <h4>Connect</h4>
                <a href="#" onClick={(e) => e.preventDefault()}>About Us</a>
                <a href="#" onClick={(e) => e.preventDefault()}>Contact</a>
                <a href="#" onClick={(e) => e.preventDefault()}>Support</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="copyright">© 2026 Wandrix. All rights reserved.</p>
            <div className="footer-legal">
              <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
              <span className="divider">•</span>
              <a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
