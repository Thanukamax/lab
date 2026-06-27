// Bespoke per-project hero art. Inline SVG (no asset pipeline, no base-path issues).
// One visual system: dark teal-black tile, faded grid, aqua glow + lotus undertone,
// soft vignette and a whisper of film grain. Technical linework, unique concept each.
// Composed inside the central band (y ~40–200) so it survives both the 16/10 card
// crop and the 21/9 detail-banner crop. IDs are slug-suffixed to avoid collisions.

const A = '#5fdccb'; // aqua accent
const A2 = '#2bb6a4'; // deeper aqua
const L = '#ff86b3'; // lotus (secondary accent)
const W = 'rgba(255,255,255,0.92)';
const WM = 'rgba(255,255,255,0.5)';
const WL = 'rgba(255,255,255,0.22)';
const WF = 'rgba(255,255,255,0.08)';
const INK = '#06121a'; // dark ink for text on accent fills
const MONO = 'font-family="ui-monospace, SFMono-Regular, Menlo, monospace"';

const mk = (s: string, body: string, defs = '') => `<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="bg-${s}" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="#101824"/><stop offset="1" stop-color="#06090d"/></linearGradient>
<radialGradient id="ga-${s}" cx="0.8" cy="0.08" r="0.95"><stop offset="0" stop-color="${A}" stop-opacity="0.22"/><stop offset="0.62" stop-color="${A}" stop-opacity="0"/></radialGradient>
<radialGradient id="gl-${s}" cx="0.1" cy="1" r="0.9"><stop offset="0" stop-color="${L}" stop-opacity="0.13"/><stop offset="0.6" stop-color="${L}" stop-opacity="0"/></radialGradient>
<radialGradient id="vig-${s}" cx="0.5" cy="0.46" r="0.75"><stop offset="0.5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.5"/></radialGradient>
<radialGradient id="gm-${s}" cx="0.5" cy="0.5" r="0.72"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>
<mask id="gmask-${s}"><rect width="400" height="240" fill="url(#gm-${s})"/></mask>
<pattern id="grid-${s}" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M22 0 H0 V22" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern>
<filter id="glow-${s}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="grain-${s}"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0.06"/></feComponentTransfer></filter>
${defs}</defs>
<rect width="400" height="240" fill="url(#bg-${s})"/>
<rect width="400" height="240" fill="url(#grid-${s})" mask="url(#gmask-${s})"/>
<rect width="400" height="240" fill="url(#ga-${s})"/>
<rect width="400" height="240" fill="url(#gl-${s})"/>
${body}
<rect width="400" height="240" fill="url(#vig-${s})"/>
<rect width="400" height="240" filter="url(#grain-${s})"/>
</svg>`;

type Art = (slug: string) => string;

