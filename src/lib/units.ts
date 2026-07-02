/**
 * PURE unit-conversion helpers for displaying distances in both feet and metres,
 * or yards and metres. No DOM, no I/O — all functions are deterministic and testable.
 */

/** 1 foot in metres (exact). */
const FT_PER_METER = 0.3048;

/** 1 yard in metres (exact). */
const YD_PER_METER = 0.9144;

/**
 * Convert feet to metres, rounded to one decimal place.
 * 0 → 0. Negative values are supported (symmetric).
 */
export function feetToMeters(feet: number): number {
  return Math.round(feet * FT_PER_METER * 10) / 10;
}

/**
 * Return a combined display string for a feet measurement: "N ft / ~M m".
 * Intended for putting distances and approach proximities shown on screen.
 */
export function formatFeetMeters(feet: number): string {
  return `${feet} ft / ~${feetToMeters(feet)} m`;
}

/**
 * Convert yards to metres, rounded to the nearest whole metre.
 * Used for driving distances and approach yardages.
 */
export function yardsToMeters(yards: number): number {
  return Math.round(yards * YD_PER_METER);
}

/**
 * Return a combined display string for a yardage: "N yd / ~M m".
 */
export function formatYardsMeters(yards: number): string {
  return `${yards} yd / ~${yardsToMeters(yards)} m`;
}
