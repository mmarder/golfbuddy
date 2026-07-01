import { describe, it, expect } from 'vitest';
import {
  emptyState,
  reset,
  isChecked,
  toggle,
  progress,
  serialize,
  deserialize,
  STORAGE_VERSION,
} from './checklist-state';

describe('toggle', () => {
  it('adds an id when absent', () => {
    const next = toggle(emptyState(), 'drill-1');
    expect(next.checked).toEqual(['drill-1']);
  });

  it('removes an id when present', () => {
    const next = toggle({ checked: ['drill-1', 'drill-2'] }, 'drill-1');
    expect(next.checked).toEqual(['drill-2']);
  });

  it('does not mutate the input state', () => {
    const state = emptyState();
    toggle(state, 'drill-1');
    expect(state.checked).toEqual([]);
  });
});

describe('isChecked', () => {
  it('reflects membership', () => {
    const state = { checked: ['a'] };
    expect(isChecked(state, 'a')).toBe(true);
    expect(isChecked(state, 'b')).toBe(false);
  });
});

describe('progress', () => {
  it('is 0% for an empty checklist', () => {
    expect(progress(emptyState(), [])).toEqual({ done: 0, total: 0, percent: 0 });
  });

  it('is 0% when nothing is checked', () => {
    expect(progress(emptyState(), ['a', 'b', 'c'])).toEqual({ done: 0, total: 3, percent: 0 });
  });

  it('computes a partial percentage, rounded', () => {
    // 1 of 3 => 33%
    expect(progress({ checked: ['a'] }, ['a', 'b', 'c'])).toEqual({
      done: 1,
      total: 3,
      percent: 33,
    });
  });

  it('is 100% when all are checked', () => {
    expect(progress({ checked: ['a', 'b'] }, ['a', 'b'])).toEqual({
      done: 2,
      total: 2,
      percent: 100,
    });
  });

  it('ignores checked ids no longer in the item list', () => {
    expect(progress({ checked: ['a', 'stale'] }, ['a', 'b'])).toEqual({
      done: 1,
      total: 2,
      percent: 50,
    });
  });
});

describe('reset', () => {
  it('returns an empty state', () => {
    expect(reset()).toEqual({ checked: [] });
  });
});

describe('serialize / deserialize round-trip', () => {
  it('round-trips a populated state', () => {
    const state = { checked: ['a', 'b'] };
    expect(deserialize(serialize(state))).toEqual(state);
  });

  it('writes the current version', () => {
    expect(JSON.parse(serialize(emptyState())).version).toBe(STORAGE_VERSION);
  });
});

describe('deserialize (safe-parse)', () => {
  it('returns empty state for null', () => {
    expect(deserialize(null)).toEqual(emptyState());
  });

  it('returns empty state for malformed JSON', () => {
    expect(deserialize('{not json')).toEqual(emptyState());
  });

  it('returns empty state for a wrong-version payload', () => {
    expect(deserialize(JSON.stringify({ version: 999, checked: ['a'] }))).toEqual(emptyState());
  });

  it('returns empty state when checked is not an array', () => {
    expect(deserialize(JSON.stringify({ version: STORAGE_VERSION, checked: 'nope' }))).toEqual(
      emptyState(),
    );
  });

  it('drops non-string and duplicate entries', () => {
    const raw = JSON.stringify({ version: STORAGE_VERSION, checked: ['a', 'a', 1, null, 'b'] });
    expect(deserialize(raw)).toEqual({ checked: ['a', 'b'] });
  });
});
