import { analyse, findInversion, viewpointVerdict } from './inversion';
import { LEVELS } from './api';

// Build a synthetic Open-Meteo response with the same dawn profile every hour.
// `levels` maps hPa -> { z, t, rh, cloud?, wind? }.
function makeForecast({
  ground = 100,
  surface,
  levels,
  low = 0,
  mid = 0,
  high = 0,
  precip = 0,
  pressure = 1028,
  nightCloud = 10,
}) {
  const days = ['2026-11-06', '2026-11-07', '2026-11-08'];
  const time = [];
  days.forEach((d) => {
    for (let hh = 0; hh < 24; hh += 1) time.push(`${d}T${String(hh).padStart(2, '0')}:00`);
  });
  const n = time.length;
  const fill = (v) => new Array(n).fill(v);
  const hourly = {
    time,
    temperature_2m: fill(surface.t),
    dew_point_2m: fill(surface.td),
    relative_humidity_2m: fill(surface.rh),
    wind_speed_10m: fill(surface.wind),
    cloud_cover: fill(nightCloud),
    cloud_cover_low: fill(low),
    cloud_cover_mid: fill(mid),
    cloud_cover_high: fill(high),
    visibility: fill(surface.vis == null ? 20000 : surface.vis),
    precipitation: fill(precip),
    pressure_msl: fill(pressure),
    boundary_layer_height: fill(100),
    weather_code: fill(0),
  };
  LEVELS.forEach((p) => {
    const l = levels[p] || { z: 9000, t: -40, rh: 20 };
    hourly[`temperature_${p}hPa`] = fill(l.t);
    hourly[`relative_humidity_${p}hPa`] = fill(l.rh);
    hourly[`geopotential_height_${p}hPa`] = fill(l.z);
    hourly[`wind_speed_${p}hPa`] = fill(l.wind == null ? 3 : l.wind);
    hourly[`cloud_cover_${p}hPa`] = fill(l.cloud == null ? 0 : l.cloud);
  });
  return {
    elevation: ground,
    utc_offset_seconds: 0,
    hourly,
    daily: {
      time: days,
      sunrise: days.map((d) => `${d}T07:20`),
      sunset: days.map((d) => `${d}T16:30`),
    },
  };
}

const NOW = '2026-11-07T00:00';
const first = (f) => analyse(makeForecast(f), NOW).mornings[0];

// Anticyclonic stratus: saturated up to ~600 m, strong warm dry lid above.
const stratus = {
  surface: { t: 3, td: 2.6, rh: 97, wind: 1.5 },
  levels: {
    1000: { z: 180, t: 2.6, rh: 98, cloud: 90 },
    975: { z: 390, t: 1.4, rh: 99, cloud: 100 },
    950: { z: 600, t: 0.4, rh: 99, cloud: 100 },
    925: { z: 820, t: 5.5, rh: 40 },
    900: { z: 1050, t: 6.0, rh: 30 },
    850: { z: 1500, t: 3.5, rh: 25 },
    800: { z: 1980, t: 0.5, rh: 25 },
    700: { z: 3000, t: -6, rh: 20 },
  },
  low: 95,
};

describe('findInversion', () => {
  it('finds an elevated lid and its strength', () => {
    const pts = [
      { z: 102, t: 3 },
      { z: 600, t: 0.4 },
      { z: 820, t: 5.5 },
      { z: 1050, t: 6 },
      { z: 1500, t: 3.5 },
    ];
    const inv = findInversion(pts, 100);
    expect(inv.base).toBe(600);
    expect(inv.top).toBe(1050);
    expect(inv.strength).toBeCloseTo(5.6);
  });

  it('returns null when temperature falls steadily with height', () => {
    const pts = [
      { z: 102, t: 10 },
      { z: 400, t: 8 },
      { z: 800, t: 5 },
      { z: 1500, t: 0 },
    ];
    expect(findInversion(pts, 100)).toBeNull();
  });
});

