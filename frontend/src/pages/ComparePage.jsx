import { useState } from 'react';
import './ComparePage.css';
import DestinationInput from '../components/DestinationInput';
import PreferencesForm from '../components/PreferencesForm';
import ComparisonResult from '../components/ComparisonResult';
import ItineraryView from '../components/ItineraryView';
import api from '../services/api';

function ComparePage({ initialDestination }) {
  const [destination1, setDestination1] = useState(initialDestination || '');
  const [destination2, setDestination2] = useState('');
  const [preferences, setPreferences] = useState({
    budget: 'medium',
    travel_duration: 7,
    interests: ['culture', 'food'],
    season: 'summer',
    travel_type: 'couple',
  });
  const [comparisonResult, setComparisonResult] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingItinerary, setIsGeneratingItinerary] = useState(false);
  const [view, setView] = useState('form'); // 'form', 'result', 'itinerary'

  const handleCompare = async () => {
    if (!destination1 || !destination2) {
      alert('Please enter both destinations');
      return;
    }

    if (destination1.toLowerCase() === destination2.toLowerCase()) {
      alert('Please choose two different destinations');
      return;
    }

    setIsLoading(true);
    setComparisonResult(null);

    try {
      const result = await api.compareDestinations(destination1, destination2, preferences);
      setComparisonResult(result);
      setView('result');
    } catch (error) {
      console.error('Comparison error:', error);
      setComparisonResult({ error: 'Failed to compare destinations' });
      setView('result');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateItinerary = async (destination) => {
    setIsGeneratingItinerary(true);

    try {
      const result = await api.generateItinerary(destination, preferences);
      setItinerary(result);
      setView('itinerary');
    } catch (error) {
      console.error('Itinerary error:', error);
      setItinerary({ error: 'Failed to generate itinerary' });
      setView('itinerary');
    } finally {
      setIsGeneratingItinerary(false);
    }
  };

  const handleBackToCompare = () => {
    setView('form');
    setComparisonResult(null);
    setItinerary(null);
  };

  if (view === 'itinerary' && itinerary) {
    return <ItineraryView itinerary={itinerary} onBack={handleBackToCompare} />;
  }

  return (
    <div className="compare-page">
      {view === 'form' && (
        <>
          <div className="compare-header">
            <h1>Compare Destinations</h1>
            <p>
              Enter two destinations and let our AI analyze which one suits you better
            </p>
          </div>

          <div className="compare-form">
            <div className="destinations-row">
              <DestinationInput
                label="First Destination"
                value={destination1}
                onChange={setDestination1}
                otherValue={destination2}
              />

              <div className="vs-badge">VS</div>

              <DestinationInput
                label="Second Destination"
                value={destination2}
                onChange={setDestination2}
                otherValue={destination1}
              />
            </div>

            <PreferencesForm
              preferences={preferences}
              setPreferences={setPreferences}
              onSubmit={handleCompare}
              isLoading={isLoading}
            />
          </div>
        </>
      )}

      {view === 'result' && comparisonResult && (
        <>
          <button className="back-to-form" onClick={handleBackToCompare}>
            ← New Comparison
          </button>

          <ComparisonResult
            result={comparisonResult}
            onGenerateItinerary={handleGenerateItinerary}
          />

          {isGeneratingItinerary && (
            <div className="generating-overlay">
              <div className="generating-content">
                <div className="generating-spinner"></div>
                <h3>Creating Your Perfect Journey Schedule</h3>
                <p>Our AI is planning your day-by-day adventure...</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ComparePage;
