import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

export function useUserComparisons(enabled = true) {
  const [comparisons, setComparisons] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    if (!enabled) {
      setComparisons([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await api.getComparisonHistory();
      setComparisons(data.comparisons || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch comparison history');
      setComparisons([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { comparisons, loading, error, refetch };
}

export default useUserComparisons;
