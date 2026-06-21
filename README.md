# thanuka.lab

Personal site — **projects** and **writing** (field notes) — built with Astro.
Separate from the main portfolio (`thanukamax.github.io`), which is unchanged.

**Live (project page):** https://thanukamax.github.io/lab/

## Stack
- **Astro 4** (static) + **@astrojs/mdx** + **@astrojs/rss**
- Content collections: `projects/` (directory-per-project) and `writing/`
- Type: Newsreader (serif body) · Inter (UI) · JetBrains Mono (texture)
- Light/dark, RSS, reading-progress, reduced-motion safe

## Sitemap
```
/                       Home — intro · featured projects · latest writing
/projects               Projects index (filter by topic)
/projects/<slug>        One per project directory (e.g. /projects/shrinkray)
/writing                Writing index
/writing/<slug>         A post
/about                  About + contact
/feed.xml               RSS (writing)
```

## Authoring
- **New project:** create `src/content/projects/<slug>/index.mdx` with frontmatter
  (`title, summary, topic, stack[], status, role, year, links{}, featured, order`).
  Co-locate images in the same folder.
- **New post:** create `src/content/writing/<slug>.md` with frontmatter
  (`title, description, topic, date, readTime`).
- `topic` drives the fallback SVG thumbnail — see `src/utils/thumbs.ts`. Add a new
  key there for a new category, or set `heroImage` to override.

## Commands
```bash
bun install
bun run dev        # http://localhost:4321/lab/
bun run build      # -> dist/
bun run preview
```

## Deploy
Push to `main` → GitHub Actions builds and deploys to Pages (Settings → Pages → Source: GitHub Actions).
To move to a custom domain later: set `site` in `astro.config.mjs` to the domain and drop `base`.
