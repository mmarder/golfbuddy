// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Deployed to GitHub Pages on the custom domain https://golf.mardr.com/.
// The domain is configured by `public/CNAME` (emitted into the build output) plus a Namecheap
// CNAME record (golf → mmarder.github.io) and the GitHub Pages custom-domain setting.
// Served from the root, so there is no `base`. Internal links use `withBase()`, which resolves
// to an empty base here and keeps working if the site ever moves back to a subpath.
// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://golf.mardr.com',
  vite: {
    plugins: [tailwindcss()],
  },
});
