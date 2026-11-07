// Cloud inversion model.
//
// A "cloud inversion" (sea of cloud seen from above) needs three things at once:
//   1. A temperature inversion: a layer where air gets warmer with height. It acts
//      as a lid that stops the cloud below from mixing upwards.
//   2. Saturated air (fog or low stratus) trapped beneath that lid.
//   3. Dry, clear air above the lid, so someone standing above it sees sun and
//      a cloud sea rather than more cloud.
// Supporting conditions (light wind, high pressure, a long clear night, damp
// ground) make each ingredient more likely and more persistent.
//
// We read the vertical profile from model pressure levels (each with its real
// geopotential height) rather than comparing 2 m temperatures at different
// elevations, which are lapse-rate adjusted and cannot show an inversion.

import { LEVELS } from './api';

const MAX_SEARCH_AGL = 2200; // look for an inversion lid within ~2.2 km of the ground
const SATURATED_RH = 92; // RH treated as cloud/fog inside a model layer
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
// Smooth 0..1 ramp between two thresholds (works for either direction).
const ramp = (x, from, to) => clamp((x - from) / (to - from));
const lerp = (a, b, t) => a + (b - a) * t;
const avg = (xs) => xs.reduce((s, x) => s + x, 0) / (xs.length || 1);
const num = (x) => typeof x === 'number' && !Number.isNaN(x);

// Build a bottom-up profile for one hour: the 2 m point at model ground height
// plus every pressure level that sits above ground.
export function profileAt(hourly, i, ground) {
  const pts = [];
  if (num(hourly.temperature_2m[i])) {
    pts.push({
      z: ground + 2,
      t: hourly.temperature_2m[i],
      rh: hourly.relative_humidity_2m[i],
      cloud: null,
      wind: hourly.wind_speed_10m[i],
      level: 'surface',
    });
  }
  LEVELS.forEach((p) => {
    const z = hourly[`geopotential_height_${p}hPa`][i];
    const t = hourly[`temperature_${p}hPa`][i];
    if (!num(z) || !num(t) || z < ground + 40) return; // below or hugging the ground: extrapolated
    pts.push({
      z,
      t,
      rh: hourly[`relative_humidity_${p}hPa`][i],
      cloud: hourly[`cloud_cover_${p}hPa`] ? hourly[`cloud_cover_${p}hPa`][i] : null,
      wind: hourly[`wind_speed_${p}hPa`][i],
      level: `${p} hPa`,
    });
  });
  return pts.sort((a, b) => a.z - b.z);
}

// Find the strongest layer in which temperature rises with height. Consecutive
// warming segments are merged so a lid spread over two model levels counts once.
export function findInversion(pts, ground) {
  let best = null;
  let i = 0;
  while (i < pts.length - 1) {
    if (pts[i].z - ground > MAX_SEARCH_AGL) break;
    if (pts[i + 1].t > pts[i].t) {
      let j = i + 1;
      while (j < pts.length - 1 && pts[j + 1].t >= pts[j].t && pts[j + 1].z - ground < MAX_SEARCH_AGL + 600) j += 1;
      const strength = pts[j].t - pts[i].t;
      const depth = pts[j].z - pts[i].z;
      // Prefer strong lids; a slightly weaker but lower lid still wins ties.
      const merit = strength - (pts[i].z - ground) / 2000;
      if (!best || merit > best.merit) {
        best = { baseIdx: i, topIdx: j, base: pts[i].z, top: pts[j].z, strength, depth, merit };
      }
      i = j;
    } else {
      i += 1;
    }
  }
  if (best) {
    best.surfaceBased = best.baseIdx === 0;
    best.lapse = (best.strength / Math.max(best.depth, 1)) * 100; // °C per 100 m
  }
  return best;
}

// Near-isothermal layers (temperature barely falling) are also stable and can
// cap cloud; used when no outright inversion is found.
function findStableLayer(pts, ground) {
  let best = null;
  for (let i = 0; i < pts.length - 1; i += 1) {
    if (pts[i].z - ground > MAX_SEARCH_AGL) break;
    const dz = pts[i + 1].z - pts[i].z;
    const lapse = ((pts[i].t - pts[i + 1].t) / dz) * 1000; // °C per km, positive = cooling with height
    if (lapse < 2.5 && (!best || lapse < best.lapseKm)) {
      best = { baseIdx: i, topIdx: i + 1, base: pts[i].z, top: pts[i + 1].z, lapseKm: lapse };
    }
  }
  return best;
}

