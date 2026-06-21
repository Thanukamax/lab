import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('writing', (p) => !p.data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  return rss({
    title: 'Thanuka Perera — Writing',
    description: 'Build logs and field notes on backend, systems, and on-device AI.',
    site: context.site ?? 'https://thanukamax.github.io',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/lab/writing/${post.slug}/`,
      categories: [post.data.topic],
    })),
  });
}
