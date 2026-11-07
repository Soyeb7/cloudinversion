import React, { useEffect, useState } from 'react';
import ProfileDiagram from './ProfileDiagram';
import { clock, longDate, placeSubtitle, relativeDay, roughMetres, shortDay } from '../lib/format';
import { contextNotes, factors, headline } from '../lib/explain';
import { viewpointVerdict } from '../lib/inversion';

const HILL_CODES = ['MT', 'MTS', 'PK', 'PKS', 'HLL', 'HLLS', 'RDGE', 'SPUR', 'PASS'];

const Meter = ({ score, band }) => (
  <div className={`meter meter--${band.key}`} aria-hidden="true">
    <span style={{ width: `${Math.max(3, score)}%` }} />
  </div>
);

const Forecast = ({ place, forecast, analysis, nowLocal }) => {
  const { mornings, ground } = analysis;
  const [sel, setSel] = useState(0);
  const isHill = HILL_CODES.includes(place.featureCode);
  const [vpInput, setVpInput] = useState(isHill && place.elevation != null ? String(Math.round(place.elevation)) : '');

  useEffect(() => {
    setSel(0);
    setVpInput(isHill && place.elevation != null ? String(Math.round(place.elevation)) : '');
  }, [place.latitude, place.longitude]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mornings.length) {
    return (
      <div className="notice">
        <h2>No sunrise forecast for {place.name}</h2>
        <p>This place may be in polar night or the forecast came back incomplete. Try a nearby town.</p>
      </div>
    );
  }

  const m = mornings[Math.min(sel, mornings.length - 1)];
  const vp = parseFloat(vpInput);
  const verdict = viewpointVerdict(m, vp);
  const today = nowLocal.slice(0, 10);
  const dayIdx = mornings.indexOf(m);

  const onTabKey = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = (sel + (e.key === 'ArrowRight' ? 1 : -1) + mornings.length) % mornings.length;
      setSel(next);
      const el = document.getElementById(`morning-tab-${next}`);
      if (el) el.focus();
    }
  };

  return (
    <article className="forecast" aria-labelledby="forecast-place">
      <header className="forecast__head">
        <h2 id="forecast-place">{place.name}</h2>
        <p className="forecast__sub">
          {placeSubtitle(place) || `${place.latitude.toFixed(3)}, ${place.longitude.toFixed(3)}`}
        </p>
      </header>

      <div className="mornings" role="tablist" aria-label="Choose a morning" onKeyDown={onTabKey}>
        {mornings.map((mm, i) => (
          <button
            key={mm.date}
            id={`morning-tab-${i}`}
            type="button"
            role="tab"
            aria-selected={i === sel}
            aria-controls="morning-panel"
            tabIndex={i === sel ? 0 : -1}
            className={`morning morning--${mm.band.key}${i === sel ? ' is-selected' : ''}`}
            onClick={() => setSel(i)}
          >
            <span className="morning__day">{i === 0 ? relativeDay(mm.date, today) : shortDay(mm.date)}</span>
            <span className="morning__band">{mm.band.label}</span>
            <Meter score={mm.score} band={mm.band} />
            <span className="morning__time">Sunrise {clock(mm.sunrise)}</span>
          </button>
        ))}
      </div>

      <section id="morning-panel" role="tabpanel" aria-labelledby={`morning-tab-${sel}`} className="panel">
        <div className="verdict">
          <p className="verdict__date">
            {['This morning', 'Tomorrow'].includes(relativeDay(m.date, today))
              ? `${relativeDay(m.date, today)}, ${longDate(m.date)}`
              : longDate(m.date)}
            . Sunrise {clock(m.sunrise)}
          </p>
          <p className={`verdict__band verdict__band--${m.band.key}`}>{m.band.label}</p>
          <div className="verdict__score">
            <Meter score={m.score} band={m.band} />
            <span>{m.score} / 100</span>
          </div>
          <p className="verdict__text">{headline(m)}</p>
          {dayIdx >= 2 && (
            <p className="verdict__caution">
              This is {dayIdx + (mornings[0].date === today ? 0 : 1)} days out. Inversions are hard to forecast far
              ahead, so check again the evening before.
            </p>
          )}
        </div>

        <div className="where">
          <div className="where__aim">
            <h3>Where to stand</h3>
            {m.cloudTop && m.band.key !== 'unlikely' ? (
              <p>
                Cloud tops are forecast around <strong>{roughMetres(m.cloudTop)}</strong>
                {m.fogOnly ? ' (shallow valley fog)' : ''}. Aim for a viewpoint above{' '}
                <strong>{roughMetres(m.aimAbove)}</strong>; tops ripple and tend to rise as the sun warms them. Best
                around {clock(m.peakTime)}.
              </p>
            ) : (
              <p>No cloud sea is expected, so there’s no height to aim for this morning.</p>
            )}
          </div>
          <div className="where__check">
            <label htmlFor="viewpoint">Your viewpoint height</label>
            <div className="unit-input">
              <input
                id="viewpoint"
                type="number"
                inputMode="numeric"
                min="0"
                max="9000"
                step="10"
                placeholder={isHill ? '' : 'e.g. 950'}
                value={vpInput}
                onChange={(e) => setVpInput(e.target.value)}
                aria-describedby="viewpoint-verdict"
              />
              <span>m</span>
            </div>
            <p id="viewpoint-verdict" className={`where__verdict${verdict ? ` where__verdict--${verdict.key}` : ''}`} aria-live="polite">
              {verdict ? verdict.text : 'Enter the height of the hill or viewpoint you’re planning to stand on.'}
            </p>
          </div>
        </div>

        <ProfileDiagram morning={m} ground={ground} viewpoint={verdict ? vp : null} />

        <h3 className="panel__heading">What’s driving this forecast</h3>
        <ul className="factors">
          {factors(m).map((f) => (
            <li key={f.key} className={`factor factor--${f.status}`}>
              <span className="factor__status" aria-hidden="true" />
              <div className="factor__body">
                <p className="factor__title">
                  {f.title}
                  <span className="sr-only">: {f.status === 'good' ? 'favourable' : f.status === 'fair' ? 'borderline' : 'unfavourable'}</span>
                </p>
                <p className="factor__detail">{f.detail}</p>
              </div>
              <p className="factor__value">
                {f.value}
                {f.valueNote && <span>{f.valueNote}</span>}
              </p>
            </li>
          ))}
        </ul>

        <dl className="context">
          {contextNotes(m).map((c) => (
            <div key={c.label}>
              <dt>{c.label}</dt>
              <dd>
                <strong>{c.value}</strong>
                <span>{c.note}</span>
              </dd>
            </div>
          ))}
        </dl>

        <p className="panel__fineprint">
          Model terrain here is about {roughMetres(ground)}, smoothed over a few kilometres. Narrow valleys can trap
          fog the model can’t see, and heights come from pressure levels roughly 200 to 300 m apart, so treat cloud
          tops as approximate. In the UK, compare with the{' '}
          <a href="https://www.mwis.org.uk/" target="_blank" rel="noopener noreferrer">
            MWIS
          </a>{' '}
          and{' '}
          <a href="https://weather.metoffice.gov.uk/specialist-forecasts/mountain" target="_blank" rel="noopener noreferrer">
            Met Office mountain
          </a>{' '}
          forecasts.
        </p>
      </section>
    </article>
  );
};

export default Forecast;
