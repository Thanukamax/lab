// Bespoke per-project hero art. Inline SVG (no asset pipeline, no base-path issues).
// One visual system: dark tile, teal glow accent, technical linework. Unique concept each.
// IDs are slug-suffixed so multiple inline SVGs on one page never collide.

const A = '#4fd1c0'; // teal accent (matches --accent dark)
const W = 'rgba(255,255,255,0.9)';
const WL = 'rgba(255,255,255,0.2)';
const MONO = 'font-family="ui-monospace, monospace"';

const GRID = `<g stroke="rgba(255,255,255,0.045)" stroke-width="1">
  <line x1="0" y1="60" x2="400" y2="60"/><line x1="0" y1="120" x2="400" y2="120"/><line x1="0" y1="180" x2="400" y2="180"/>
  <line x1="80" y1="0" x2="80" y2="240"/><line x1="160" y1="0" x2="160" y2="240"/><line x1="240" y1="0" x2="240" y2="240"/><line x1="320" y1="0" x2="320" y2="240"/>
</g>`;

const mk = (slug: string, body: string, defs = '') => `<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="bg-${slug}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0e1116"/><stop offset="1" stop-color="#070809"/></linearGradient>
<radialGradient id="tint-${slug}" cx="0.82" cy="0.12" r="0.95"><stop offset="0" stop-color="${A}" stop-opacity="0.17"/><stop offset="0.6" stop-color="${A}" stop-opacity="0"/></radialGradient>
<filter id="glow-${slug}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
${defs}</defs>
<rect width="400" height="240" fill="url(#bg-${slug})"/>
<rect width="400" height="240" fill="url(#tint-${slug})"/>
${GRID}
${body}
</svg>`;

type Art = (slug: string) => string;