const LEVEL_BANDS = [
  { min: 72, key: 'very-likely', label: 'Very likely' },
  { min: 52, key: 'likely', label: 'Likely' },
  { min: 32, key: 'possible', label: 'Possible' },
  { min: 0, key: 'unlikely', label: 'Unlikely' },
];

export const bandFor = (score) => LEVEL_BANDS.find((b) => score >= b.min);

// Find the saturated (cloud or fog) layer that touches or sits just under the
// lid. Scans upward from the ground and returns where RH falls below the
// saturation threshold, interpolating between model levels.
function cloudLayer(pts, lid) {
  const wet = (p) => p.rh >= SATURATED_RH || (p.cloud != null && p.cloud >= 70);
  const limit = lid ? lid.topIdx : Math.min(2, pts.length - 1);
  let base = null;
  let top = null;
  for (let k = 0; k <= limit; k += 1) {
    if (wet(pts[k])) {
      if (base == null) base = pts[k].z;
      top = pts[k].z;
      const next = pts[k + 1];
      if (next && !wet(next)) {
        const f = clamp((pts[k].rh - SATURATED_RH) / Math.max(pts[k].rh - next.rh, 1));
        top = lerp(pts[k].z, next.z, f);
        break;
      }
    } else if (top != null) {
      break;
    }
  }
  return top == null ? null : { base, top };
}

function assessHour(h, i, ground) {
  const pts = profileAt(h, i, ground);
  if (pts.length < 3) return null;
  const surface = pts[0];
  const inv = findInversion(pts, ground);
  const stable = inv ? null : findStableLayer(pts, ground);
  const lid = inv || stable;

  // 1. Lid (0..1). A fraction of a degree is a weak lid; 3 °C or more is strong.
  let sLid = 0;
  if (inv) sLid = 0.25 + 0.75 * ramp(inv.strength, 0.2, 3);
  else if (stable) sLid = 0.1 + 0.15 * ramp(2.5 - stable.lapseKm, 0, 2.5);

  // 2. Cloud or fog beneath the lid (0..1). Needs real evidence of saturation:
  // model low cloud, near-100% humidity, a tiny dew-point spread or fog-level
  // visibility. A dry cold pool (clear frosty valley) scores low here.
  const cloud = cloudLayer(pts, lid);
  const underIdx = lid ? lid.baseIdx : 0;
  const belowRh = Math.max(...pts.slice(0, underIdx + 1).map((p) => p.rh || 0));
  const spread = surface.t - h.dew_point_2m[i];
  const lowCloud = h.cloud_cover_low[i] || 0;
  const vis = h.visibility ? h.visibility[i] : null;
  const sMoist = clamp(
    Math.max(
      ramp(lowCloud, 25, 85),
      ramp(belowRh, 90, 99),
      num(spread) ? 0.85 * ramp(spread, 2, 0.3) : 0,
      num(vis) ? ramp(vis, 5000, 1000) : 0,
      cloud ? 0.6 : 0
    )
  );

  // 3. Clear air above (0..1): humidity drops away above the lid, and little
  // mid/high cloud overhead to spoil the view.
  const fromIdx = lid ? lid.topIdx : 1;
  const above = pts.slice(fromIdx, fromIdx + 2);
  const aboveRh = avg(above.map((p) => p.rh || 0));
  const midHigh = Math.max(h.cloud_cover_mid[i] || 0, (h.cloud_cover_high[i] || 0) * 0.6);
  const sClear = clamp(ramp(aboveRh, 95, 60) * 0.5 + ramp(midHigh, 90, 15) * 0.5);

  // 4. Wind (0..1). Persistent cold pools need valley winds of about 3 m/s or
  // less (Whiteman et al. 2001); boundary-layer winds above ~7-8 m/s mix fog
  // out (NWS). Wind at the lid matters as well as at the surface.
  const lidWind = lid ? avg(pts.slice(lid.baseIdx, lid.topIdx + 1).map((p) => p.wind || 0)) : surface.wind;
  const sWind = clamp(ramp(surface.wind, 6, 2.5) * 0.6 + ramp(lidWind, 10, 4) * 0.4);

  // 5. Precipitation at dawn means fronts and showers, not a cloud sea.
  const precip = h.precipitation[i] || 0;
  const sDry = precip > 0.4 ? 0.3 : precip > 0.1 ? 0.65 : 1;

  return { pts, inv, stable, lid, cloud, sLid, sMoist, sClear, sWind, sDry, spread, lowCloud, midHigh, aboveRh, belowRh, lidWind, precip, vis };
}

