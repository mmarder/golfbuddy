/**
 * Prefix an internal path with Astro's configured `base` so links keep working
 * whether the site is served from a subpath (project Pages, /golfbuddy/) or the
 * root (custom domain). Pure: pass `base` explicitly in tests.
 */
export function withBase(path = '', base: string = import.meta.env.BASE_URL): string {
  const root = base.endsWith('/') ? base.slice(0, -1) : base;
  const clean = path.replace(/^\/+/, '');
  return clean ? `${root}/${clean}` : `${root}/`;
}
