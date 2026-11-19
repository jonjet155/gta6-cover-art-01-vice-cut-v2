// VICE CUT v2 studio wiring: illustrations, layouts, caption, grades, pan/zoom, export.
// Photos are read on this machine only (FileReader / object URLs) and never uploaded.
import { SAMPLE_FILES, SAMPLE_NAMES, SIZES, LAYOUTS, GRADES, CAPTION_STYLES, layoutPanels, gridTitleRect, drawCover, exportCoverPNG } from './cover.js';
import { shotParams, markShotReady } from './shots.js';

const canvas = document.getElementById('cover');
const statusEl = document.getElementById('status');
const stripEl = document.getElementById('photoStrip');

const emptyPan = () => ({ x: 0, y: 0 });

const state = {
  layout: 'grid',
  grade: 'sunset',
  captionStyle: 'sunset',
  title: 'VICE CUT',
  tagline: 'Painted in Leonida.',
  stars: false,
  badge: true,
  size: 'square',
  photos: [],
  photoNames: [],
  panelPhotos: [0, 1, 2, 3, 4, 5, 6, 7],
  pans: Array.from({ length: 8 }, emptyPan),
  zooms: [1, 1, 1, 1, 1, 1, 1, 1],
};
let selectedPhoto = 0;
let selectedPanel = 0;
let samplesLoaded = false;

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = src;
  });
}

function currentSize() { return SIZES[state.size] || SIZES.square; }

function panelCount() { return state.layout === 'grid' ? 8 : 4; }

function redraw() {
  const size = currentSize();
  if (canvas.width !== size.w || canvas.height !== size.h) {
    canvas.width = size.w;
    canvas.height = size.h;
  }
  drawCover(canvas.getContext('2d'), state, size.w, size.h);
}

function refreshStrip() {
  stripEl.innerHTML = '';
  state.photos.forEach((img, i) => {
    const thumb = document.createElement('img');
    thumb.className = 'photo-thumb' + (i === selectedPhoto ? ' active' : '') + (state.panelPhotos.includes(i) ? ' used' : '');
    thumb.src = img.src;
    thumb.alt = state.photoNames[i] || ('Photo ' + (i + 1));
    thumb.title = thumb.alt + ' — click to place in panel ' + (selectedPanel + 1);
    thumb.addEventListener('click', () => {
      selectedPhoto = i;
      state.panelPhotos[selectedPanel] = i;
      document.getElementById('selectedPhotoName').textContent = thumb.alt;
      refreshStrip();
      redraw();
    });
    stripEl.appendChild(thumb);
  });
}

async function loadSamples() {
  if (samplesLoaded) return;
  const loaded = await Promise.all(SAMPLE_FILES.map((f) => loadImage(f)));
  state.photos = loaded;
  state.photoNames = [...SAMPLE_NAMES];
  state.panelPhotos = [0, 1, 2, 3, 4, 5, 6, 7];
  samplesLoaded = true;
  document.getElementById('selectedPhotoName').textContent = state.photoNames[0];
  refreshStrip();
  redraw();
}

function buildChips(containerId, entries, current, onPick) {
  const row = document.getElementById(containerId);
  row.innerHTML = '';
  Object.entries(entries).forEach(([key, def]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (key === current ? ' active' : '');
    b.textContent = def.name;
    b.title = def.blurb || def.name;
    b.addEventListener('click', () => {
      onPick(key);
      buildChips(containerId, entries, key, onPick);
      redraw();
    });
    row.appendChild(b);
  });
}

function pointInPolygon(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}

function panelAtPoint(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = (clientX - rect.left) / rect.width;
  const size = currentSize();
  if (state.layout === 'grid') {
    const y = (clientY - rect.top) / rect.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) return -1;
    const t = gridTitleRect(size.w, size.h);
    if (x >= t.x / size.w && x <= (t.x + t.w) / size.w && y >= t.y / size.h && y <= (t.y + t.h) / size.h) return -1;
    const polys = layoutPanels('grid', size.w, size.h);
    for (let i = polys.length - 1; i >= 0; i--) {
      if (pointInPolygon(x, y, polys[i])) return i;
    }
    return -1;
  }
  const bandH = size.h * (size.h > size.w ? 0.17 : 0.19);
  const photoH = size.h - bandH;
  const y = ((clientY - rect.top) / rect.height) * size.h / photoH;
  if (y < 0 || y > 1 || x < 0 || x > 1) return -1;
  const polys = layoutPanels(state.layout, size.w, photoH);
  for (let i = polys.length - 1; i >= 0; i--) {
    if (pointInPolygon(x, y, polys[i])) return i;
  }
  return -1;
}

function selectPanel(i) {
  selectedPanel = i;
  document.getElementById('selectedPanel').textContent = String(i + 1);
  const zoom = document.getElementById('zoom');
  zoom.value = String(Math.round(state.zooms[i] * 100));
  document.getElementById('zoomVal').textContent = zoom.value + '%';
}

