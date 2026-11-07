import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Forecast from '../components/Forecast';
import ForecastSkeleton from '../components/ForecastSkeleton';
import ForecastError from '../components/ForecastError';
import HeroScene from '../components/HeroScene';
import RegionGrid from '../components/RegionGrid';
import Home from './Home';
import { regionBySlug } from '../data/regions';
import useForecast from '../lib/useForecast';

const Region = () => {
  const { slug } = useParams();
  const region = regionBySlug(slug);
  const [attempt, setAttempt] = useState(0);
  const fc = useForecast(region ? region.base : null, { attempt });

  if (!region) return <Home />;

  return (
    <>
      <section className="hero hero--compact">
        <HeroScene compact />
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link to="/">Cloud Inversion Checker</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{region.name}</span>
          </nav>
          <h1 className="hero__title hero__title--page">{region.name} cloud inversion forecast</h1>
          <p className="hero__lead">{region.summary}</p>
        </div>
      </section>

      <div className="container page">
        <div className="region-intro">
          <div className="region-intro__text">
            {region.intro.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
            <p className="region-intro__how">
              The forecast below is for the valleys around {region.base.name}. Pick a viewpoint to see whether its
              summit is likely to be above the cloud.
            </p>
          </div>
          <div className="region-intro__list">
            <h2 className="mini-title">Viewpoints to try</h2>
            <table className="vp-table">
              <thead>
                <tr>
                  <th scope="col">Viewpoint</th>
                  <th scope="col" className="num">
                    Height
                  </th>
                </tr>
              </thead>
              <tbody>
                {region.viewpoints.map((v) => (
                  <tr key={v.name}>
                    <th scope="row">
                      {v.name}
                      <span>{v.note}</span>
                    </th>
                    <td className="num">{v.height.toLocaleString('en-GB')} m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {fc.status === 'loading' && <ForecastSkeleton name={region.base.name} />}
        {fc.status === 'error' && (
          <ForecastError name={region.name} message={fc.message} onRetry={() => setAttempt((a) => a + 1)} />
        )}
        {fc.status === 'ready' && (
          <Forecast
            place={region.base}
            forecast={fc.forecast}
            analysis={fc.analysis}
            nowLocal={fc.nowLocal}
            title={`Next 5 mornings around ${region.base.name}`}
            subtitle={`${region.name}, valley floor about ${region.base.elevation} m`}
            viewpoints={region.viewpoints}
          />
        )}
      </div>

      <RegionGrid exclude={region.slug} title="Other cloud inversion forecasts" />
    </>
  );
};

export default Region;
