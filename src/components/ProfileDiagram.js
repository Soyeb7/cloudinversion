import React, { useEffect, useRef, useState } from 'react';
import { roughMetres } from '../lib/format';

// A to-scale cross-section of the morning: the valley floor, the cloud layer,
// the warm lid and your viewpoint on the left; the model's temperature profile
// on the right, sharing the same height axis.

const niceStep = (range) => [50, 100, 200, 250, 500, 1000].find((s) => range / s <= 6) || 1000;

function useWidth(ref) {
  const [w, setW] = useState(640);
  useEffect(() => {
    if (!ref.current) return undefined;
    const el = ref.current;
    const update = () => setW(Math.max(280, Math.round(el.getBoundingClientRect().width)));
    update();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

// Smooth wavy line across [x0, x1] at height y: the top of the cloud sea.
const wave = (x0, x1, y, amp, seed = 0) => {
  const n = Math.max(4, Math.round((x1 - x0) / 46));
  const step = (x1 - x0) / n;
  let d = `M${x0},${y}`;
  for (let k = 0; k < n; k += 1) {
    const xa = x0 + step * k;
    const dy = (k + seed) % 2 === 0 ? -amp : amp * 0.6;
    d += ` Q${xa + step / 2},${y + dy} ${xa + step},${y}`;
  }
  return d;
};

const ProfileDiagram = ({ morning, ground, viewpoint, idPrefix = 'fc' }) => {
  const id = (name) => `${idPrefix}-${name}`;
  const wrapRef = useRef(null);
  const W = useWidth(wrapRef);
  const narrow = W < 520;
  const H = narrow ? 320 : 380;
  const pad = { top: 16, bottom: 30, left: narrow ? 40 : 48 };
  const gap = 14;
  const panelW = Math.round(Math.min(210, Math.max(108, W * 0.28)));
  const sx0 = pad.left;
  const sx1 = W - panelW - gap;
  const sceneW = sx1 - sx0;
  const px0 = sx1 + gap;
  const px1 = W - 2;

  const { profile, inversion, stable, cloudTop, aimAbove, band } = morning;
  const lid = inversion || stable;
  const vp = viewpoint && viewpoint > 0 ? viewpoint : null;
  const showAim = !vp && aimAbove && band.key !== 'unlikely';
  // Without a viewpoint, draw a generic hill that rises clear of the cloud
  const peak = vp || Math.max((aimAbove || cloudTop || ground) + 220, ground + 450);

  const zMin = Math.floor((ground - 80) / 50) * 50;
  let zMax = Math.max(ground + 900, (lid ? lid.top : 0) + 350, (cloudTop || 0) + 450, peak + 220);
  zMax = Math.min(zMax, ground + 3400);
  zMax = Math.ceil(zMax / 100) * 100;
  const innerH = H - pad.top - pad.bottom;
  const y = (z) => pad.top + (1 - (z - zMin) / (zMax - zMin)) * innerH;
  const yGround = y(ground);
  const yBottom = H - pad.bottom;

  // Height ticks
  const step = niceStep(zMax - zMin);
  const ticks = [];
  for (let z = Math.ceil(zMin / step) * step; z <= zMax; z += step) ticks.push(z);

  // Temperature panel scale
  const visible = profile.filter((p) => p.z <= zMax + 400);
  const ts = visible.map((p) => p.t);
  const tMin = Math.floor(Math.min(...ts) - 1);
  const tMax = Math.ceil(Math.max(...ts) + 1);
  const pIn = 10;
  const xT = (t) => px0 + pIn + ((t - tMin) / (tMax - tMin)) * (px1 - px0 - pIn * 2);
  const line = visible.map((p) => `${xT(p.t).toFixed(1)},${y(p.z).toFixed(1)}`).join(' ');
  const invLine = inversion
    ? profile
        .slice(inversion.baseIdx, inversion.topIdx + 1)
        .map((p) => `${xT(p.t).toFixed(1)},${y(p.z).toFixed(1)}`)
        .join(' ')
    : null;

  // Terrain
  const peakX = sx0 + sceneW * 0.26;
  const yPeak = y(peak);
  const hill = `M${sx0},${yBottom} L${sx0},${y(ground + (peak - ground) * 0.35)} L${sx0 + sceneW * 0.12},${y(
    ground + (peak - ground) * 0.72
  )} L${peakX},${yPeak} L${sx0 + sceneW * 0.34},${y(ground + (peak - ground) * 0.82)} L${sx0 + sceneW * 0.44},${y(
    ground + (peak - ground) * 0.55
  )} L${sx0 + sceneW * 0.6},${yGround} L${sx0 + sceneW * 0.6},${yBottom} Z`;
  const farTop = ground + (zMax - ground) * 0.42;
  const far = `M${sx0},${yGround} L${sx0 + sceneW * 0.5},${y(ground + (farTop - ground) * 0.55)} L${sx0 + sceneW * 0.64},${y(
    farTop * 0.92 + ground * 0.08
  )} L${sx0 + sceneW * 0.74},${y(ground + (farTop - ground) * 0.7)} L${sx0 + sceneW * 0.86},${y(farTop)} L${sx1},${y(
    ground + (farTop - ground) * 0.6
  )} L${sx1},${yBottom} L${sx0},${yBottom} Z`;

  const cloudOpacity = { 'very-likely': 0.96, likely: 0.92, possible: 0.75, unlikely: 0.5 }[band.key];
  const yCloud = cloudTop ? y(cloudTop) : null;
  // Keep the cloud-top label clear of the viewpoint label when they'd collide
  const cloudLabelY =
    yCloud != null && vp && Math.abs(yPeak - 6 - (yCloud - 8)) < 18 ? Math.min(yCloud + 20, yBottom - 6) : yCloud - 8;
  const sunY = Math.min(yCloud != null ? yCloud - 16 : yGround - 40, y(ground + (zMax - ground) * 0.35));

  const summary = [
    cloudTop ? `Estimated cloud tops around ${roughMetres(cloudTop)}.` : 'No cloud layer expected under a lid.',
    inversion
      ? `Warm lid from ${roughMetres(inversion.base)} to ${roughMetres(inversion.top)}, ${inversion.strength.toFixed(1)}°C warmer at the top.`
      : 'No temperature inversion.',
    vp ? `Your viewpoint at ${roughMetres(vp, 10)}.` : '',
  ].join(' ');

  return (
    <figure className="diagram" ref={wrapRef}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={`${id('title')} ${id('desc')}`}>
        <title id={id('title')}>Cross-section of the atmosphere at dawn</title>
        <desc id={id('desc')}>{summary}</desc>
        <defs>
          <linearGradient id={id('sky')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className="dg-sky-0" />
            <stop offset="0.6" className="dg-sky-1" />
            <stop offset="1" className="dg-sky-2" />
          </linearGradient>
          <radialGradient id={id('sun')}>
            <stop offset="0" className="dg-sun-0" />
            <stop offset="1" className="dg-sun-1" />
          </radialGradient>
          <clipPath id={id('scene')}>
            <rect x={sx0} y={pad.top} width={sceneW} height={innerH} rx="10" />
          </clipPath>
          <clipPath id={id('panel')}>
            <rect x={px0} y={pad.top} width={px1 - px0} height={innerH} rx="10" />
          </clipPath>
        </defs>

        {/* height axis */}
        {ticks.map((z) => (
          <g key={z} className="dg-tick">
            <line x1={sx0 - 4} x2={px1} y1={y(z)} y2={y(z)} />
            <text x={sx0 - 8} y={y(z) + 4} textAnchor="end">
              {z.toLocaleString('en-GB')}
              {z === ticks[ticks.length - 1] ? ' m' : ''}
            </text>
          </g>
        ))}

        <g clipPath={`url(#${id('scene')})`}>
          <rect x={sx0} y={pad.top} width={sceneW} height={innerH} fill={`url(#${id('sky')})`} />
          <circle cx={sx0 + sceneW * 0.56} cy={sunY} r={narrow ? 34 : 46} fill={`url(#${id('sun')})`} />
          <circle cx={sx0 + sceneW * 0.56} cy={sunY} r={narrow ? 9 : 12} className="dg-sun-disc" />
          <path d={far} className="dg-far" />
          {lid && (
            <rect
              x={sx0}
              y={y(lid.top)}
              width={sceneW}
              height={Math.max(3, y(lid.base) - y(lid.top))}
              className={`dg-lid${inversion ? '' : ' dg-lid--weak'}`}
            />
          )}
          <path d={hill} className="dg-hill" />
          {yCloud != null && (
            <path
              d={`${wave(sx0 - 10, sx1 + 10, yCloud, narrow ? 3 : 4)} L${sx1 + 10},${yBottom} L${sx0 - 10},${yBottom} Z`}
              className="dg-cloud"
              style={{ opacity: cloudOpacity }}
            />
          )}
          {showAim && (
            <g className="dg-aim">
              <line x1={sx0} x2={sx1} y1={y(aimAbove)} y2={y(aimAbove)} />
            </g>
          )}
        </g>

        {/* scene labels, drawn outside the clip so they never get cut */}
        {yCloud != null && (
          <text x={sx1 - 8} y={cloudLabelY} textAnchor="end" className="dg-label dg-label--cloud">
            Cloud tops ~{roughMetres(cloudTop)}
          </text>
        )}
        {vp && (
          <g className="dg-you">
            <circle cx={peakX} cy={yPeak} r="4.5" />
            <text x={peakX + 9} y={yPeak - 6} className="dg-label">
              You, {roughMetres(vp, 10)}
            </text>
          </g>
        )}
        {showAim && (
          <text x={sx0 + 8} y={y(aimAbove) - 7} className="dg-label">
            Aim above {roughMetres(aimAbove)}
          </text>
        )}

        {/* temperature panel */}
        <rect x={px0} y={pad.top} width={px1 - px0} height={innerH} rx="10" className="dg-panel" />
        <g clipPath={`url(#${id('panel')})`}>
          {lid && (
            <rect
              x={px0}
              y={y(lid.top)}
              width={px1 - px0}
              height={Math.max(3, y(lid.base) - y(lid.top))}
              className={`dg-lid${inversion ? '' : ' dg-lid--weak'}`}
            />
          )}
          <polyline points={line} className="dg-temp" />
          {lid && (
            <text x={px1 - 8} y={Math.max(pad.top + 14, y(lid.top) - 6)} textAnchor="end" className="dg-panel-label">
              {inversion ? 'Warm lid' : 'Weak lid'}
            </text>
          )}
          {invLine && <polyline points={invLine} className="dg-temp dg-temp--inv" />}
          {visible.map((p) => (
            <circle
              key={p.level}
              cx={xT(p.t)}
              cy={y(p.z)}
              r="3.5"
              className={p.rh >= 92 ? 'dg-pt dg-pt--wet' : 'dg-pt'}
            >
              <title>{`${p.level === 'surface' ? 'Near ground' : p.level}: ${p.t.toFixed(1)}°C, humidity ${Math.round(p.rh)}%, ${Math.round(
                p.z
              )} m`}</title>
            </circle>
          ))}
        </g>
        <text x={px0 + pIn} y={yBottom + 18} className="dg-axis">
          {tMin}°
        </text>
        <text x={px1 - pIn} y={yBottom + 18} textAnchor="end" className="dg-axis">
          {tMax}°C
        </text>
        <text x={(px0 + px1) / 2} y={yBottom + 18} textAnchor="middle" className="dg-axis dg-axis--title">
          {narrow ? 'Temp' : 'Temperature'}
        </text>
      </svg>
      <figcaption className="diagram__key">
        <span className="key key--cloud">Cloud or fog</span>
        <span className="key key--lid">Warm lid (inversion)</span>
        <span className="key key--wet">Saturated air</span>
      </figcaption>
    </figure>
  );
};

export default ProfileDiagram;
