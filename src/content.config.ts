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
  }),
});

export const collections = { areas, drills };
