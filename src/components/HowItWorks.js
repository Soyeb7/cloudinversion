import React from 'react';
import { Link } from 'react-router-dom';
import ProfileDiagram from './ProfileDiagram';

// A worked example: low cloud under a strong lid, drawn with the same diagram
// the live forecast uses.
const EXAMPLE = {
  profile: [
    { z: 102, t: 3, rh: 97, level: 'surface' },
    { z: 180, t: 2.6, rh: 98, level: '1000 hPa' },
    { z: 390, t: 1.4, rh: 99, level: '975 hPa' },
    { z: 600, t: 0.4, rh: 99, level: '950 hPa' },
    { z: 820, t: 5.5, rh: 40, level: '925 hPa' },
    { z: 1050, t: 6, rh: 30, level: '900 hPa' },
    { z: 1500, t: 3.5, rh: 25, level: '850 hPa' },
  ],
  inversion: { baseIdx: 3, topIdx: 5, base: 600, top: 1050, strength: 5.6 },
  stable: null,
  cloudTop: 650,
  aimAbove: 750,
  band: { key: 'very-likely', label: 'Very likely' },
};

const HowItWorks = () => (
  <section className="section" aria-labelledby="how-title">
    <div className="container split">
      <div className="split__text">
        <h2 id="how-title" className="section__title">
          How a cloud inversion forms
        </h2>
        <p className="section__lead">
          Normally air gets colder as you climb. During a temperature inversion a layer of warmer air sits on top of
          cold, damp air. That warm layer acts as a lid: fog and low cloud get trapped beneath it, and from a summit
          above the lid you look down on a flat sea of cloud.
        </p>
        <dl className="ingredients">
          <div>
            <dt>A warm lid</dt>
            <dd>Air warming with height somewhere in the lowest couple of kilometres. 3°C or more is a strong lid.</dd>
          </div>
          <div>
            <dt>Cloud trapped under it</dt>
            <dd>Saturated air below the lid, often after a clear, still night following a damp day.</dd>
          </div>
          <div>
            <dt>Clear air above</dt>
            <dd>Drier air and little high cloud over the top, so the view and the sunrise aren’t blocked.</dd>
          </div>
          <div>
            <dt>Settled weather</dt>
            <dd>Light winds and high pressure keep the layers from mixing together.</dd>
          </div>
        </dl>
        <p>
          <Link to="/what-is-a-cloud-inversion/" className="text-link">
            Read the full guide to cloud inversions
          </Link>
        </p>
      </div>
      <figure className="split__figure example">
        <ProfileDiagram morning={EXAMPLE} ground={100} viewpoint={950} idPrefix="ex" />
        <figcaption className="example__caption">
          Example: cloud trapped below 650 m by a lid 5.6°C warmer than the air beneath it. A summit at 950 m stands in
          sunshine above the cloud.
        </figcaption>
      </figure>
    </div>
  </section>
);

export default HowItWorks;
