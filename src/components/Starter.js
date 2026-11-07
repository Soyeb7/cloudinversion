import React from 'react';
import { Link } from 'react-router-dom';

// Well-known inversion spots, so a first-time visitor can see a real forecast
// in one tap.
const SPOTS = [
  { name: 'Keswick', admin1: 'Lake District', country: 'United Kingdom', latitude: 54.5995, longitude: -3.1326, elevation: 93 },
  { name: 'Glencoe', admin1: 'Highlands', country: 'United Kingdom', latitude: 56.6826, longitude: -5.1023, elevation: 15 },
  { name: 'Edale', admin1: 'Peak District', country: 'United Kingdom', latitude: 53.3654, longitude: -1.8166, elevation: 250 },
  { name: 'Llanberis', admin1: 'Eryri (Snowdonia)', country: 'United Kingdom', latitude: 53.1186, longitude: -4.1293, elevation: 110 },
  { name: 'Bern', admin1: 'Swiss Plateau', country: 'Switzerland', latitude: 46.948, longitude: 7.4474, elevation: 540 },
];

const Starter = ({ onPick }) => (
  <div className="starter">
    <section className="starter__block">
      <h2>Try a classic inversion spot</h2>
      <ul className="chips">
        {SPOTS.map((s) => (
          <li key={s.name}>
            <button type="button" className="chip" onClick={() => onPick(s)}>
              {s.name}
              <span>{s.admin1}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>

    <section className="starter__block starter__how">
      <h2>What the forecast looks for</h2>
      <p>
        A cloud inversion happens when a layer of warmer air sits on top of cold, damp air. The warm layer acts as a
        lid: cloud and fog get trapped beneath it, and anyone standing above the lid looks down on a flat sea of cloud.
      </p>
      <dl className="ingredients">
        <div>
          <dt>A warm lid</dt>
          <dd>Air getting warmer with height somewhere in the lowest couple of kilometres.</dd>
        </div>
        <div>
          <dt>Cloud trapped under it</dt>
          <dd>Saturated air (fog or low cloud) below the lid, often after a clear, still night.</dd>
        </div>
        <div>
          <dt>Clear air above</dt>
          <dd>Dry air and little high cloud over the top, so the view and the sunrise aren’t blocked.</dd>
        </div>
        <div>
          <dt>Settled weather</dt>
          <dd>Light winds and high pressure keep the layers from mixing.</dd>
        </div>
      </dl>
      <p>
        <Link to="/ideal-conditions">Read how inversions form and how this forecast works</Link>
      </p>
    </section>
  </div>
);

export default Starter;
