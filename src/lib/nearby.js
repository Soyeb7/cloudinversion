// Nearby high ground for a searched place, so someone who types a city name
// gets told where they could actually stand above the cloud.
//
// Sources: named peaks and hills from OpenStreetMap (Photon reverse search,
// nearest first), heights from the Open-Meteo 90 m terrain model, plus the
// curated viewpoints in data/regions.js (which carry true summit heights).

import { VIEWPOINTS } from '../data/regions';
import { heightStatus } from './inversion';

const RADIUS_KM = 35;
const toRad = (d) => (d * Math.PI) / 180;

export function distanceKm(a, b) {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const x =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(x));
}

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
export function bearing(a, b) {
  const y = Math.sin(toRad(b.longitude - a.longitude)) * Math.cos(toRad(b.latitude));
  const x =
    Math.cos(toRad(a.latitude)) * Math.sin(toRad(b.latitude)) -
    Math.sin(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.cos(toRad(b.longitude - a.longitude));
  const deg = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  return COMPASS[Math.round(deg / 45) % 8];
}

async function photonHills(place, signal) {
  const params = new URLSearchParams({
    lat: place.latitude.toFixed(4),
    lon: place.longitude.toFixed(4),
    lang: 'en',
    radius: String(RADIUS_KM),
    limit: '50',
  });
  const url = `https://photon.komoot.io/reverse?${params}&osm_tag=natural:peak&osm_tag=natural:hill`;
  let res = await fetch(url, { signal });
  if (res.status === 503 || res.status === 429) {
    // Busy: one polite retry after a short pause
    await new Promise((r) => setTimeout(r, 1500));
    res = await fetch(url, { signal });
  }
  if (!res.ok) throw new Error(`Hill search failed (${res.status})`);
  const data = await res.json();
  return (data.features || [])
    .filter((f) => f.properties && f.properties.name)
    .map((f) => ({
      name: f.properties.name,
      latitude: f.geometry.coordinates[1],
      longitude: f.geometry.coordinates[0],
      height: null,
      source: 'osm',
    }));
}

async function terrainHeights(points, signal) {
  if (!points.length) return [];
  const params = new URLSearchParams({
    latitude: points.map((p) => p.latitude.toFixed(4)).join(','),
    longitude: points.map((p) => p.longitude.toFixed(4)).join(','),
  });
  const res = await fetch(`https://api.open-meteo.com/v1/elevation?${params}`, { signal });
  if (!res.ok) throw new Error(`Elevation lookup failed (${res.status})`);
  const data = await res.json();
  return data.elevation || [];
}

const cacheGet = (key) => {
  try {
    const v = sessionStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch (e) {
    return null;
  }
};
const cacheSet = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // storage full or blocked: fine, just don't cache
  }
};

// Returns { hills: [...], partial } where each hill has name, latitude,
// longitude, height (m), exact (true summit height known), km and dir.
export async function fetchNearbyHills(place, signal) {
  const key = `ci-hills:${place.latitude.toFixed(2)},${place.longitude.toFixed(2)}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  const curated = VIEWPOINTS.filter((v) => distanceKm(place, v) <= RADIUS_KM + 10).map((v) => ({
    name: v.name,
    latitude: v.latitude,
    longitude: v.longitude,
    height: v.elevation,
    exact: true,
    source: 'curated',
  }));

  let osm = [];
  let partial = false;
  try {
    osm = await photonHills(place, signal);
    const heights = await terrainHeights(osm, signal);
    osm = osm.map((h, i) => ({ ...h, height: heights[i], exact: false }));
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    partial = true;
    osm = [];
  }

  // Curated entries win over map duplicates (same name, or within 600 m).
  const out = [...curated];
  osm.forEach((h) => {
    if (typeof h.height !== 'number') return;
    const dupe = out.some(
      (o) => o.name.toLowerCase().replace(/\W/g, '') === h.name.toLowerCase().replace(/\W/g, '') || distanceKm(o, h) < 0.6
    );
    if (!dupe) out.push(h);
  });

  const hills = out.map((h) => ({
    ...h,
    km: distanceKm(place, h),
    dir: bearing(place, h),
  }));
  const result = { hills, partial };
  if (!partial) cacheSet(key, result);
  return result;
}

// Choose what to show for one morning. Returns { mode, items } where mode is
// 'above' (some hills clear the cloud), 'none-clear' (cloud is higher than
// everything nearby) or 'no-sea' (no cloud sea forecast).
export function suggestFor(hills, morning, placeElevation) {
  const floor = (typeof placeElevation === 'number' ? placeElevation : 0) + 80;
  const candidates = hills.filter((h) => h.height >= floor);
  const hasSea = morning.cloudTop && morning.band.key !== 'unlikely';

  if (!hasSea) {
    // No cloud to beat: suggest the best viewpoints for another morning, i.e.
    // the highest ground within reach rather than the nearest small knoll.
    const reach = candidates.filter((h) => h.km <= 25);
    const items = (reach.length >= 3 ? reach : candidates)
      .slice()
      .sort((a, b) => b.height - a.height)
      .slice(0, 5)
      .sort((a, b) => a.km - b.km)
      .map((h) => ({ ...h, status: null }));
    return { mode: 'no-sea', items };
  }

  const top = morning.cloudTop;
  const withStatus = candidates.map((h) => ({
    ...h,
    status: heightStatus(top, h.height),
  }));
  const above = withStatus.filter((h) => h.status === 'above').sort((a, b) => a.km - b.km);
  const edge = withStatus.filter((h) => h.status === 'edge').sort((a, b) => a.km - b.km);

  if (above.length) {
    return { mode: 'above', items: [...above.slice(0, 5), ...edge.slice(0, Math.max(0, 6 - Math.min(5, above.length)))].slice(0, 6) };
  }
  const highest = withStatus.sort((a, b) => b.height - a.height).slice(0, 3);
  return { mode: 'none-clear', items: highest };
}
