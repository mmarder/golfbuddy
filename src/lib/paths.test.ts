import { describe, it, expect } from 'vitest';
import { withBase } from './paths';

describe('withBase', () => {
  it('joins a path onto a subpath base', () => {
    expect(withBase('drills/', '/golfbuddy/')).toBe('/golfbuddy/drills/');
  });

  it('handles a base without a trailing slash', () => {
    expect(withBase('drills/', '/golfbuddy')).toBe('/golfbuddy/drills/');
  });

  it('strips a leading slash on the path', () => {
    expect(withBase('/drills/', '/golfbuddy/')).toBe('/golfbuddy/drills/');
  });

  it('returns the base root for an empty path', () => {
    expect(withBase('', '/golfbuddy/')).toBe('/golfbuddy/');
  });

  it('works at the site root (custom domain)', () => {
    expect(withBase('drills/', '/')).toBe('/drills/');
    expect(withBase('', '/')).toBe('/');
  });
});
