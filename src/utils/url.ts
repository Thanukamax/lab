// Prefix internal links with the configured base path (e.g. "/lab").
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function withBase(path = ''): string {
  if (!path) return BASE || '/';
  return `${BASE}/${path.replace(/^\//, '')}`;
}

export function fmtDate(d: Date, long = false): string {
  return d.toLocaleDateString('en-US', {
    month: long ? 'long' : 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
