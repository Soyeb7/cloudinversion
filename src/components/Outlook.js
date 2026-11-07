import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { REGIONS } from '../data/regions';
import { fetchForecast } from '../lib/api';
import { analyse } from '../lib/inversion';
import { roughMetres, relativeDay } from '../lib/format';

const heading = (day) => {
  if (!day) return 'Next sunrise at classic spots';
  if (day === 'This morning') return 'This morning at classic spots';
  if (day === 'Tomorrow') return 'Tomorrow morning at classic spots';
  return `${day} morning at classic spots`;
};

// Next-sunrise outlook for each classic area, so the landing page answers
// "is it worth going anywhere tomorrow?" before you search.
const Outlook = () => {
  const [rows, setRows] = useState({});
  const [day, setDay] = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();
    REGIONS.forEach((r) => {
      fetchForecast(r.base, ctrl.signal, { days: 2 })
        .then((f) => {
          const now = new Date(Date.now() + (f.utc_offset_seconds || 0) * 1000).toISOString().slice(0, 16);
          const m = analyse(f, now, r.base.elevation).mornings[0];
          if (m) setDay((d) => d || relativeDay(m.date, now.slice(0, 10)));
          setRows((prev) => ({ ...prev, [r.slug]: m || 'none' }));
        })
        .catch((e) => {
          if (e.name !== 'AbortError') setRows((prev) => ({ ...prev, [r.slug]: 'error' }));
        });
    });
    return () => ctrl.abort();
  }, []);

  return (
    <aside className="outlook" aria-labelledby="outlook-title">
      <h2 id="outlook-title" className="outlook__title">
        {heading(day)}
      </h2>
      <ul className="outlook__list">
        {REGIONS.map((r) => {
          const m = rows[r.slug];
          const ready = m && typeof m === 'object';
          return (
            <li key={r.slug}>
              <Link to={`/cloud-inversion-forecast/${r.slug}/`} className="outlook__row">
                <span className="outlook__name">
                  {r.short}
                  <span>{r.base.name}</span>
                </span>
                {ready && (
                  <span className={`outlook__band band-dot band-dot--${m.band.key}`}>
                    {m.band.label}
                    <span>{m.cloudTop && m.band.key !== 'unlikely' ? `tops ~${roughMetres(m.cloudTop)}` : 'no cloud sea'}</span>
                  </span>
                )}
                {(m === 'error' || m === 'none') && <span className="outlook__band outlook__band--na">Unavailable</span>}
                {!m && (
                  <span className="outlook__band" aria-label="Loading">
                    <span className="skeleton skeleton--line" />
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default Outlook;