const ART: Record<string, Art> = {
  // mip pyramid being compressed
  shrinkray: (s) => mk(s, `
    <g fill="none" stroke="${WL}"><rect x="44" y="56" width="128" height="128" rx="4"/></g>
    <g fill="none" stroke="rgba(255,255,255,0.32)"><rect x="44" y="56" width="64" height="64" rx="3"/><rect x="44" y="56" width="32" height="32" rx="2"/><rect x="44" y="56" width="16" height="16" rx="1"/></g>
    <text x="46" y="202" fill="rgba(255,255,255,0.4)" ${MONO} font-size="10">mip 0 · 1 · 2 · 3</text>
    <g filter="url(#glow-${s})"><path d="M214 110 H300 M214 130 H300 M256 96 L300 120 L256 144" stroke="${A}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
    <rect x="322" y="102" width="40" height="40" rx="5" fill="${A}" filter="url(#glow-${s})"/>
    <text x="342" y="127" fill="#04110f" ${MONO} font-size="11" font-weight="700" text-anchor="middle">−40%</text>`),

  // residual delta between two blocks
  'delta-mip': (s) => mk(s, `
    <g ${MONO} font-size="11" fill="rgba(255,255,255,0.5)"><text x="58" y="56">original</text><text x="300" y="56">restore</text></g>
    <g fill="rgba(255,255,255,0.16)"><rect x="50" y="68" width="78" height="78" rx="4"/></g>
    <g fill="none" stroke="${A}" stroke-width="2" filter="url(#glow-${s})"><path d="M180 107 q14 -14 28 0 M180 107 q14 14 28 0"/><circle cx="222" cy="107" r="3" fill="${A}"/></g>
    <text x="170" y="150" fill="${A}" ${MONO} font-size="20" font-weight="700">Δ</text>
    <g fill="none" stroke="rgba(255,255,255,0.5)"><rect x="292" y="68" width="78" height="78" rx="4"/></g>
    <g fill="rgba(255,255,255,0.5)"><circle cx="312" cy="92" r="2"/><circle cx="338" cy="110" r="2"/><circle cx="356" cy="128" r="2"/><circle cx="322" cy="132" r="2"/></g>
    <text x="50" y="186" fill="rgba(255,255,255,0.4)" ${MONO} font-size="10">byte-exact · +14.7% net</text>`),

  // crescent moon + voice waveform (Diana 🌙)
  diana: (s) => mk(s, `
    <circle cx="104" cy="120" r="48" fill="${A}" filter="url(#glow-${s})"/>
    <circle cx="124" cy="108" r="44" fill="#0a0c10"/>
    <g stroke="${W}" stroke-width="3" stroke-linecap="round">
      <path d="M214 120 v-12"/><path d="M232 120 v-30"/><path d="M250 120 v-46"/><path d="M268 120 v-22"/><path d="M286 120 v-40"/><path d="M304 120 v-16"/><path d="M322 120 v-28"/>
      <path d="M214 120 v12" opacity="0.45"/><path d="M232 120 v30" opacity="0.45"/><path d="M250 120 v46" opacity="0.45"/><path d="M268 120 v22" opacity="0.45"/><path d="M286 120 v40" opacity="0.45"/><path d="M304 120 v16" opacity="0.45"/><path d="M322 120 v28" opacity="0.45"/>
    </g>`),

  // battery + cpu chip, minimal
  sam: (s) => mk(s, `
    <g fill="none" stroke="${WL}" stroke-width="2"><rect x="120" y="92" width="120" height="56" rx="8"/><rect x="240" y="108" width="10" height="24" rx="3" fill="${WL}"/></g>
    <rect x="128" y="100" width="62" height="40" rx="4" fill="${A}" filter="url(#glow-${s})"/>
    <path d="M150 104 L138 124 H150 L146 138 L162 116 H150 Z" fill="#04110f"/>
    <g fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"><rect x="168" y="176" width="64" height="40" rx="4"/>
      <path d="M176 176 v-8 M192 176 v-8 M208 176 v-8 M224 176 v-8 M176 216 v8 M192 216 v8 M208 216 v8 M224 216 v8"/></g>
    <text x="200" y="200" fill="rgba(255,255,255,0.6)" ${MONO} font-size="10" text-anchor="middle">CPU</text>`),

  // terminal window with play glyph
  'donghua-cli': (s) => mk(s, `
    <g fill="none" stroke="${WL}"><rect x="60" y="52" width="280" height="136" rx="8"/></g>
    <line x1="60" y1="76" x2="340" y2="76" stroke="${WL}"/>
    <g fill="rgba(255,255,255,0.3)"><circle cx="76" cy="64" r="4"/><circle cx="90" cy="64" r="4"/><circle cx="104" cy="64" r="4"/></g>
    <text x="76" y="104" fill="rgba(255,255,255,0.55)" ${MONO} font-size="11">$ dhua "BTTH s5"</text>
    <text x="76" y="124" fill="${A}" ${MONO} font-size="11">▸ resolving · 1080p</text>
    <path d="M250 134 L290 156 L250 178 Z" fill="${A}" filter="url(#glow-${s})"/>`),

  // folder -> phone (apk)
  vn2apk: (s) => mk(s, `
    <g fill="none" stroke="${WL}" stroke-width="2"><path d="M56 92 h40 l10 12 h48 a6 6 0 0 1 6 6 v50 a6 6 0 0 1 -6 6 H56 a6 6 0 0 1 -6 -6 V98 a6 6 0 0 1 6 -6 Z"/></g>
    <g filter="url(#glow-${s})" stroke="${A}" stroke-width="2.5" fill="none" stroke-linecap="round"><path d="M180 120 H236 M222 106 L236 120 L222 134"/></g>
    <g fill="none" stroke="${A}" stroke-width="2"><rect x="270" y="78" width="76" height="120" rx="12" filter="url(#glow-${s})"/></g>
    <rect x="298" y="86" width="20" height="4" rx="2" fill="${A}"/>
    <text x="308" y="148" fill="${A}" ${MONO} font-size="12" font-weight="700" text-anchor="middle">APK</text>
    <circle cx="308" cy="184" r="5" fill="none" stroke="${A}" stroke-width="2"/>`),

  // cctv grid with bounding box
  crow: (s) => mk(s, `
    <g fill="none" stroke="${WL}"><rect x="48" y="50" width="138" height="64" rx="4"/><rect x="200" y="50" width="138" height="64" rx="4"/><rect x="48" y="126" width="138" height="64" rx="4"/><rect x="200" y="126" width="138" height="64" rx="4"/></g>
    <g fill="rgba(255,255,255,0.25)"><circle cx="117" cy="82" r="9"/><path d="M104 114 a13 13 0 0 1 26 0 Z"/></g>
    <rect x="232" y="62" width="40" height="42" rx="3" fill="none" stroke="${A}" stroke-width="2" filter="url(#glow-${s})"/>
    <text x="232" y="58" fill="${A}" ${MONO} font-size="9">0.98</text>
    <circle cx="300" cy="158" r="14" fill="none" stroke="${A}" stroke-width="2"/><circle cx="300" cy="158" r="4" fill="${A}" filter="url(#glow-${s})"/>
    <text x="56" y="180" fill="rgba(255,255,255,0.45)" ${MONO} font-size="10">REC ●</text>`),

  // cache layers + arch translation
  warmcore: (s) => mk(s, `
    <g ${MONO} font-size="10" fill="rgba(255,255,255,0.5)"><text x="52" y="64">x86</text><text x="316" y="64">arm64</text></g>
    <g fill="none" stroke="${WL}"><rect x="48" y="74" width="70" height="22" rx="3"/><rect x="48" y="102" width="70" height="22" rx="3"/><rect x="48" y="130" width="70" height="22" rx="3"/></g>
    <g ${MONO} font-size="9" fill="rgba(255,255,255,0.4)"><text x="56" y="89">L1</text><text x="56" y="117">L2</text><text x="56" y="145">L3</text></g>
    <g filter="url(#glow-${s})" stroke="${A}" stroke-width="2.5" fill="none" stroke-linecap="round"><path d="M170 120 H250 M236 106 L250 120 L236 134"/></g>
    <circle cx="200" cy="120" r="16" fill="none" stroke="${A}" stroke-width="2"/><text x="200" y="124" fill="${A}" ${MONO} font-size="9" text-anchor="middle">PGO</text>
    <g fill="none" stroke="rgba(255,255,255,0.5)"><rect x="304" y="88" width="56" height="64" rx="4"/></g>
    <text x="56" y="186" fill="rgba(255,255,255,0.4)" ${MONO} font-size="10">zero hot-path inference</text>`),

  // wireframe cube
  'vulkan-renderer': (s) => mk(s, `
    <g stroke="${WL}" fill="none" stroke-width="1.5"><path d="M150 60 L250 60 L250 160 L150 160 Z"/><path d="M190 100 L290 100 L290 200 L190 200 Z"/><path d="M150 60 L190 100 M250 60 L290 100 M250 160 L290 200 M150 160 L190 200"/></g>
    <g stroke="${A}" stroke-width="1.5" fill="none" filter="url(#glow-${s})"><path d="M190 100 L290 100 L290 200 L190 200 Z"/></g>
    <g fill="${A}"><circle cx="150" cy="60" r="3"/><circle cx="250" cy="60" r="3"/><circle cx="250" cy="160" r="3"/><circle cx="150" cy="160" r="3"/><circle cx="190" cy="100" r="3"/><circle cx="290" cy="100" r="3"/><circle cx="290" cy="200" r="3"/><circle cx="190" cy="200" r="3"/></g>
    <text x="150" y="44" fill="rgba(255,255,255,0.4)" ${MONO} font-size="10">VkPipeline</text>`),

  // shader code + gradient fragment output
  'wgpu-shader-explorer': (s) => mk(s, `
    <g ${MONO} font-size="10" fill="rgba(255,255,255,0.45)"><text x="48" y="74">@fragment</text><text x="48" y="92">fn fs() -&gt;</text><text x="60" y="110">vec4&lt;f32&gt;</text><text x="48" y="128">{ uv.xyx }</text></g>
    <g filter="url(#glow-${s})" stroke="${A}" stroke-width="2" fill="none" stroke-linecap="round"><path d="M176 100 H214 M202 88 L214 100 L202 112"/></g>
    <rect x="230" y="62" width="120" height="116" rx="6" fill="url(#frag-${s})" filter="url(#glow-${s})"/>
    <text x="230" y="196" fill="rgba(255,255,255,0.4)" ${MONO} font-size="10">naga · live</text>`,
    `<linearGradient id="frag-${s}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${A}"/><stop offset="0.5" stop-color="#2563eb"/><stop offset="1" stop-color="#7c3aed"/></linearGradient>`),

  // code + safety shield (compile gate)
  dianalang: (s) => mk(s, `
    <g ${MONO} font-size="11" fill="rgba(255,255,255,0.45)"><text x="48" y="70">skill volume {</text><text x="64" y="90">gate: trusted</text><text x="64" y="110">exec wpctl …</text><text x="48" y="130">}</text></g>
    <path d="M300 60 L348 76 V120 q0 36 -48 56 q-48 -20 -48 -56 V76 Z" fill="none" stroke="${A}" stroke-width="2.5" filter="url(#glow-${s})"/>
    <path d="M280 118 l14 14 l26 -30" fill="none" stroke="${A}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="48" y="170" fill="${A}" ${MONO} font-size="10">✓ compiles — injection-proof</text>`),

  // chat bubbles + tool nodes
  'chat-agent-template': (s) => mk(s, `
    <g fill="none" stroke="${WL}" stroke-width="1.5"><rect x="48" y="66" width="150" height="38" rx="10"/><path d="M62 104 l0 14 l16 -14"/></g>
    <text x="62" y="89" fill="rgba(255,255,255,0.5)" ${MONO} font-size="10">tool: search(…)</text>
    <g filter="url(#glow-${s})"><rect x="48" y="132" width="180" height="38" rx="10" fill="none" stroke="${A}" stroke-width="1.5"/></g>
    <text x="62" y="155" fill="${A}" ${MONO} font-size="10">▸ streaming…</text>
    <g stroke="${WL}" fill="none"><path d="M280 70 v100"/><circle cx="280" cy="70" r="10" fill="#0b0c10"/><circle cx="280" cy="120" r="10" fill="#0b0c10"/><circle cx="280" cy="170" r="10" fill="#0b0c10"/></g>
    <g fill="${A}"><circle cx="280" cy="70" r="4"/><circle cx="280" cy="120" r="4"/><circle cx="280" cy="170" r="4"/></g>
    <g stroke="${A}" stroke-dasharray="2 3" fill="none"><path d="M228 151 H270"/></g>`),

  // building + sensors + REST endpoints
  'smart-campus-api': (s) => mk(s, `
    <g fill="none" stroke="${WL}" stroke-width="1.5"><rect x="56" y="84" width="96" height="104" rx="3"/><path d="M70 100 h16 M70 116 h16 M70 132 h16 M70 148 h16 M104 100 h16 M104 116 h16 M104 132 h16 M104 148 h16"/></g>
    <circle cx="104" cy="72" r="6" fill="none" stroke="${A}" stroke-width="2"/><circle cx="104" cy="72" r="2" fill="${A}" filter="url(#glow-${s})"/>
    <g filter="url(#glow-${s})" stroke="${A}" stroke-width="2" fill="none" stroke-linecap="round"><path d="M170 120 H210"/></g>
    <g ${MONO} font-size="10"><rect x="218" y="80" width="128" height="22" rx="4" fill="rgba(255,255,255,0.05)"/><text x="226" y="95" fill="${A}">GET</text><text x="252" y="95" fill="rgba(255,255,255,0.55)">/rooms</text>
      <rect x="218" y="110" width="128" height="22" rx="4" fill="rgba(255,255,255,0.05)"/><text x="226" y="125" fill="${A}">GET</text><text x="252" y="125" fill="rgba(255,255,255,0.55)">/sensors</text>
      <rect x="218" y="140" width="128" height="22" rx="4" fill="rgba(255,255,255,0.05)"/><text x="226" y="155" fill="${A}">POST</text><text x="256" y="155" fill="rgba(255,255,255,0.55)">/readings</text></g>`),

  // network sockets + quiz tick
  neti: (s) => mk(s, `
    <g stroke="${WL}" fill="none" stroke-width="1.5"><path d="M80 80 L200 130 L80 180 M200 130 L320 90 M200 130 L320 170"/></g>
    <g fill="rgba(255,255,255,0.5)"><circle cx="80" cy="80" r="6"/><circle cx="80" cy="180" r="6"/><circle cx="320" cy="90" r="6"/><circle cx="320" cy="170" r="6"/></g>
    <circle cx="200" cy="130" r="11" fill="${A}" filter="url(#glow-${s})"/>
    <rect x="252" y="118" width="14" height="14" rx="2" fill="none" stroke="${A}"/><path d="M255 125 l3 3 l6 -7" stroke="${A}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="64" y="214" fill="rgba(255,255,255,0.4)" ${MONO} font-size="10">socket · quiz · speed-round</text>`),
};

export function getHero(slug: string): string | null {
  return ART[slug]?.(slug) ?? null;
}
