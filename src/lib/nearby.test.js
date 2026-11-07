import { bearing, distanceKm, suggestFor } from './nearby';

const hill = (name, height, km) => ({ name, height, km, latitude: 53, longitude: -1.5, dir: 'N' });
const hills = [hill('Low Knoll', 180, 3), hill('Edge Top', 420, 8), hill('Big Fell', 640, 15), hill('Far Peak', 900, 30)];
const sea = (cloudTop, key = 'likely') => ({ cloudTop, band: { key } });

describe('suggestFor', () => {
  it('lists hills that clear the cloud, nearest first', () => {
    const { mode, items } = suggestFor(hills, sea(300), 60);
    expect(mode).toBe('above');
    expect(items.map((h) => h.name)).toEqual(['Edge Top', 'Big Fell', 'Far Peak']);
    expect(items.every((h) => h.status === 'above')).toBe(true);
  });

  it('marks hills close to the cloud top as near the top', () => {
    const { items } = suggestFor(hills, sea(600), 60);
    expect(items.find((h) => h.name === 'Big Fell').status).toBe('edge');
    expect(items[0].name).toBe('Far Peak');
  });

  it('says when nothing nearby clears the cloud', () => {
    const { mode, items } = suggestFor(hills, sea(1200), 60);
    expect(mode).toBe('none-clear');
    expect(items[0].name).toBe('Far Peak');
  });

  it('lists nearby high ground without verdicts when no cloud sea is forecast', () => {
    const { mode, items } = suggestFor(hills, sea(null, 'unlikely'), 60);
    expect(mode).toBe('no-sea');
    // highest ground within 25 km, listed nearest first
    expect(items.map((h) => h.name)).toEqual(['Low Knoll', 'Edge Top', 'Big Fell']);
    expect(items.every((h) => h.status === null)).toBe(true);
  });

  it('ignores bumps that barely rise above the town', () => {
    const { items } = suggestFor(hills, sea(null, 'unlikely'), 150);
    expect(items.map((h) => h.name)).not.toContain('Low Knoll');
  });
});

describe('geometry', () => {
  it('measures distance and compass direction', () => {
    const keswick = { latitude: 54.5995, longitude: -3.1326 };
    const skiddaw = { latitude: 54.6514, longitude: -3.1478 };
    expect(distanceKm(keswick, skiddaw)).toBeCloseTo(5.9, 0);
    expect(bearing(keswick, skiddaw)).toBe('N');
  });
});
