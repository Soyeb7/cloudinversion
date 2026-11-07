import React from 'react';

// Ridges breaking through a sea of cloud at dawn. The front cloud layer is
// filled with the page background, so the page itself reads as the cloud sea.
const HeroScene = ({ compact = false }) => (
  <svg
    className={`hero-scene${compact ? ' hero-scene--compact' : ''}`}
    viewBox="0 0 1600 400"
    preserveAspectRatio="xMidYMax slice"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="1180" cy="262" r="54" className="hero-scene__sun" />
    <path
      className="hero-scene__far"
      d="M0 300 L90 262 L170 280 L300 212 L390 258 L500 236 L590 272 L760 196 L860 248 L990 220 L1120 270 L1260 224 L1370 256 L1480 214 L1600 248 V400 H0 Z"
    />
    <path
      className="hero-scene__near"
      d="M150 340 L300 214 L352 252 L404 226 L540 330 Z M1250 340 L1380 236 L1430 262 L1520 208 L1600 238 V340 Z"
    />
    <path
      className="hero-scene__cloud hero-scene__cloud--back"
      d="M0 300 C90 286 170 308 270 294 S470 282 580 296 S800 308 910 292 S1130 282 1240 296 S1460 306 1600 290 V400 H0 Z"
    />
    <path
      className="hero-scene__cloud"
      d="M0 332 C100 318 190 338 300 326 S520 312 640 328 S860 342 990 324 S1230 314 1350 330 S1530 338 1600 326 V400 H0 Z"
    />
  </svg>
);

export default HeroScene;
