import { defineCollection, z } from 'astro:content';

// Each project lives in its own directory: src/content/projects/<slug>/index.mdx
// Directory name = URL slug. Co-locate per-project images in the same folder.
const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(), // one-line, used on cards + meta
    topic: z.string(), // category — drives the SVG thumbnail (see utils/thumbs.ts)
    stack: z.array(z.string()).default([]),
    status: z.string().default('Active'), // Shipped / Active / Research / Learning / Complete
    role: z.string().default('Solo'), // Solo / Team
    year: z.string(),
    featured: z.boolean().default(false),
    order: z.number().default(99), // lower = earlier in the index
    links: z
      .object({
        repo: z.string().url().optional(),
        demo: z.string().url().optional(),
        pypi: z.string().url().optional(),
        site: z.string().url().optional(),
      })
      .default({}),
    heroImage: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

// Writing: essays, build logs, field notes, "personal dumps".
const writing = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    topic: z.string(),
    date: z.date(),
    readTime: z.string().default('5 min'),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    heroImage: z.string().optional(),
  }),
});

export const collections = { projects, writing };
