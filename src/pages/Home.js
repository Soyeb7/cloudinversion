import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReactGA from 'react-ga4';

import PlaceSearch from '../components/PlaceSearch';
import Forecast from '../components/Forecast';
import ForecastSkeleton from '../components/ForecastSkeleton';
import HeroScene from '../components/HeroScene';
import Starter from '../components/Starter';
import { fetchElevation, fetchForecast } from '../lib/api';
import { analyse } from '../lib/inversion';

const placeFromParams = (params) => {
  const lat = parseFloat(params.get('lat'));
  const lon = parseFloat(params.get('lon'));
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
  const elev = parseFloat(params.get('elev'));
  return {
    name: params.get('place') || 'Selected location',
    latitude: lat,
    longitude: lon,
    elevation: Number.isNaN(elev) ? null : elev,
    admin1: params.get('region') || undefined,
    country: params.get('country') || undefined,
    featureCode: params.get('kind') || undefined,
  };
};

const paramsFromPlace = (p) => {
  const out = { place: p.name, lat: p.latitude.toFixed(4), lon: p.longitude.toFixed(4) };
  if (p.elevation != null) out.elev = String(Math.round(p.elevation));
  if (p.admin1) out.region = p.admin1;
  if (p.country) out.country = p.country;
  if (p.featureCode) out.kind = p.featureCode;
  return out;
};

const Home = () => {
  const [params, setParams] = useSearchParams();
  const place = useMemo(() => placeFromParams(params), [params]);
  const [state, setState] = useState({ status: 'idle' });
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const resultRef = useRef(null);

  const placeKey = place ? `${place.latitude},${place.longitude}` : '';
  const elevation = place ? place.elevation : null;
  const analysis = useMemo(
    () => (state.status === 'ready' ? analyse(state.forecast, state.nowLocal, elevation) : null),
    [state, elevation]
  );

  useEffect(() => {
    if (!place) {
      setState({ status: 'idle' });
      return undefined;
    }
    const ctrl = new AbortController();
    setState({ status: 'loading' });

    const load = async () => {
      // Open-Meteo occasionally times out on a cold request; one retry fixes most.
      let forecast;
      try {
        forecast = await fetchForecast(place, ctrl.signal);
      } catch (e) {
        if (e.name === 'AbortError') throw e;
        forecast = await fetchForecast(place, ctrl.signal);
      }
      const offset = (forecast.utc_offset_seconds || 0) * 1000;
      const nowLocal = new Date(Date.now() + offset).toISOString().slice(0, 16);
      return { forecast, nowLocal };
    };

    load()
      .then((res) => {
        setState({ status: 'ready', ...res });
        const first = analyse(res.forecast, res.nowLocal, place.elevation).mornings[0];
        if (first) {
          ReactGA.event({
            category: 'Inversion Result',
            action: `Location: ${place.name} - Likelihood: ${first.band.label}`,
          });
        }
      })
      .catch((e) => {
        if (e.name === 'AbortError') return;
        setState({ status: 'error', message: e.message });
      });
    return () => ctrl.abort();
  }, [placeKey, attempt]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fill in the spot height for shared links or geolocation that lack one.
  useEffect(() => {
    if (!place || place.elevation != null) return undefined;
    const ctrl = new AbortController();
    fetchElevation(place, ctrl.signal)
      .then((elev) => {
        if (elev == null) return;
        const next = new URLSearchParams(params);
        next.set('elev', String(Math.round(elev)));
        setParams(next, { replace: true });
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [placeKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectPlace = useCallback(
    (p) => {
      ReactGA.event({ category: 'Search', action: `Location searched: ${p.name}` });
      setParams(paramsFromPlace(p));
      setTimeout(() => resultRef.current && resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    },
    [setParams]
  );

  const locate = () => {
    setLocateError(null);
    if (!navigator.geolocation) {
      setLocateError('Your browser doesn’t share location. Search for a place instead.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        selectPlace({ name: 'Your location', latitude: pos.coords.latitude, longitude: pos.coords.longitude, elevation: null });
      },
      () => {
        setLocating(false);
        setLocateError('Location access was blocked. Search for a place instead.');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  };

  return (
    <>
      <section className="hero">
        <HeroScene />
        <div className="hero__inner">
          <h1 className="hero__title">Will you be above the clouds at sunrise?</h1>
          <p className="hero__lead">
            Check the chance of a cloud inversion over the next few mornings, and how high you’d need to climb to look
            down on it.
          </p>
          <PlaceSearch
            onSelect={selectPlace}
            onLocate={locate}
            locating={locating}
            initialValue={place && place.name !== 'Your location' ? place.name : ''}
          />
          {locateError && (
            <p className="hero__note" role="status">
              {locateError}
            </p>
          )}
        </div>
      </section>

      <div className="page" ref={resultRef}>
        {state.status === 'idle' && <Starter onPick={selectPlace} />}
        {state.status === 'loading' && <ForecastSkeleton name={place && place.name} />}
        {state.status === 'error' && (
          <div className="notice" role="alert">
            <h2>We couldn’t load the forecast for {place.name}</h2>
            <p>The weather service didn’t respond ({state.message}). This is usually temporary.</p>
            <button type="button" className="btn btn--primary" onClick={() => setAttempt((a) => a + 1)}>
              Try again
            </button>
          </div>
        )}
        {state.status === 'ready' && (
          <Forecast place={place} forecast={state.forecast} analysis={analysis} nowLocal={state.nowLocal} />
        )}
      </div>
    </>
  );
};

export default Home;
