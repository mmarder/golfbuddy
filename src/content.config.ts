import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

/**
 * Practice areas (Long Game, Short Game, Putting) — one markdown file each,
 * holding club notes and lesson learnings. Body is authored in markdown.
 */
const areas = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/areas' }),
  schema: z.object({
    title: z.string(),
    /** Short one-line summary shown on the home hub cards. */
    summary: z.string(),
    /** Emoji shown on the card and nav. */
    icon: z.string(),
    /** Sort order on the home hub (lower = earlier). */
    order: z.number(),
  }),
});

/**
 * Daily core-swing drills — a flat list rendered as the persistent checklist.
 * Sourced from a single JSON file; each entry needs a stable `id` so ticked
 * state survives content edits.
 *
 * Multi-step drills render an expandable instruction list via `steps`.
 * Simple drills (no `steps`) omit the disclosure entirely.
 */
const drills = defineCollection({
  loader: file('./src/content/drills.json'),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    /** Optional cue / how-to shown under the drill title. */
    detail: z.string().optional(),
    /** Sort order within the list. */
    order: z.number(),
    /**
     * Optional ordered steps for multi-step drills. Each step has a heading
     * (e.g. "Position 1 — club behind shoulders") and a list of cues.
     * When present, rendered as an expandable <details>/<summary> disclosure.
     */
    steps: z
      .array(
        z.object({
          heading: z.string(),
          cues: z.array(z.string()),
        }),
      )
      .optional(),
  }),
});

export const collections = { areas, drills };
