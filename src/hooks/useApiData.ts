import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '../types';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  setData: (next: T | ((prev: T | null) => T)) => void;
}

/**
 * Hook genérico para cargar datos de la API.
 *
 * @param fetchFn — función que retorna una promesa con la respuesta
 * @param deps    — dependencias (cuando cambian, se re-ejecuta)
 */
export function useApiData<T>(
  fetchFn: () => Promise<T>,
  deps: unknown[] = [],
): ApiState<T> {
  const [data, setDataState] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError]     = useState<string | null>(null);
  const [tick, setTick]       = useState(0);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  const setData = useCallback((next: T | ((prev: T | null) => T)) => {
    setDataState(prev => typeof next === 'function' ? (next as (p: T | null) => T)(prev) : next);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchFn()
      .then(res => {
        if (!cancelled) { setDataState(res); setLoading(false); }
      })
      .catch(err => {
        if (cancelled) return;
        const msg = err instanceof ApiError
          ? `${err.message} (HTTP ${err.status})`
          : (err as Error)?.message ?? 'Error desconocido';
        setError(msg);
        setLoading(false);
      });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { data, loading, error, refetch, setData };
}
