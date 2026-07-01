// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Static site served from a custom domain (golf.mardr.com), so no `base` path is needed.
// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://golf.mardr.com',
  vite: {
    plugins: [tailwindcss()],
  },
});
