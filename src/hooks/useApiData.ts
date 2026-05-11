import { useState, useEffect, useCallback } from 'react';

interface ApiState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApiData<T>(
  fetchFn: () => Promise<{ data: T }>,
  fallback: T,
  deps: unknown[] = [],
): ApiState<T> {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchFn()
      .then(res => {
        if (!cancelled) { setData(res.data); setLoading(false); setError(null); }
      })
      .catch(err => {
        if (!cancelled) {
          console.warn('API unavailable, using mock data:', (err as Error).message);
          setError((err as Error).message);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { data, loading, error, refetch };
}
