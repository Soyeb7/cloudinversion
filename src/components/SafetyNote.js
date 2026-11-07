import React from 'react';

// Shown wherever we point people at hills. Kept short and practical.
const SafetyNote = ({ compact = false }) => (
  <aside className={`safety${compact ? ' safety--compact' : ''}`} aria-labelledby={compact ? undefined : 'safety-title'}>
    <p className="safety__title" id={compact ? undefined : 'safety-title'}>
      Before you head out
    </p>
    <ul>
      <li>
        Stick to public paths and open access land, and follow local laws and access rules, such as the{' '}
        <a href="https://www.gov.uk/government/publications/the-countryside-code" target="_blank" rel="noopener noreferrer">
          Countryside Code
        </a>{' '}
        or the{' '}
        <a href="https://www.outdooraccess-scotland.scot/" target="_blank" rel="noopener noreferrer">
          Scottish Outdoor Access Code
        </a>
        . Respect private land, closures and parking restrictions.
      </li>
      {!compact && (
        <li>
          Suggested hills come from map data, not checked routes. Some are on private land, need scrambling, or aren’t safe
          to climb in the dark.
        </li>
      )}
      <li>
        A sunrise walk means darkness, cold and possibly fog. Check the mountain forecast, tell someone your plans, take a
        headtorch, map and warm layers, and turn back if conditions change. See{' '}
        <a href="https://www.adventuresmart.uk/" target="_blank" rel="noopener noreferrer">
          AdventureSmart
        </a>{' '}
        for more.
      </li>
      <li>In an emergency in the UK, call 999 and ask for the Police, then Mountain Rescue.</li>
    </ul>
  </aside>
);

export default SafetyNote;
