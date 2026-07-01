// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Deployed to project GitHub Pages at https://mmarder.github.io/golfbuddy/ for now.
// To move to the custom domain later: set `site: 'https://golf.mardr.com'`, remove `base`,
// and re-add `public/CNAME` (golf.mardr.com). Internal links use `withBase()` so they follow
// the `base` automatically.
// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://mmarder.github.io',
  base: '/golfbuddy',
  vite: {
    plugins: [tailwindcss()],
  },
});
