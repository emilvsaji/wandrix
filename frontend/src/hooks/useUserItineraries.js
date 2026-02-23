import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

export function useUserItineraries(enabled = true) {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    if (!enabled) {
      setItineraries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await api.getItineraryHistory();
      setItineraries(data.itineraries || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch itinerary history');
      setItineraries([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { itineraries, loading, error, refetch };
}

export default useUserItineraries;
