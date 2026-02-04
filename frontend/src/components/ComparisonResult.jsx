import './ComparisonResult.css';
import { getDestinationImage } from '../utils/images';

function ComparisonResult({ result, onGenerateItinerary }) {
  if (!result || result.error) {
    return (
      <div className="comparison-error">
        <p>Unable to compare destinations. Please try again.</p>
      </div>
    );
  }

  const { destination1, destination2, recommendation } = result;

  const ScoreBar = ({ label, score, maxScore = 10 }) => (
    <div className="score-item">
      <div className="score-header">
        <span className="score-label">{label}</span>
        <span className="score-value">{score}/{maxScore}</span>
      </div>
      <div className="score-bar">
        <div 
          className="score-fill" 
          style={{ width: `${(score / maxScore) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  const DestinationCard = ({ data, isWinner }) => (
    <div className={`destination-card ${isWinner ? 'winner' : ''}`}>
      {isWinner && (
        <div className="winner-badge">Recommended</div>
      )}
      
      <div className="dest-image">
        <img 
          src={getDestinationImage(data.name, 500, 200)} 
          alt={data.name}
          loading="lazy"
        />
      </div>
      
      <h3 className="dest-name">{data.name}</h3>
      
      <div className="total-score">
        <span className="score-number">{data.total_score}</span>
        <span className="score-max">/60</span>
      </div>

      <div className="scores-section">
        <h4>Score Breakdown</h4>
        <ScoreBar label="Budget Match" score={data.scores?.budget_match || 0} />
        <ScoreBar label="Weather" score={data.scores?.weather_suitability || 0} />
        <ScoreBar label="Attractions" score={data.scores?.attractions_match || 0} />
        <ScoreBar label="Accessibility" score={data.scores?.accessibility || 0} />
        <ScoreBar label="Experiences" score={data.scores?.unique_experiences || 0} />
        <ScoreBar label="Safety" score={data.scores?.safety || 0} />
      </div>

      <div className="pros-cons">
        <div className="pros">
          <h4>Pros</h4>
          <ul>
            {(data.pros || []).map((pro, idx) => (
              <li key={idx}>{pro}</li>
            ))}
          </ul>
        </div>
        
        <div className="cons">
          <h4>Cons</h4>
          <ul>
            {(data.cons || []).map((con, idx) => (
              <li key={idx}>{con}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="dest-info">
        <div className="info-item">
          <span className="info-label">Est. Cost</span>
          <span className="info-text">{data.estimated_total_cost}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Best Time</span>
          <span className="info-text">{data.best_time_to_visit}</span>
        </div>
      </div>

      <div className="highlights">
        <h4>Must-Do Highlights</h4>
        <div className="highlights-list">
          {(data.highlights || []).map((highlight, idx) => (
            <span key={idx} className="highlight-chip">{highlight}</span>
          ))}
        </div>
      </div>

      {isWinner && (
        <button 
          className="generate-itinerary-btn"
          onClick={() => onGenerateItinerary(data.name)}
        >
          Generate Itinerary
        </button>
      )}
    </div>
  );

  return (
    <div className="comparison-result">
      <div className="result-header">
        <h2>Comparison Results</h2>
        <p className="result-subtitle">AI-powered analysis based on your preferences</p>
      </div>

      <div className="destinations-comparison">
        <DestinationCard 
          data={destination1} 
          isWinner={recommendation?.winner === destination1?.name} 
        />
        
        <div className="vs-divider">
          <span>VS</span>
        </div>
        
        <DestinationCard 
          data={destination2} 
          isWinner={recommendation?.winner === destination2?.name} 
        />
      </div>

      {recommendation && (
        <div className="recommendation-section">
          <h3>Our Recommendation</h3>
          <div className="recommendation-content">
            <div className="recommendation-winner">
              <span className="winner-name">{recommendation.winner}</span>
            </div>
            <p className="recommendation-reasoning">{recommendation.reasoning}</p>
            
            {recommendation.key_deciding_factors && (
              <div className="deciding-factors">
                <h4>Key Deciding Factors</h4>
                <div className="factors-list">
                  {recommendation.key_deciding_factors.map((factor, idx) => (
                    <span key={idx} className="factor-item">
                      <span className="factor-number">{idx + 1}</span>
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ComparisonResult;
