// Verdict system — maps a project's free-form `status` string to one of the
// liquid-kit's three verdict skins + a glyph + label, rendered in the mono voice.
//   shipped (●) · research (◆) · progress (▶)

export type Tone = 'alive' | 'live' | 'hot' | 'neutral';

export interface Verdict {
  label: string;
  glyph: string;
  kit: 'shipped' | 'research' | 'progress';
}

const KIT: Record<Tone, Verdict['kit']> = {
  alive: 'shipped',
  live: 'progress',
  neutral: 'research',
  hot: 'research',
};

// First match wins — strongest / most specific signal first.
const RULES: { test: RegExp; glyph: string; label: string; tone: Tone }[] = [
  { test: /dead|killed|abandon|scrapped/i, glyph: '✕', label: 'Parked', tone: 'hot' },
  { test: /ship|released|live|published|v\d/i, glyph: '●', label: 'Shipped', tone: 'alive' },
  { test: /complete|done|finished/i, glyph: '●', label: 'Complete', tone: 'alive' },
  { test: /research|experiment|investigat/i, glyph: '◆', label: 'Research', tone: 'neutral' },
  { test: /learn|study|practice/i, glyph: '◇', label: 'Learning', tone: 'neutral' },
  { test: /active|progress|building|wip|ongoing/i, glyph: '▶', label: 'In progress', tone: 'live' },
];

export function verdict(status: string): Verdict {
  for (const r of RULES) {
    if (r.test.test(status)) return { label: r.label, glyph: r.glyph, kit: KIT[r.tone] };
  }
  return { label: status, glyph: '·', kit: 'research' };
}
