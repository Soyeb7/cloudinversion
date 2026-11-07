import { useEffect, useMemo, useState } from 'react';
import { fetchForecast } from './api';
import { analyse } from './inversion';

// Fetch and analyse the forecast for a place. Starts in 'loading' when a place
// is given so the first render matches the prerendered HTML.
export default function useForecast(place, { days = 5, attempt = 0 } = {}) {
  const key = place ? `${place.latitude.toFixed(4)},${place.longitude.toFixed(4)}` : '';
  const [state, setState] = useState(place ? { status: 'loading' } : { status: 'idle' });

  useEffect(() => {
    if (!place) {
      setState({ status: 'idle' });
      return undefined;
    }
    const ctrl = new AbortController();
    setState({ status: 'loading' });
    const load = async () => {
      // Open-Meteo occasionally times out on a cold request; one retry fixes most.
      try {
        return await fetchForecast(place, ctrl.signal, { days });
      } catch (e) {
        if (e.name === 'AbortError') throw e;
        return fetchForecast(place, ctrl.signal, { days });
      }
    };
    load()
      .then((forecast) => {
        const offset = (forecast.utc_offset_seconds || 0) * 1000;
        const nowLocal = new Date(Date.now() + offset).toISOString().slice(0, 16);
        setState({ status: 'ready', forecast, nowLocal });
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setState({ status: 'error', message: e.message });
      });
    return () => ctrl.abort();
  }, [key, days, attempt]); // eslint-disable-line react-hooks/exhaustive-deps

  const elevation = place ? place.elevation : null;
  const analysis = useMemo(
    () => (state.status === 'ready' ? analyse(state.forecast, state.nowLocal, elevation) : null),
    [state, elevation]
  );

  return { ...state, analysis };
}
