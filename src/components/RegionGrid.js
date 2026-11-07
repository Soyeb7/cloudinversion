import React from 'react';
import { Link } from 'react-router-dom';
import { REGIONS } from '../data/regions';

const RegionGrid = ({ exclude, title = 'Cloud inversion forecasts for UK hills' }) => (
  <section className="section section--tint" aria-labelledby="regions-title">
    <div className="container">
      <h2 id="regions-title" className="section__title">
        {title}
      </h2>
      <ul className="regions">
        {REGIONS.filter((r) => r.slug !== exclude).map((r) => {
          const hs = r.viewpoints.map((v) => v.height);
          return (
            <li key={r.slug}>
              <Link to={`/cloud-inversion-forecast/${r.slug}/`} className="region-card">
                <span className="region-card__name">{r.name}</span>
                <span className="region-card__text">{r.summary}</span>
                <span className="region-card__meta">
                  {r.viewpoints.length} viewpoints from {Math.min(...hs)} to {Math.max(...hs).toLocaleString('en-GB')} m
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  </section>
);

export default RegionGrid;
