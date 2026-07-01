/**
 * Pure checklist state logic — no DOM, no localStorage, no I/O.
 *
 * State is the set of checked drill ids, held as a de-duplicated string[] so it
 * serialises cleanly to JSON for per-device persistence. The browser wiring
 * (reading/writing localStorage, updating the DOM) lives in the Checklist
 * component script and calls into these functions.
 */

export interface ChecklistState {
  /** ids of the items currently ticked. De-duplicated; order not significant. */
  checked: string[];
}

/** Current on-disk shape version. Bump if the stored shape ever changes. */
export const STORAGE_VERSION = 1;

interface StoredPayload {
  version: number;
  checked: string[];
}

export function emptyState(): ChecklistState {
  return { checked: [] };
}

/** Reset is just an empty state; named for intent at call sites (the Reset button). */
export function reset(): ChecklistState {
  return emptyState();
}

export function isChecked(state: ChecklistState, id: string): boolean {
  return state.checked.includes(id);
}

/** Immutably add the id if absent, remove it if present. */
export function toggle(state: ChecklistState, id: string): ChecklistState {
  if (isChecked(state, id)) {
    return { checked: state.checked.filter((c) => c !== id) };
  }
  return { checked: [...state.checked, id] };
}

export interface Progress {
  done: number;
  total: number;
  /** Integer 0–100. 0 when there are no items (avoids divide-by-zero). */
  percent: number;
}

/**
 * Progress over a known set of item ids. Only counts checked ids that are still
 * present in `allIds`, so stale ids from removed drills never inflate the count.
 */
export function progress(state: ChecklistState, allIds: string[]): Progress {
  const total = allIds.length;
  const done = allIds.filter((id) => state.checked.includes(id)).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent };
}

export function serialize(state: ChecklistState): string {
  const payload: StoredPayload = { version: STORAGE_VERSION, checked: state.checked };
  return JSON.stringify(payload);
}

/**
 * Safe-parse persisted state. Any malformed, legacy, or wrong-version payload
 * (including null) yields an empty state rather than throwing.
 */
export function deserialize(raw: string | null): ChecklistState {
  if (!raw) return emptyState();
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      (parsed as StoredPayload).version !== STORAGE_VERSION ||
      !Array.isArray((parsed as StoredPayload).checked)
    ) {
      return emptyState();
    }
    const checked = (parsed as StoredPayload).checked.filter(
      (c): c is string => typeof c === 'string',
    );
    // De-duplicate defensively.
    return { checked: [...new Set(checked)] };
  } catch {
    return emptyState();
  }
}