const ART: Record<string, Art> = {
  // shrinkray — nested mip squares → reversible swap → smaller result
  shrinkray: (s) => mk(s, `
    <rect x="54" y="60" width="116" height="116" rx="5" fill="${WF}" stroke="${WL}"/>
    <rect x="54" y="60" width="78" height="78" rx="4" fill="none" stroke="rgba(255,255,255,0.26)"/>
    <rect x="54" y="60" width="50" height="50" rx="3" fill="none" stroke="${A}" stroke-opacity="0.55"/>
    <rect x="54" y="60" width="30" height="30" rx="2" fill="${A}" fill-opacity="0.18" stroke="${A}" filter="url(#glow-${s})"/>
    <text x="54" y="192" fill="${WM}" ${MONO} font-size="9">mip 0 · 1 · 2 · 3</text>
    <g stroke="${A}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow-${s})">
      <path d="M204 108 H252 M242 100 L252 108 L242 116"/><path d="M252 132 H204 M214 124 L204 132 L214 140"/></g>
    <rect x="300" y="98" width="60" height="44" rx="9" fill="${A}" filter="url(#glow-${s})"/>
    <text x="330" y="125" fill="${INK}" ${MONO} font-size="13" font-weight="700" text-anchor="middle">−40%</text>`),

  // delta-mip — base plane + residual sheet → restored plane
  'delta-mip': (s) => mk(s, `
    <rect x="58" y="74" width="90" height="90" rx="6" fill="${WF}" stroke="${WL}"/>
    <text x="58" y="66" fill="${WM}" ${MONO} font-size="9">base</text>
    <g filter="url(#glow-${s})"><rect x="172" y="100" width="92" height="40" rx="6" fill="none" stroke="${A}" stroke-width="1.6"/></g>
    <path d="M182 120 q12 -12 23 0 t23 0 t23 0" fill="none" stroke="${A}" stroke-width="1.6"/>
    <text x="172" y="92" fill="${A}" ${MONO} font-size="9">Δ residual</text>
    <text x="156" y="156" fill="${A}" ${MONO} font-size="18" font-weight="700">+</text>
    <g stroke="${A}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow-${s})"><path d="M276 120 H292 M284 112 L292 120 L284 128"/></g>
    <rect x="300" y="74" width="90" height="90" rx="6" fill="none" stroke="${WM}"/>
    <text x="300" y="66" fill="${WM}" ${MONO} font-size="9">restore</text>
    <g fill="${WM}"><circle cx="320" cy="98" r="2"/><circle cx="350" cy="116" r="2"/><circle cx="368" cy="142" r="2"/><circle cx="330" cy="140" r="2"/></g>
    <text x="58" y="186" fill="${WM}" ${MONO} font-size="9">byte-exact</text>`),

  // diana — crescent moon orb + privacy ring + voice waveform
  diana: (s) => mk(s, `
    <circle cx="108" cy="118" r="62" fill="none" stroke="${A}" stroke-opacity="0.16" stroke-dasharray="3 6"/>
    <circle cx="100" cy="118" r="44" fill="${A}" filter="url(#glow-${s})"/>
    <circle cx="119" cy="105" r="40" fill="#080b0f"/>
    <g stroke="url(#wav-${s})" stroke-width="4" stroke-linecap="round" fill="none">
      <path d="M212 118 V100"/><path d="M230 118 V76"/><path d="M248 118 V60"/><path d="M266 118 V88"/><path d="M284 118 V68"/><path d="M302 118 V94"/><path d="M320 118 V80"/>
      <path d="M212 118 V136" opacity="0.4"/><path d="M230 118 V160" opacity="0.4"/><path d="M248 118 V176" opacity="0.4"/><path d="M266 118 V148" opacity="0.4"/><path d="M284 118 V168" opacity="0.4"/><path d="M302 118 V142" opacity="0.4"/><path d="M320 118 V156" opacity="0.4"/>
    </g>`,
    `<linearGradient id="wav-${s}" gradientUnits="userSpaceOnUse" x1="0" y1="58" x2="0" y2="178"><stop offset="0" stop-color="${A}"/><stop offset="1" stop-color="${A2}"/></linearGradient>`),

  // sam — dimmer sibling orb + battery (bolt) + cpu chip
  sam: (s) => mk(s, `
    <circle cx="92" cy="120" r="32" fill="${A}" fill-opacity="0.85" filter="url(#glow-${s})"/>
    <circle cx="106" cy="110" r="28" fill="#080b0f"/>
    <g fill="none" stroke="${WL}" stroke-width="2"><rect x="180" y="92" width="118" height="50" rx="9"/><rect x="298" y="106" width="9" height="22" rx="3" fill="${WL}"/></g>
    <rect x="188" y="100" width="58" height="34" rx="5" fill="${A}" filter="url(#glow-${s})"/>
    <path d="M214 104 L201 124 H212 L208 138 L224 116 H212 Z" fill="${INK}"/>
    <g fill="none" stroke="${WM}" stroke-width="1.4"><rect x="196" y="166" width="44" height="30" rx="4"/>
      <path d="M205 166 v-7 M218 166 v-7 M231 166 v-7 M205 196 v7 M218 196 v7 M231 196 v7 M196 174 h-7 M196 188 h-7 M240 174 h7 M240 188 h7"/></g>
    <text x="218" y="185" fill="${WM}" ${MONO} font-size="9" text-anchor="middle">CPU</text>`),

  // donghua-cli — terminal window, prompt, progress, glowing play
  'donghua-cli': (s) => mk(s, `
    <g fill="none" stroke="${WL}" stroke-width="1.4"><rect x="56" y="52" width="288" height="136" rx="10"/></g>
    <path d="M56 78 H344" stroke="${WF}"/>
    <g fill="${WM}"><circle cx="74" cy="65" r="3.5"/><circle cx="88" cy="65" r="3.5"/><circle cx="102" cy="65" r="3.5"/></g>
    <text x="74" y="106" fill="${WM}" ${MONO} font-size="11">$ dhua "BTTH s5"</text>
    <text x="74" y="128" fill="${A}" ${MONO} font-size="11">▸ resolving 1080p</text>
    <rect x="74" y="146" width="178" height="5" rx="2.5" fill="${WF}"/>
    <rect x="74" y="146" width="104" height="5" rx="2.5" fill="${A}"/>
    <circle cx="298" cy="138" r="26" fill="none" stroke="${A}" stroke-opacity="0.4"/>
    <path d="M289 126 L313 138 L289 150 Z" fill="${A}" filter="url(#glow-${s})"/>`),

  // vn2apk — game folder → arrow → phone (APK + signed check)
  vn2apk: (s) => mk(s, `
    <g fill="none" stroke="${WL}" stroke-width="1.8"><path d="M54 86 h40 l10 12 h52 a6 6 0 0 1 6 6 v54 a6 6 0 0 1 -6 6 H54 a6 6 0 0 1 -6 -6 V92 a6 6 0 0 1 6 -6 Z"/></g>
    <text x="84" y="132" fill="${WM}" ${MONO} font-size="9">/game</text>
    <g stroke="${A}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow-${s})"><path d="M184 120 H236 M225 109 L236 120 L225 131"/></g>
    <rect x="266" y="72" width="80" height="124" rx="15" fill="none" stroke="${A}" stroke-width="2" filter="url(#glow-${s})"/>
    <rect x="296" y="80" width="20" height="4" rx="2" fill="${A}"/>
    <text x="306" y="138" fill="${A}" ${MONO} font-size="13" font-weight="700" text-anchor="middle">APK</text>
    <g transform="translate(306,166)"><circle r="11" fill="none" stroke="${A}" stroke-width="1.6"/><path d="M-4 0 l3 3 l6 -7" stroke="${A}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`),

  // crow — surveillance frames flanking a central watching lens, one detection
  crow: (s) => mk(s, `
    <g fill="none" stroke="${WF}"><rect x="40" y="56" width="116" height="56" rx="4"/><rect x="40" y="124" width="116" height="56" rx="4"/></g>
    <g fill="none" stroke="${WL}" stroke-width="1.3"><rect x="244" y="56" width="116" height="56" rx="4"/><rect x="244" y="124" width="116" height="56" rx="4"/></g>
    <rect x="262" y="66" width="40" height="38" rx="2" fill="none" stroke="${A}" stroke-width="2" filter="url(#glow-${s})"/>
    <text x="262" y="62" fill="${A}" ${MONO} font-size="9">0.98</text>
    <g filter="url(#glow-${s})"><circle cx="200" cy="118" r="30" fill="none" stroke="${A}" stroke-width="2"/><circle cx="200" cy="118" r="13" fill="none" stroke="${A}" stroke-width="2"/><circle cx="200" cy="118" r="4" fill="${A}"/></g>
    <g stroke="${WL}" stroke-dasharray="2 4" fill="none"><path d="M170 116 H156"/><path d="M230 110 H244"/></g>
    <circle cx="50" cy="168" r="4" fill="${L}"/><text x="60" y="172" fill="${WM}" ${MONO} font-size="9">REC</text>`),

  // warmcore — x86 stack → warm translation core (PGO) → arm64 stack
  warmcore: (s) => mk(s, `
    <text x="46" y="90" fill="${WM}" ${MONO} font-size="9">x86</text>
    <g fill="none" stroke="${WL}"><rect x="46" y="96" width="56" height="18" rx="3"/><rect x="46" y="118" width="56" height="18" rx="3"/><rect x="46" y="140" width="56" height="18" rx="3"/></g>
    <path d="M102 127 H160" stroke="${WL}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="200" cy="120" r="34" fill="url(#warm-${s})" filter="url(#glow-${s})"/>
    <circle cx="200" cy="120" r="34" fill="none" stroke="${A}" stroke-width="1.4" stroke-opacity="0.7"/>
    <text x="200" y="124" fill="${INK}" ${MONO} font-size="11" font-weight="700" text-anchor="middle">PGO</text>
    <g stroke="${A}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow-${s})"><path d="M240 120 H300 M289 109 L300 120 L289 131"/></g>
    <text x="306" y="90" fill="${WM}" ${MONO} font-size="9">arm64</text>
    <g fill="none" stroke="${A}" stroke-opacity="0.55"><rect x="306" y="96" width="56" height="18" rx="3"/><rect x="306" y="118" width="56" height="18" rx="3"/><rect x="306" y="140" width="56" height="18" rx="3"/></g>`,
    `<radialGradient id="warm-${s}" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ffe08a"/><stop offset="0.6" stop-color="${L}"/><stop offset="1" stop-color="${L}" stop-opacity="0.25"/></radialGradient>`),

  // vulkan-renderer — wireframe polyhedron, one lit face, faint pipeline tick
  'vulkan-renderer': (s) => mk(s, `
    <g stroke="${WL}" fill="none" stroke-width="1.3"><path d="M200 56 L262 96 L240 168 L160 168 L138 96 Z"/><path d="M200 56 L240 168 M200 56 L160 168 M262 96 L160 168 M138 96 L240 168 M200 56 L200 120 M138 96 L262 96"/></g>
    <path d="M200 56 L262 96 L200 120 Z" fill="${A}" fill-opacity="0.12" stroke="${A}" stroke-width="1.5" filter="url(#glow-${s})"/>
    <g fill="${A}"><circle cx="200" cy="56" r="3"/><circle cx="262" cy="96" r="3"/><circle cx="240" cy="168" r="3"/><circle cx="160" cy="168" r="3"/><circle cx="138" cy="96" r="3"/><circle cx="200" cy="120" r="2.5"/></g>
    <text x="148" y="190" fill="${WM}" ${MONO} font-size="9">VkPipeline</text>
    <rect x="148" y="196" width="104" height="3" rx="1.5" fill="${WF}"/>
    <rect x="148" y="196" width="42" height="3" rx="1.5" fill="#f0506e"/>`),

  // wgpu-shader-explorer — WGSL source → live-rendered fragment tile
  'wgpu-shader-explorer': (s) => mk(s, `
    <g ${MONO} font-size="10" fill="${WM}"><text x="40" y="90">fn fs(uv) {</text><text x="54" y="110">return</text><text x="54" y="130">vec4(uv,1);</text><text x="40" y="150">}</text></g>
    <g stroke="${A}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow-${s})"><path d="M166 119 H204 M194 109 L204 119 L194 129"/></g>
    <rect x="222" y="64" width="130" height="112" rx="8" fill="url(#frag-${s})" filter="url(#glow-${s})"/>
    <rect x="222" y="64" width="130" height="112" rx="8" fill="none" stroke="rgba(255,255,255,0.18)"/>
    <text x="224" y="192" fill="${WM}" ${MONO} font-size="9">naga · live</text>`,
    `<linearGradient id="frag-${s}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${A}"/><stop offset="0.5" stop-color="#3b82f6"/><stop offset="1" stop-color="#7c3aed"/></linearGradient>`),

  // dianalang — declarative skill source guarded by a shield (safety as syntax)
  dianalang: (s) => mk(s, `
    <g ${MONO} font-size="11" fill="${WM}"><text x="40" y="86">skill volume {</text><text x="56" y="108">gate trusted</text><text x="56" y="130">exec wpctl</text><text x="40" y="152">}</text></g>
    <path d="M300 56 L348 73 V117 q0 38 -48 58 q-48 -20 -48 -58 V73 Z" fill="${A}" fill-opacity="0.09" stroke="${A}" stroke-width="2" filter="url(#glow-${s})"/>
    <path d="M280 116 l13 13 l24 -28" fill="none" stroke="${A}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`),

  // chat-agent-template — chat bubbles wired to a column of tool nodes
  'chat-agent-template': (s) => mk(s, `
    <g fill="none" stroke="${WL}" stroke-width="1.4"><rect x="40" y="60" width="158" height="36" rx="12"/></g>
    <text x="54" y="82" fill="${WM}" ${MONO} font-size="10">search("…")</text>
    <g filter="url(#glow-${s})"><rect x="40" y="128" width="176" height="36" rx="12" fill="none" stroke="${A}" stroke-width="1.4"/></g>
    <text x="54" y="150" fill="${A}" ${MONO} font-size="10">▸ streaming</text>
    <g fill="${A}"><circle cx="180" cy="146" r="2"/><circle cx="190" cy="146" r="2"/><circle cx="200" cy="146" r="2"/></g>
    <g stroke="${WL}" stroke-dasharray="2 3" fill="none"><path d="M216 146 C 252 146 264 74 299 74"/><path d="M216 146 C 252 146 264 120 299 120"/><path d="M216 146 C 252 146 264 166 299 166"/></g>
    <g stroke="${WL}" fill="#0b0f14"><circle cx="312" cy="74" r="13"/><circle cx="312" cy="120" r="13"/><circle cx="312" cy="166" r="13"/></g>
    <g stroke="${A}" stroke-width="1.6" fill="none"><circle cx="310" cy="72" r="4"/><path d="M313 75 l4 4"/></g>
    <g stroke="${A}" stroke-width="1.6" fill="none"><path d="M307 114 l-5 6 l5 6 M317 114 l5 6 l-5 6"/></g>
    <g stroke="${A}" stroke-width="1.5" fill="none"><ellipse cx="312" cy="160" rx="7" ry="3"/><path d="M305 160 v6 q7 3 14 0 v-6"/></g>`),

  // smart-campus-api — sensored building feeding REST endpoints
  'smart-campus-api': (s) => mk(s, `
    <g fill="none" stroke="${WL}" stroke-width="1.5"><rect x="48" y="80" width="92" height="108" rx="3"/></g>
    <g fill="${WF}"><rect x="60" y="92" width="14" height="14"/><rect x="84" y="92" width="14" height="14"/><rect x="108" y="92" width="14" height="14"/><rect x="60" y="116" width="14" height="14"/><rect x="84" y="116" width="14" height="14"/><rect x="108" y="116" width="14" height="14"/><rect x="60" y="140" width="14" height="14"/><rect x="84" y="140" width="14" height="14"/><rect x="108" y="140" width="14" height="14"/></g>
    <circle cx="94" cy="68" r="11" fill="none" stroke="${A}" stroke-opacity="0.4"/><circle cx="94" cy="68" r="5" fill="${A}" filter="url(#glow-${s})"/>
    <path d="M148 120 H198" stroke="${A}" stroke-width="2" fill="none" stroke-linecap="round" filter="url(#glow-${s})"/>
    <g ${MONO} font-size="10">
      <rect x="206" y="84" width="152" height="22" rx="5" fill="${WF}"/><text x="216" y="99" fill="${A}">GET</text><text x="248" y="99" fill="${WM}">/rooms</text>
      <rect x="206" y="110" width="152" height="22" rx="5" fill="${WF}"/><text x="216" y="125" fill="${A}">GET</text><text x="248" y="125" fill="${WM}">/sensors</text>
      <rect x="206" y="136" width="152" height="22" rx="5" fill="${WF}"/><text x="216" y="151" fill="${L}">POST</text><text x="252" y="151" fill="${WM}">/readings</text>
    </g>`),

  // neti — socket graph with a glowing hub and a quiz tick
  neti: (s) => mk(s, `
    <g stroke="${WL}" fill="none" stroke-width="1.4"><path d="M70 80 L186 120 L70 162 M186 120 L322 86 M186 120 L322 156"/></g>
    <g fill="${WM}"><circle cx="70" cy="80" r="5"/><circle cx="70" cy="162" r="5"/><circle cx="322" cy="86" r="5"/><circle cx="322" cy="156" r="5"/></g>
    <circle cx="186" cy="120" r="20" fill="none" stroke="${A}" stroke-opacity="0.35"/>
    <circle cx="186" cy="120" r="12" fill="${A}" filter="url(#glow-${s})"/>
    <g fill="${A}"><circle cx="128" cy="100" r="2.5"/><circle cx="256" cy="102" r="2.5"/></g>
    <g transform="translate(256,168)"><circle r="13" fill="#0b0f14" stroke="${A}" stroke-width="1.5"/><path d="M-5 0 l4 4 l7 -8" stroke="${A}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`),
};

export function getHero(slug: string): string | null {
  return ART[slug]?.(slug) ?? null;
}
