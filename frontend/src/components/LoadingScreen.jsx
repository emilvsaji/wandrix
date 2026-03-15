import { useStartupLoading } from '../context/StartupLoadingContext';
import './LoadingScreen.css';

function LoadingScreen() {
  const { displayProgress, isVisible, isExiting, progress } = useStartupLoading();

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`startup-loader ${isExiting ? 'startup-loader--exit' : ''}`} role="status" aria-live="polite" aria-label="Application startup loading">
      <div className="startup-loader__content">
        <h1 className="startup-loader__brand">WANDRIX</h1>
        <div className="startup-loader__pill">
          <span className="startup-loader__text">Loading {displayProgress}%</span>
          <span className="startup-loader__cursor" aria-hidden="true" />
        </div>
        <div className="startup-loader__track" aria-hidden="true">
          <div className="startup-loader__fill" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
