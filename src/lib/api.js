// Thin wrappers around the free Open-Meteo APIs (no key, CORS enabled).
// Weather data by Open-Meteo.com, licensed CC BY 4.0.

import { REGIONS, VIEWPOINTS } from '../data/regions';

const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

// Pressure levels that cover the lowest ~3 km of the atmosphere, where
// valley fog, cold-air pools and anticyclonic stratocumulus live.
export const LEVELS = [1000, 975, 950, 925, 900, 850, 800, 700];

const SURFACE_VARS = [
  'temperature_2m',
  'dew_point_2m',
  'relative_humidity_2m',
  'wind_speed_10m',
  'cloud_cover',
  'cloud_cover_low',
  'cloud_cover_mid',
  'cloud_cover_high',
  'visibility',
  'precipitation',
  'pressure_msl',
  'boundary_layer_height',
  'weather_code',
];

const LEVEL_VARS = ['temperature', 'relative_humidity', 'geopotential_height', 'wind_speed', 'cloud_cover'];

const norm = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const km = (a, b) => {
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.latitude * Math.PI) / 180) * Math.cos((b.latitude * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(x));
};

// Towns, villages and admin areas, ranked by population (GeoNames).
async function searchOpenMeteo(query, signal) {
  const params = new URLSearchParams({ name: query, count: '8', language: 'en', format: 'json' });
  const res = await fetch(`${GEO_URL}?${params}`, { signal });
  if (!res.ok) throw new Error(`Place search failed (${res.status})`);
  const data = await res.json();
  return (data.results || []).map((r) => ({
    id: `gn-${r.id}`,
    name: r.name,
    latitude: r.latitude,
    longitude: r.longitude,
    elevation: r.elevation,
    country: r.country,
    countryCode: r.country_code,
    admin1: r.admin1,
    admin2: r.admin2,
    featureCode: r.feature_code,
    source: 'geonames',
  }));
}

// OpenStreetMap search via Photon (built for search-as-you-type). Covers hills,
// peaks, edges and viewpoints that GeoNames often lacks, such as Mam Tor.
const PHOTON_KEEP = {
  place: ['city', 'town', 'village', 'hamlet', 'locality', 'suburb', 'isolated_dwelling', 'island', 'neighbourhood'],
  natural: ['peak', 'hill', 'volcano', 'ridge', 'saddle', 'valley', 'cliff', 'fell', 'arete', 'plateau', 'mountain_range'],
  tourism: ['viewpoint'],
  mountain_pass: ['yes'],
};
const PHOTON_CODE = { peak: 'PK', hill: 'HLL', volcano: 'PK', ridge: 'RDGE', cliff: 'RDGE', arete: 'RDGE', fell: 'HLL', saddle: 'PASS', yes: 'PASS', viewpoint: 'PK' };

async function searchPhoton(query, signal) {
  const params = new URLSearchParams({ q: query, limit: '12', lang: 'en' });
  const res = await fetch(`https://photon.komoot.io/api/?${params}`, { signal });
  if (!res.ok) throw new Error(`Place search failed (${res.status})`);
  const data = await res.json();
  return (data.features || [])
    .filter((f) => {
      const keep = PHOTON_KEEP[f.properties.osm_key];
      return keep && keep.includes(f.properties.osm_value) && f.properties.name;
    })
    .map((f) => {
      const p = f.properties;
      return {
        id: `osm-${p.osm_type}${p.osm_id}`,
        name: p.name,
        latitude: f.geometry.coordinates[1],
        longitude: f.geometry.coordinates[0],
        elevation: null,
        country: p.country,
        countryCode: p.countrycode,
        admin1: p.county || p.state,
        featureCode: PHOTON_CODE[p.osm_value] || (p.osm_key === 'place' ? 'PPL' : undefined),
        source: 'osm',
      };
    });
}

// Combine curated viewpoints, GeoNames and OpenStreetMap results, dropping
// duplicates (same name within a few km). Either remote source can fail on its
// own without breaking search.
export async function searchPlaces(query, signal) {
  const q = norm(query);
  const compact = (s) => norm(s).replace(/ /g, '');
  const curated = [...VIEWPOINTS, ...REGIONS.map((r) => ({ ...r.base, id: `base-${r.slug}`, source: 'curated' }))].filter(
    (p) => norm(p.name).split(' ').some((w) => w.startsWith(q)) || compact(p.name).startsWith(compact(query))
  );
  // Gently prefer places in the visitor's own country (from the browser locale).
  const localCountry =
    typeof navigator !== 'undefined' && navigator.language && navigator.language.includes('-')
      ? navigator.language.split('-')[1].toUpperCase()
      : null;

  const [om, osm] = await Promise.allSettled([searchOpenMeteo(query, signal), searchPhoton(query, signal)]);
  if (signal && signal.aborted) throw Object.assign(new Error('aborted'), { name: 'AbortError' });
  if (om.status === 'rejected' && osm.status === 'rejected' && !curated.length) throw om.reason;
  const remote = [...(om.status === 'fulfilled' ? om.value : []), ...(osm.status === 'fulfilled' ? osm.value : [])];

  // Exact or prefix name matches first, then hills/peaks, then the rest in source order.
  const rank = (p) => {
    const n = norm(p.name);
    let r = n === q ? 0 : n.startsWith(q) ? 1 : 2;
    if (['PK', 'HLL', 'MT', 'RDGE'].includes(p.featureCode)) r -= 0.5;
    if (localCountry && p.countryCode === localCountry) r -= 0.6;
    return r;
  };
  const sorted = remote.map((p, i) => ({ p, i, r: rank(p) })).sort((a, b) => a.r - b.r || a.i - b.i).map((x) => x.p);

  const out = [];
  [...curated, ...sorted].forEach((p) => {
    const dupe = out.find((o) => compact(o.name) === compact(p.name) && km(o, p) < 4);
    if (dupe) {
      if (dupe.elevation == null && p.elevation != null && dupe.source !== 'curated') dupe.elevation = p.elevation;
      return;
    }
    out.push({ ...p });
  });
  return out.slice(0, 8);
}

export async function fetchElevation({ latitude, longitude }, signal) {
  const params = new URLSearchParams({ latitude: latitude.toFixed(4), longitude: longitude.toFixed(4) });
  const res = await fetch(`https://api.open-meteo.com/v1/elevation?${params}`, { signal });
  if (!res.ok) return null;
  const data = await res.json();
  return data.elevation && data.elevation.length ? data.elevation[0] : null;
}

export async function fetchForecast({ latitude, longitude }, signal, { days = 5 } = {}) {
  const hourly = [
    ...SURFACE_VARS,
    ...LEVELS.flatMap((p) => LEVEL_VARS.map((v) => `${v}_${p}hPa`)),
  ];
  const params = new URLSearchParams({
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    hourly: hourly.join(','),
    daily: 'sunrise,sunset',
    timezone: 'auto',
    past_days: '1',
    forecast_days: String(days),
    wind_speed_unit: 'ms',
    // Use the model's own terrain height rather than downscaling 2 m values to
    // the exact spot: downscaling applies a fixed lapse rate, which would hide
    // the very inversion we are looking for.
    elevation: 'nan',
  });
  const res = await fetch(`${FORECAST_URL}?${params}`, { signal });
  if (!res.ok) {
    let reason = '';
    try {
      reason = (await res.json()).reason || '';
    } catch (e) {
      // ignore
    }
    throw new Error(reason || `Forecast request failed (${res.status})`);
  }
  return res.json();
}
