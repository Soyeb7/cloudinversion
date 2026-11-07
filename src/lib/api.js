// Thin wrappers around the free Open-Meteo APIs (no key, CORS enabled).
// Weather data by Open-Meteo.com, licensed CC BY 4.0.

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

export async function searchPlaces(query, signal) {
  const params = new URLSearchParams({ name: query, count: '8', language: 'en', format: 'json' });
  const res = await fetch(`${GEO_URL}?${params}`, { signal });
  if (!res.ok) throw new Error(`Place search failed (${res.status})`);
  const data = await res.json();
  return (data.results || []).map((r) => ({
    id: r.id,
    name: r.name,
    latitude: r.latitude,
    longitude: r.longitude,
    elevation: r.elevation,
    country: r.country,
    countryCode: r.country_code,
    admin1: r.admin1,
    admin2: r.admin2,
    featureCode: r.feature_code,
  }));
}

export async function fetchElevation({ latitude, longitude }, signal) {
  const params = new URLSearchParams({ latitude: latitude.toFixed(4), longitude: longitude.toFixed(4) });
  const res = await fetch(`https://api.open-meteo.com/v1/elevation?${params}`, { signal });
  if (!res.ok) return null;
  const data = await res.json();
  return data.elevation && data.elevation.length ? data.elevation[0] : null;
}

export async function fetchForecast({ latitude, longitude }, signal) {
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
    forecast_days: '5',
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