// The lid and the cloud under it are both essential, so they multiply.
// Clear air above, wind and dryness scale the result but cannot zero it: a cloud
// sea under a grey sky, or one that breaks up in a breeze, still happens.
function combine(a) {
  return (
    Math.pow(a.sLid, 0.8) *
    a.sMoist *
    (0.35 + 0.65 * a.sClear) *
    (0.4 + 0.6 * a.sWind) *
    a.sDry
  );
}

// Night-time and synoptic context, evaluated over the night before a dawn.
function nightContext(h, sunriseIdx, sunsetIdx) {
  const from = sunsetIdx >= 0 ? sunsetIdx : Math.max(0, sunriseIdx - 12);
  const night = [];
  for (let k = from; k <= sunriseIdx; k += 1) night.push(k);
  const clearNight = avg(night.map((k) => h.cloud_cover[k] || 0));
  const nightWind = avg(night.map((k) => h.wind_speed_10m[k] || 0));
  const rain = h.precipitation
    .slice(Math.max(0, sunriseIdx - 36), Math.max(0, sunriseIdx - 6))
    .reduce((s, x) => s + (x || 0), 0);
  const pressure = h.pressure_msl[sunriseIdx];
  const pressure12 = h.pressure_msl[Math.max(0, sunriseIdx - 12)];
  return { cloudyNight: clearNight, nightWind, rain, pressure, trend: pressure - pressure12, nightHours: night.length };
}

// Context nudges the score up or down by at most about a quarter; it can make
// a good set-up better but cannot invent one.
function contextFactor(ctx, a, valleyDepth = 0) {
  let b = 0;
  // The model smooths terrain, so a valley floor well below the model ground
  // pools cold air the model can't see (Whiteman et al. 2001). Only counts on
  // calm, fairly clear nights when drainage flows set up.
  if (valleyDepth > 80 && ctx.nightWind < 3 && ctx.cloudyNight < 50 && a.sMoist > 0.3) b += 0.08;
  if (ctx.pressure >= 1030) b += 0.12;
  else if (ctx.pressure >= 1022) b += 0.07;
  else if (ctx.pressure < 1008) b -= 0.12;
  if (ctx.trend <= -4) b -= 0.08; // falling fast: a front is coming
  if (ctx.nightWind < 2.5) b += 0.04;
  if (ctx.nightHours >= 13) b += 0.03; // long autumn/winter nights cool more
  if (a.inv && a.inv.surfaceBased && ctx.cloudyNight < 35) b += 0.05; // clear night, radiative cooling
  if (ctx.rain > 1 && ctx.rain < 25) b += 0.03; // damp ground feeds valley fog
  return 1 + clamp(b, -0.25, 0.25);
}

