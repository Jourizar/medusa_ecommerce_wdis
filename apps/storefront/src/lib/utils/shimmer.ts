/**
 * Animated shimmer for next/image's `placeholder`. Next paints it as the
 * image's background and removes it once the image loads, so the animation
 * never keeps running behind a loaded image.
 */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400" preserveAspectRatio="none"><defs><linearGradient id="g"><stop offset="0" stop-color="#f5e5d8"/><stop offset=".5" stop-color="#fffaf6"/><stop offset="1" stop-color="#f5e5d8"/></linearGradient></defs><rect width="300" height="400" fill="#f5e5d8"/><rect width="300" height="400" fill="url(#g)"><animate attributeName="x" from="-300" to="300" dur="1.3s" repeatCount="indefinite"/></rect></svg>`;

// URL-encoded rather than base64: Buffer isn't available in client bundles.
export const SHIMMER_PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}` as const;
