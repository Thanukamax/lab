// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { visit } from 'unist-util-visit';

// rehype: turn standalone prose images into liquid-kit "exhibit" figures —
// a framed image with a mono `Fig.nn` caption built from the image's alt text.
function rehypeExhibits() {
  return (tree) => {
    let n = 0;
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'p') return;
      const kids = (node.children || []).filter((c) => !(c.type === 'text' && !c.value.trim()));
      if (kids.length !== 1 || kids[0].tagName !== 'img') return;
      const img = kids[0];
      const alt = (img.properties && img.properties.alt) || '';
      if (img.properties) img.properties.alt = ''; // caption carries it now
      n += 1;
      const num = String(n).padStart(2, '0');
      node.tagName = 'figure';
      node.properties = { className: ['lq-exhibit'] };
      node.children = [
        img,
        {
          type: 'element', tagName: 'figcaption', properties: {},
          children: [
            { type: 'element', tagName: 'span', properties: { className: ['fig'] }, children: [{ type: 'text', value: `Fig.${num}` }] },
            { type: 'element', tagName: 'span', properties: {}, children: [{ type: 'text', value: alt }] },
          ],
        },
      ];
    });
  };
}

// Project page on GitHub Pages: https://thanukamax.github.io/lab/
// To move to a custom domain later: set `site` to the domain and drop `base`.
export default defineConfig({
  site: 'https://thanukamax.github.io',
  base: '/lab',
  trailingSlash: 'ignore',
  integrations: [mdx()],
  markdown: {
    shikiConfig: { theme: 'github-dark-dimmed', wrap: true },
    rehypePlugins: [rehypeExhibits],
  },
});