describe('analyse', () => {
  it('rates stratus under a strong dry lid as very likely, with tops near the lid base', () => {
    const m = first(stratus);
    expect(m.band.key).toBe('very-likely');
    expect(m.cloudTop).toBeGreaterThan(550);
    expect(m.cloudTop).toBeLessThan(800);
    expect(viewpointVerdict(m, 950).key).toBe('above');
    expect(viewpointVerdict(m, 400).key).toBe('in');
  });

  it('rates a dry inversion (clear frosty valley) as unlikely', () => {
    const dry = {
      surface: { t: -3, td: -9, rh: 62, wind: 0.8 },
      levels: {
        1000: { z: 180, t: 0, rh: 50 },
        975: { z: 390, t: 3, rh: 40 },
        950: { z: 600, t: 4, rh: 35 },
        925: { z: 820, t: 3, rh: 30 },
        900: { z: 1050, t: 1.5, rh: 30 },
        850: { z: 1500, t: -1, rh: 25 },
        800: { z: 1980, t: -4, rh: 25 },
        700: { z: 3000, t: -10, rh: 20 },
      },
    };
    expect(first(dry).band.key).toBe('unlikely');
  });

  it('rates moist air without any lid as unlikely', () => {
    const noLid = {
      surface: { t: 9, td: 8.8, rh: 99, wind: 2 },
      levels: {
        1000: { z: 180, t: 8.4, rh: 99, cloud: 100 },
        975: { z: 390, t: 7, rh: 99, cloud: 100 },
        950: { z: 600, t: 5.6, rh: 98, cloud: 100 },
        925: { z: 820, t: 4.2, rh: 97, cloud: 100 },
        900: { z: 1050, t: 2.8, rh: 95 },
        850: { z: 1500, t: 0, rh: 90 },
        800: { z: 1980, t: -3, rh: 80 },
        700: { z: 3000, t: -9, rh: 60 },
      },
      low: 100,
      mid: 80,
      pressure: 1004,
    };
    expect(first(noLid).band.key).toBe('unlikely');
  });

  it('marks strong wind and rain down from the same stratus set-up', () => {
    const calm = first(stratus).score;
    const windy = first({
      ...stratus,
      surface: { ...stratus.surface, wind: 9 },
      levels: { ...stratus.levels, 950: { ...stratus.levels[950], wind: 12 }, 925: { ...stratus.levels[925], wind: 12 } },
    }).score;
    const wet = first({ ...stratus, precip: 1.2 }).score;
    expect(windy).toBeLessThan(calm - 25);
    expect(wet).toBeLessThan(calm - 30);
  });

  it('ignores pressure levels below the model ground at high sites', () => {
    const m = first({ ...stratus, ground: 700 });
    expect(m.profile.every((p) => p.z >= 700)).toBe(true);
  });

  it('does not count low cloud sitting above the lid as cloud underneath', () => {
    // Shallow surface lid over drier valley air, cloud deck on the hills above.
    const hillFog = {
      surface: { t: 4, td: 0, rh: 75, wind: 2 },
      levels: {
        1000: { z: 180, t: 5, rh: 78 },
        975: { z: 390, t: 3.8, rh: 85 },
        950: { z: 600, t: 2.4, rh: 99, cloud: 100 },
        925: { z: 820, t: 1, rh: 99, cloud: 100 },
        900: { z: 1050, t: -0.5, rh: 95 },
        850: { z: 1500, t: -3, rh: 80 },
        800: { z: 1980, t: -6, rh: 60 },
        700: { z: 3000, t: -12, rh: 40 },
      },
      low: 90,
    };
    expect(['unlikely', 'possible']).toContain(first(hillFog).band.key);
  });

  it('skips dawns that are already well past', () => {
    const r = analyse(makeForecast(stratus), '2026-11-07T12:00');
    expect(r.mornings.map((m) => m.date)).toEqual(['2026-11-08']);
  });
});
