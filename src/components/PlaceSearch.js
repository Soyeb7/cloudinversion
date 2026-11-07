import React, { useEffect, useRef, useState } from 'react';
import { searchPlaces } from '../lib/api';
import { placeSubtitle } from '../lib/format';

// Accessible combobox: type a place, pick from matches (so "Keswick" can be
// Keswick in Cumbria rather than whichever Keswick the API lists first).
const PlaceSearch = ({ onSelect, onLocate, locating, initialValue = '' }) => {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [status, setStatus] = useState('idle'); // idle | loading | empty | error
  const boxRef = useRef(null);
  const skipNext = useRef(Boolean(initialValue));

  // Reflect the selected place without triggering a new search
  useEffect(() => {
    setQuery((q) => {
      if (q === initialValue) return q;
      skipNext.current = true;
      return initialValue;
    });
  }, [initialValue]);

  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false;
      return undefined;
    }
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setStatus('idle');
      return undefined;
    }
    const ctrl = new AbortController();
    setStatus('loading');
    const t = setTimeout(() => {
      searchPlaces(q, ctrl.signal)
        .then((r) => {
          setResults(r);
          setStatus(r.length ? 'idle' : 'empty');
          setActive(r.length ? 0 : -1);
        })
        .catch((e) => {
          if (e.name !== 'AbortError') setStatus('error');
        });
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  useEffect(() => {
    const onDoc = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const choose = (place) => {
    skipNext.current = true;
    setQuery(place.name);
    setOpen(false);
    setResults([]);
    onSelect(place);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (results.length) choose(results[Math.max(active, 0)]);
    else if (query.trim().length >= 2) setOpen(true);
  };

  const showList = open && (results.length > 0 || status === 'empty' || status === 'error');

  return (
    <form className="search" onSubmit={onSubmit} ref={boxRef} role="search">
      <label htmlFor="place" className="search__label">
        Town, valley or hill
      </label>
      <div className="search__row">
        <div className="search__field">
          <svg className="search__icon" viewBox="0 0 20 20" aria-hidden="true">
            <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M13 13l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            id="place"
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showList}
            aria-controls="place-options"
            aria-activedescendant={showList && active >= 0 ? `place-opt-${active}` : undefined}
            autoComplete="off"
            spellCheck="false"
            placeholder="e.g. Keswick, Glencoe, Zermatt"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => results.length && setOpen(true)}
            onKeyDown={onKeyDown}
          />
          {status === 'loading' && <span className="search__spinner" aria-hidden="true" />}
        </div>
        <button type="submit" className="btn btn--primary">
          Check forecast
        </button>
      </div>
      <button type="button" className="search__locate" onClick={onLocate} disabled={locating}>
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="10" cy="10" r="3" fill="currentColor" />
          <circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M10 1.5v3M10 15.5v3M1.5 10h3M15.5 10h3" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        {locating ? 'Finding you…' : 'Use my location'}
      </button>

      {showList && (
        <ul id="place-options" className="search__list" role="listbox" aria-label="Matching places">
          {status === 'error' && <li className="search__note">Place search isn’t responding. Check your connection and try again.</li>}
          {status === 'empty' && <li className="search__note">No places match “{query.trim()}”. Try a nearby town or check the spelling.</li>}
          {results.map((r, i) => (
            <li
              key={r.id}
              id={`place-opt-${i}`}
              role="option"
              aria-selected={i === active}
              className={`search__option${i === active ? ' is-active' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(r)}
              onMouseEnter={() => setActive(i)}
            >
              <span className="search__name">{r.name}</span>
              <span className="search__meta">{placeSubtitle(r)}</span>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
};

export default PlaceSearch;
