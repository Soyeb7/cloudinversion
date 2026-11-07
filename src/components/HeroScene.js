import React from 'react';

// Ridges breaking through a sea of cloud at dawn. The cloud fills to the page
// background colour, so the page itself reads as the cloud sea below the hero.
const HeroScene = () => (
  <svg className="hero-scene" viewBox="0 0 1440 360" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <circle cx="1060" cy="236" r="46" className="hero-scene__sun" />
    <path
      className="hero-scene__far"
      d="M0 260 L120 214 L210 236 L330 170 L420 222 L520 200 L600 236 L760 160 L860 214 L980 188 L1120 240 L1240 196 L1340 228 L1440 206 V360 H0 Z"
    />
    <path
      className="hero-scene__near"
      d="M120 300 L260 182 L320 226 L370 196 L470 288 Z M1180 300 L1300 214 L1350 240 L1440 186 V300 Z"
    />
    <path
      className="hero-scene__cloud hero-scene__cloud--back"
      d="M0 262 C80 248 150 270 240 256 S420 244 520 258 S720 270 820 254 S1020 244 1120 258 S1320 268 1440 252 V360 H0 Z"
    />
    <path
      className="hero-scene__cloud"
      d="M0 290 C90 276 170 296 270 284 S470 270 580 286 S780 300 900 282 S1110 272 1220 288 S1380 296 1440 284 V360 H0 Z"
    />
  </svg>
);

export default HeroScene;