// Score a single dawn: look from first light (about 1 h before sunrise) to 2 h
// after and take the best hour. Radiation fog life cycles centre on sunrise (Meyer & Lala 1990),
// and fog often lifts into a stratus layer after sunrise, which a summit still
// looks down on.
function assessMorning(h, ground, sunriseIso, sunsetIdx, valleyDepth) {
  const srHour = `${sunriseIso.slice(0, 13)}:00`;
  const sIdx = h.time.indexOf(srHour);
  if (sIdx < 0) return null;
  const window = [sIdx - 1, sIdx, sIdx + 1, sIdx + 2].filter((k) => k >= 0 && k < h.time.length);
  const ctx = nightContext(h, sIdx, sunsetIdx);

  let best = null;
  window.forEach((k) => {
    const a = assessHour(h, k, ground);
    if (!a) return;
    const core = combine(a);
    const score = clamp(core * contextFactor(ctx, a, valleyDepth)) * 100;
    if (!best || score > best.score) best = { ...a, idx: k, score };
  });
  if (!best) return null;

  // Cloud top estimate (metres above sea level). Use the saturated layer the
  // model shows; with only surface signs of fog, assume a shallow valley fog
  // bank (radiation fog is typically 50-200 m deep).
  let cloudTop = best.cloud ? best.cloud.top : null;
  let fogOnly = false;
  if (best.sMoist > 0.5 && best.lid && (!cloudTop || cloudTop < ground + 60)) {
    cloudTop = Math.min(best.lid.top, ground + 150);
    fogOnly = true;
  }
  // Under an elevated lid the cloud top sits at about the inversion base
  // (MeteoSwiss); radiation fog tops sit inside a surface-based inversion.
  if (cloudTop && best.lid) {
    const cap = best.lid.baseIdx === 0 ? best.lid.top : best.lid.base + 0.35 * (best.lid.top - best.lid.base);
    cloudTop = Math.min(cloudTop, cap);
  }
  const lidTop = best.lid ? best.lid.top : null;

  return {
    date: sunriseIso.slice(0, 10),
    sunrise: sunriseIso,
    peakTime: h.time[best.idx],
    score: Math.round(best.score),
    band: bandFor(best.score),
    profile: best.pts,
    inversion: best.inv,
    stable: best.stable,
    cloudTop,
    fogOnly,
    lidTop,
    // A safe viewpoint is a little above the cloud top: tops undulate and rise
    // as the morning warms (MWIS often says "just above the cloud top").
    aimAbove: cloudTop ? Math.ceil((cloudTop + 100) / 50) * 50 : null,
    ingredients: {
      lid: best.sLid,
      moisture: best.sMoist,
      clearAbove: best.sClear,
      wind: best.sWind,
      dry: best.sDry,
    },
    readings: {
      surfaceTemp: best.pts[0].t,
      dewPoint: h.dew_point_2m[best.idx],
      spread: best.spread,
      surfaceRh: h.relative_humidity_2m[best.idx],
      wind: h.wind_speed_10m[best.idx],
      lidWind: best.lidWind,
      lowCloud: best.lowCloud,
      midCloud: h.cloud_cover_mid[best.idx],
      highCloud: h.cloud_cover_high[best.idx],
      aboveRh: best.aboveRh,
      belowRh: best.belowRh,
      visibility: best.vis,
      precip: best.precip,
      blh: h.boundary_layer_height ? h.boundary_layer_height[best.idx] : null,
    },
    context: ctx,
  };
}

// Entry point: turn an Open-Meteo response into one assessment per upcoming dawn.
export function analyse(forecast, nowIso, placeElevation) {
  const h = forecast.hourly;
  const ground = forecast.elevation;
  const { sunrise, sunset } = forecast.daily;
  const valleyDepth = num(placeElevation) ? ground - placeElevation : 0;
  const mornings = [];
  sunrise.forEach((sr, d) => {
    if (!sr || d === 0) return; // day 0 is "yesterday" (past_days=1)
    const prevSunset = sunset[d - 1];
    const ssIdx = prevSunset ? h.time.indexOf(`${prevSunset.slice(0, 13)}:00`) : -1;
    // Skip dawns more than ~3 hours in the past (the place's local time)
    if (nowIso) {
      const srIdx = h.time.indexOf(`${sr.slice(0, 13)}:00`);
      const nowIdx = h.time.indexOf(`${nowIso.slice(0, 13)}:00`);
      if (srIdx >= 0 && nowIdx >= 0 && nowIdx > srIdx + 3) return;
    }
    const m = assessMorning(h, ground, sr, ssIdx, valleyDepth);
    if (m) mornings.push(m);
  });
  return { ground, valleyDepth, mornings };
}

// Is a viewpoint at `height` metres above the cloud for this morning?
export function viewpointVerdict(m, height) {
  if (!num(height) || height <= 0) return null;
  if (m.cloudTop && height < m.cloudTop - 50 && m.band.key === 'unlikely') {
    return { key: 'in', text: `Cloud is forecast up to about ${Math.round(m.cloudTop / 50) * 50} m, so you’d likely be in it.` };
  }
  if (m.band.key === 'unlikely' || !m.cloudTop) {
    return { key: 'none', text: 'No cloud sea expected below you, so expect ordinary views.' };
  }
  const margin = height - m.cloudTop;
  if (margin >= 150) return { key: 'above', text: 'Comfortably above the forecast cloud tops.' };
  if (margin >= 0) return { key: 'edge', text: 'Only just above the forecast cloud tops. Tops vary by 100 m or more, so you may be in and out of the cloud.' };
  if (margin > -150) return { key: 'edge', text: 'Right around the forecast cloud tops. A higher viewpoint would be safer.' };
  return { key: 'in', text: 'Below the forecast cloud tops, so you’d likely be inside the cloud. Head higher.' };
}