// Drag-to-pan on the preview canvas.
let dragPanel = -1, dragLast = null;
canvas.addEventListener('pointerdown', (e) => {
  const p = panelAtPoint(e.clientX, e.clientY);
  if (p < 0) return;
  selectPanel(p);
  dragPanel = p;
  dragLast = { x: e.clientX, y: e.clientY };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (dragPanel < 0 || !dragLast) return;
  const rect = canvas.getBoundingClientRect();
  const size = currentSize();
  let bw, bh;
  if (state.layout === 'grid') {
    const polys = layoutPanels('grid', size.w, size.h);
    const poly = polys[dragPanel];
    let minX = 1, maxX = 0, minY = 1, maxY = 0;
    for (const [x, y] of poly) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
    bw = (maxX - minX) * rect.width;
    bh = (maxY - minY) * rect.height;
  } else {
    const bandH = size.h * (size.h > size.w ? 0.17 : 0.19);
    const photoH = size.h - bandH;
    const polys = layoutPanels(state.layout, size.w, photoH);
    const poly = polys[dragPanel];
    let minX = 1, maxX = 0, minY = 1, maxY = 0;
    for (const [x, y] of poly) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
    bw = (maxX - minX) * rect.width;
    bh = (maxY - minY) * rect.height;
  }
  const pan = state.pans[dragPanel];
  pan.x = Math.max(-0.4, Math.min(0.4, pan.x + (e.clientX - dragLast.x) / bw));
  pan.y = Math.max(-0.4, Math.min(0.4, pan.y + (e.clientY - dragLast.y) / bh));
  dragLast = { x: e.clientX, y: e.clientY };
  redraw();
});
canvas.addEventListener('pointerup', () => { dragPanel = -1; dragLast = null; });

document.getElementById('upload').addEventListener('change', async (e) => {
  const files = [...e.target.files];
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    const img = await loadImage(URL.createObjectURL(file));
    state.photos.push(img);
    state.photoNames.push(file.name);
    selectedPhoto = state.photos.length - 1;
    state.panelPhotos[selectedPanel] = selectedPhoto;
  }
  document.getElementById('selectedPhotoName').textContent = state.photoNames[selectedPhoto] || '—';
  refreshStrip();
  redraw();
  statusEl.textContent = files.length + ' photo(s) added — on this machine only.';
});

document.getElementById('loadSamples').addEventListener('click', async () => {
  await loadSamples();
  statusEl.textContent = 'Eight sample illustrations loaded — one per panel.';
});

document.getElementById('zoom').addEventListener('input', (e) => {
  state.zooms[selectedPanel] = Number(e.target.value) / 100;
  document.getElementById('zoomVal').textContent = e.target.value + '%';
  redraw();
});

document.getElementById('title').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
document.getElementById('tagline').addEventListener('input', (e) => { state.tagline = e.target.value; redraw(); });
document.getElementById('stars').addEventListener('change', (e) => { state.stars = e.target.checked; redraw(); });
document.getElementById('badge').addEventListener('change', (e) => { state.badge = e.target.checked; redraw(); });
document.getElementById('size').addEventListener('change', (e) => { state.size = e.target.value; redraw(); });

document.getElementById('export').addEventListener('click', async () => {
  const size = currentSize();
  statusEl.textContent = 'Exporting ' + size.label + '…';
  try {
    const blob = await exportCoverPNG(state, state.size);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vice-cut-' + state.size + '-' + size.w + 'x' + size.h + '.png';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    statusEl.textContent = 'Saved ' + a.download + ' — ready to post.';
  } catch (err) {
    statusEl.textContent = 'Export failed: ' + err.message;
  }
});

function pickLayout(key) {
  state.layout = key;
  if (selectedPanel >= panelCount()) selectPanel(0);
}

buildChips('layoutRow', LAYOUTS, state.layout, pickLayout);
buildChips('styleRow', CAPTION_STYLES, state.captionStyle, (key) => { state.captionStyle = key; });
buildChips('gradeRow', GRADES, state.grade, (key) => { state.grade = key; });

// Deterministic shots: ?shot=cover (cover alone) or ?shot=editor (studio, samples loaded).
const query = new URLSearchParams(location.search);
const shot = query.get('shot');
if (shot === 'cover' || shot === 'editor') {
  const preset = shotParams(query);
  Object.assign(state, preset);
  if (shot === 'cover') document.body.classList.add('shot-cover');
  document.getElementById('title').value = state.title;
  document.getElementById('tagline').value = state.tagline;
  document.getElementById('stars').checked = state.stars;
  document.getElementById('badge').checked = state.badge;
  document.getElementById('size').value = state.size;
  buildChips('layoutRow', LAYOUTS, state.layout, pickLayout);
  buildChips('styleRow', CAPTION_STYLES, state.captionStyle, (key) => { state.captionStyle = key; });
  buildChips('gradeRow', GRADES, state.grade, (key) => { state.grade = key; });
  loadSamples().then(() => { redraw(); markShotReady(); });
} else {
  loadSamples();
}
