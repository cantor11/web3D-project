const rawBase =
  typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL
    ? import.meta.env.BASE_URL
    : '/';

const normalizedBase = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

/**
 * Resolves a public asset path against Vite's configured BASE_URL so assets
 * load identically on root domains ('/') and GitHub Pages subpaths ('/web3D-project/').
 */
export function withBase(assetPath: string): string {
  if (
    assetPath.startsWith('http://') ||
    assetPath.startsWith('https://') ||
    assetPath.startsWith('mailto:') ||
    assetPath.startsWith('#')
  ) {
    return assetPath;
  }
  if (normalizedBase !== '/' && assetPath.startsWith(normalizedBase)) {
    return assetPath;
  }
  const clean = assetPath.replace(/^\/+/, '');
  return `${normalizedBase}${clean}`;
}
