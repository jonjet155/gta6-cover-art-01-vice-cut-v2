// Fixed scenes for screenshots: ?shot=cover shows the finished cover alone at
// full frame; ?shot=editor shows the studio with the eight illustrations loaded.
// Query params: layout (grid|comic|hero3|strip|four), grade, style, title,
// tagline, size (square|portrait|wide), stars (1/0), badge (1/0).
// window.__shotReady is set once the cover has been painted.
export function shotParams(query) {
  return {
    layout: query.get('layout') || 'grid',
    grade: query.get('grade') || 'sunset',
    captionStyle: query.get('style') || 'sunset',
    title: query.get('title') || 'VICE CUT',
    tagline: query.get('tagline') || 'Painted in Leonida.',
    stars: query.get('stars') === '1',
    badge: query.get('badge') !== '0',
    size: query.get('size') || 'square',
  };
}

export function markShotReady() {
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
