import React, { useEffect, useState } from 'react';
import ReactGA from 'react-ga4';
import SafetyNote from './SafetyNote';
import { fetchNearbyHills, suggestFor } from '../lib/nearby';
import { roughMetres } from '../lib/format';

const STATUS = {
  above: 'Above the cloud',
  edge: 'Near the cloud top',
  in: 'In the cloud',
};

const mapUrl = (h) =>
  `https://www.openstreetmap.org/?mlat=${h.latitude.toFixed(5)}&mlon=${h.longitude.toFixed(5)}#map=14/${h.latitude.toFixed(
    4
  )}/${h.longitude.toFixed(4)}`;

// Suggested hills near the searched place, ranked against this morning's
// forecast cloud top.
const NearbyHills = ({ place, morning, onUse, current }) => {
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    const ctrl = new AbortController();
    setState({ status: 'loading' });
    fetchNearbyHills(place, ctrl.signal)
      .then((r) => setState({ status: 'ready', ...r }))
      .catch((e) => {
        if (e.name !== 'AbortError') setState({ status: 'error' });
      });
    return () => ctrl.abort();
  }, [place.latitude, place.longitude]); // eslint-disable-line react-hooks/exhaustive-deps

  const use = (h) => {
    ReactGA.event({ category: 'Suggestion', action: `Used viewpoint: ${h.name}` });
    onUse(h.height);
  };

  let body;
  if (state.status === 'loading') {
    body = (
      <div className="nearby__loading" aria-busy="true">
        <span className="sr-only" role="status">
          Looking for hills near {place.name}…
        </span>
        {[0, 1, 2].map((i) => (
          <span key={i} className="skeleton skeleton--row" />
        ))}
      </div>
    );
  } else if (state.status === 'error' || !state.hills.length) {
    body = (
      <p className="nearby__lead">
        {state.status === 'error' || state.partial
          ? 'The hill search isn’t responding right now. Try again in a minute, or search for a hill by name above.'
          : `We couldn’t find named hills within about 35 km of ${place.name}. Try searching for a nearby hill by name.`}
      </p>
    );
  } else {
    const { mode, items } = suggestFor(state.hills, morning, place.elevation);
    const top = morning.cloudTop;
    const lead =
      mode === 'above'
        ? `With cloud tops forecast around ${roughMetres(top)}, these nearby hills should rise above it. Nearest first.`
        : mode === 'none-clear'
        ? `The cloud is forecast to reach about ${roughMetres(top)}, higher than the hills close to ${place.name}. These are the highest nearby; you may need to travel further.`
        : `No cloud sea is forecast this morning. These are the highest hills within easy reach of ${place.name}, worth knowing for a better morning.`;

    body = (
      <>
        <p className="nearby__lead">{lead}</p>
        {items.length === 0 ? (
          <p className="nearby__lead">No suitable hills found nearby.</p>
        ) : (
          <ul className="nearby__list">
            {items.map((h) => (
              <li key={`${h.name}-${h.latitude}`} className={`hill${h.status ? ` hill--${h.status}` : ''}`}>
                <div className="hill__main">
                  <p className="hill__name">{h.name}</p>
                  {h.status && <p className="hill__status">{STATUS[h.status]}</p>}
                </div>
                <p className="hill__num">
                  {h.exact ? `${Math.round(h.height)} m` : `~${Math.round(h.height / 10) * 10} m`}
                  <span>{h.exact ? 'summit' : 'approx.'}</span>
                </p>
                <p className="hill__num">
                  {h.km < 1 ? '<1' : Math.round(h.km)} km
                  <span>{h.dir}</span>
                </p>
                <div className="hill__actions">
                  <button
                    type="button"
                    className={`vp-chip${String(Math.round(h.height)) === current ? ' is-on' : ''}`}
                    aria-pressed={String(Math.round(h.height)) === current}
                    onClick={() => use({ ...h, height: Math.round(h.height) })}
                  >
                    Check this height
                  </button>
                  <a href={mapUrl(h)} target="_blank" rel="noopener noreferrer" className="hill__map">
                    Map<span className="sr-only"> of {h.name} (opens OpenStreetMap)</span>
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="nearby__src">
          Hills from OpenStreetMap within about 35 km. Heights marked “approx.” come from terrain data and can read a
          little under the true summit. Distances are straight-line from {place.name}, not walking routes.
          {state.partial ? ' Only our own list of viewpoints is shown because the map search didn’t respond.' : ''}
        </p>
      </>
    );
  }

  return (
    <section className="nearby" aria-labelledby="nearby-title">
      <h3 id="nearby-title" className="panel__heading">
        Where to watch from near {place.name}
      </h3>
      {body}
      <SafetyNote />
    </section>
  );
};

export default NearbyHills;
