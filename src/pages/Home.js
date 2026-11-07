import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReactGA from 'react-ga4';

import PlaceSearch from '../components/PlaceSearch';
import Forecast from '../components/Forecast';
import ForecastSkeleton from '../components/ForecastSkeleton';
import HeroScene from '../components/HeroScene';
import Outlook from '../components/Outlook';
import HowItWorks from '../components/HowItWorks';
import RegionGrid from '../components/RegionGrid';
import Faq from '../components/Faq';
import ForecastError from '../components/ForecastError';
import { fetchElevation } from '../lib/api';
import useForecast from '../lib/useForecast';

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
  const [attempt, setAttempt] = useState(0);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState(null);
  const resultRef = useRef(null);
  const fc = useForecast(place, { attempt });
  const placeKey = place ? `${place.latitude},${place.longitude}` : '';

  useEffect(() => {
    if (fc.status === 'ready' && fc.analysis && fc.analysis.mornings[0]) {
      ReactGA.event({
        category: 'Inversion Result',
        action: `Location: ${place.name} - Likelihood: ${fc.analysis.mornings[0].band.label}`,
      });
    }
  }, [fc.status]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fill in the spot height for shared links, map searches or geolocation.
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
      setTimeout(() => resultRef.current && resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
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
        <div className="container hero__grid">
          <div className="hero__copy">
            <h1 className="hero__title">Will there be a cloud inversion at sunrise?</h1>
            <p className="hero__lead">
              A free cloud inversion forecast for any town, valley or hill. See the chance of a sea of cloud over the
              next five mornings, and how high you’d need to climb to stand above it.
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
          <Outlook />
        </div>
      </section>

      <div className="container page" ref={resultRef}>
        {fc.status === 'loading' && <ForecastSkeleton name={place && place.name} />}
        {fc.status === 'error' && (
          <ForecastError name={place.name} message={fc.message} onRetry={() => setAttempt((a) => a + 1)} />
        )}
        {fc.status === 'ready' && (
          <Forecast place={place} forecast={fc.forecast} analysis={fc.analysis} nowLocal={fc.nowLocal} />
        )}
      </div>

      <HowItWorks />
      <RegionGrid />
      <Faq />
    </>
  );
};

export default Home;
