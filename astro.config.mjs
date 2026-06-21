// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// Project page on GitHub Pages: https://thanukamax.github.io/lab/
// To move to a custom domain later: set `site` to the domain and drop `base`.
export default defineConfig({
  site: 'https://thanukamax.github.io',
  base: '/lab',
  trailingSlash: 'ignore',
  integrations: [mdx()],
  markdown: {
    shikiConfig: { theme: 'github-dark-dimmed', wrap: true },
  },
});
