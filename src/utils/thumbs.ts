// Topic-keyed SVG thumbnails. Dark art tiles that read intentionally in both themes.
// Used as a fallback whenever an entry has no heroImage.

const S = (inner: string) =>
  `<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="240" fill="#0b0c10"/>${inner}</svg>`;

const THUMBS: Record<string, string> = {
  Systems: S(`<g stroke="rgba(255,255,255,0.08)"><line x1="0" y1="80" x2="400" y2="80"/><line x1="0" y1="160" x2="400" y2="160"/></g>
    <g fill="rgba(255,255,255,0.85)"><rect x="48" y="150" width="20" height="40"/><rect x="80" y="120" width="20" height="70"/><rect x="112" y="90" width="20" height="100"/><rect x="160" y="70" width="20" height="120"/><rect x="192" y="110" width="20" height="80"/><rect x="240" y="60" width="20" height="130"/><rect x="288" y="100" width="20" height="90"/><rect x="320" y="50" width="20" height="140"/></g>`),

  AI: S(`<g fill="rgba(255,255,255,0.9)"><circle cx="80" cy="70" r="3"/><circle cx="130" cy="110" r="3"/><circle cx="180" cy="80" r="3"/><circle cx="90" cy="150" r="3"/><circle cx="160" cy="170" r="3"/></g>
    <g fill="rgba(255,255,255,0.5)"><circle cx="240" cy="60" r="3"/><circle cx="290" cy="100" r="3"/><circle cx="330" cy="140" r="3"/><circle cx="260" cy="160" r="3"/><circle cx="310" cy="70" r="3"/></g>
    <g stroke="rgba(255,255,255,0.22)" fill="none"><circle cx="160" cy="120" r="78"/></g><g stroke="rgba(255,255,255,0.5)" fill="none"><circle cx="160" cy="120" r="32"/></g>`),

  'Machine Learning': S(`<g fill="rgba(255,255,255,0.9)"><circle cx="80" cy="70" r="3"/><circle cx="130" cy="110" r="3"/><circle cx="180" cy="80" r="3"/><circle cx="90" cy="150" r="3"/><circle cx="160" cy="170" r="3"/></g>
    <g fill="rgba(255,255,255,0.5)"><circle cx="240" cy="60" r="3"/><circle cx="300" cy="100" r="3"/><circle cx="330" cy="140" r="3"/><circle cx="260" cy="150" r="3"/></g>
    <g stroke="rgba(255,255,255,0.25)" fill="none"><circle cx="150" cy="120" r="70"/></g>`),

  'Developer Tools': S(`<g stroke="rgba(255,255,255,0.4)" fill="none" stroke-width="1"><path d="M50 120 L120 120 L170 80 L250 80 L300 120 L360 120"/><path d="M170 80 L220 160 L300 160"/></g>
    <g fill="#fff"><circle cx="50" cy="120" r="6"/><circle cx="170" cy="80" r="5"/><circle cx="250" cy="80" r="5"/><circle cx="300" cy="120" r="5"/><circle cx="300" cy="160" r="5"/><circle cx="360" cy="120" r="6"/></g>
    <g fill="rgba(255,255,255,0.5)" font-family="ui-monospace,monospace" font-size="11"><text x="56" y="206">$ build --release</text></g>`),

  Cloud: S(`<g stroke="rgba(255,255,255,0.18)" fill="none"><rect x="60" y="50" width="90" height="60" rx="8"/><rect x="250" y="50" width="90" height="60" rx="8"/><rect x="155" y="140" width="90" height="60" rx="8"/></g>
    <g fill="#fff"><circle cx="105" cy="80" r="4"/><circle cx="295" cy="80" r="4"/><circle cx="200" cy="170" r="4"/></g>
    <g stroke="rgba(255,255,255,0.4)" fill="none"><path d="M105 80 L200 170 L295 80"/><path d="M105 80 L295 80"/></g>`),

  Research: S(`<g stroke="rgba(255,255,255,0.1)"><line x1="0" y1="60" x2="400" y2="60"/><line x1="0" y1="120" x2="400" y2="120"/><line x1="0" y1="180" x2="400" y2="180"/></g>
    <path d="M20 170 Q90 150 140 160 T250 120 T360 70" stroke="#fff" stroke-width="2" fill="none"/>
    <path d="M20 170 Q90 150 140 160 T250 120 T360 70 L360 220 L20 220 Z" fill="rgba(255,255,255,0.07)"/>
    <g stroke="rgba(255,255,255,0.35)" stroke-dasharray="2 4" fill="none"><line x1="250" y1="0" x2="250" y2="240"/></g>
    <g fill="rgba(255,255,255,0.5)" font-family="ui-monospace,monospace" font-size="10"><text x="258" y="30">headroom gate</text></g>`),

  Graphics: S(`<g stroke="rgba(255,255,255,0.35)" fill="none"><path d="M200 50 L120 110 L120 190 L200 230 L280 190 L280 110 Z"/><path d="M200 50 L200 130 M120 110 L200 130 L280 110 M200 130 L200 230"/></g>
    <g fill="#fff"><circle cx="200" cy="50" r="4"/><circle cx="120" cy="110" r="4"/><circle cx="280" cy="110" r="4"/><circle cx="120" cy="190" r="4"/><circle cx="280" cy="190" r="4"/><circle cx="200" cy="230" r="4"/><circle cx="200" cy="130" r="4"/></g>`),

  Backend: S(`<g stroke="rgba(255,255,255,0.18)" fill="none"><ellipse cx="200" cy="70" rx="90" ry="26"/><path d="M110 70 V170 a90 26 0 0 0 180 0 V70"/><path d="M110 120 a90 26 0 0 0 180 0"/></g>
    <g fill="rgba(255,255,255,0.5)" font-family="ui-monospace,monospace" font-size="11"><text x="150" y="210">GET /sensors</text></g>`),
};

const DEFAULT = S(`<g stroke="rgba(255,255,255,0.12)"><line x1="0" y1="120" x2="400" y2="120"/><line x1="200" y1="0" x2="200" y2="240"/></g>
  <circle cx="200" cy="120" r="40" fill="none" stroke="rgba(255,255,255,0.4)"/><circle cx="200" cy="120" r="4" fill="#fff"/>`);

export function getThumb(topic: string): string {
  return THUMBS[topic] ?? DEFAULT;
}
