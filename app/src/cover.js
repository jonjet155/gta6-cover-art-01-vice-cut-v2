// VICE CUT v2 — painterly cover renderer: draws the multi-panel cover onto any 2D canvas.
// The default layout is the Cover Grid: a 3x3 grid whose centre cell is a painted
// title block, with eight different original illustrations around it — never the
// same illustration twice. In every other layout the title lives in its own band
// below the photos, so it can never sit on a face or a subject in any panel.
export const SAMPLE_FILES = [
  'samples/scene-couple.jpg',
  'samples/scene-moto.jpg',
  'samples/scene-boat.jpg',
  'samples/scene-car.jpg',
  'samples/scene-gator.jpg',
  'samples/scene-heli.jpg',
  'samples/scene-diner.jpg',
  'samples/scene-pier.jpg',
];

export const SAMPLE_NAMES = [
  'Sunset Couple',
  'Pink Wheelie',
  'Flamingo Boat',
  'Ocean Boulevard',
  'Swamp Gator',
  'Skyline Heli',
  'Neon Diner',
  'Pier Fishing',
];

export const SIZES = {
  square: { label: 'Square 1080 x 1080', w: 1080, h: 1080 },
  portrait: { label: 'Portrait 1080 x 1350', w: 1080, h: 1350 },
  wide: { label: 'Wide 1920 x 1080', w: 1920, h: 1080 },
};

export const LAYOUTS = {
  grid: { name: 'Cover Grid', blurb: 'Nine cells, centre is the painted title block, eight illustrations around it' },
  comic: { name: 'Comic Cut', blurb: 'Diagonal comic-cut panels, four different illustrations' },
  hero3: { name: 'Hero + 3', blurb: 'One big hero illustration, three stacked beside it' },
  strip: { name: 'Film Strip', blurb: 'Wide hero on top, three small frames below' },
  four: { name: 'Four Cut', blurb: 'Classic 2 x 2 grid, one illustration per cell' },
};

export const GRADES = {
  sunset: { name: 'Vice Sunset', warm: 'rgba(255,122,26,0.20)', cool: 'rgba(255,45,120,0.10)', sat: 1.25, con: 1.06 },
  neon: { name: 'Neon Night', warm: 'rgba(255,0,160,0.20)', cool: 'rgba(0,220,255,0.16)', sat: 1.35, con: 1.10 },
  teal: { name: 'Teal Coast', warm: 'rgba(255,190,80,0.10)', cool: 'rgba(0,180,190,0.20)', sat: 1.15, con: 1.04 },
  mono: { name: 'Ink Mono', warm: 'rgba(255,255,255,0.05)', cool: 'rgba(0,0,0,0.10)', sat: 0, con: 1.12 },
};

export const CAPTION_STYLES = {
  chrome: { name: 'Chrome', fill: ['#ffffff', '#c9d4dd', '#8fa0ae'], stroke: '#111318', glow: null },
  neon: { name: 'Neon', fill: ['#ff5fd2', '#ff2e88'], stroke: '#12001a', glow: '#ff2e88' },
  sunset: { name: 'Sunset', fill: ['#ffd23f', '#ff7a1a', '#ff2e88'], stroke: '#1a0d00', glow: '#ff7a1a' },
  mono: { name: 'Mono', fill: ['#ffffff', '#ffffff'], stroke: '#000000', glow: null },
};

// Panel polygons in normalised coordinates over the photo area (x 0..1, y 0..1).
// The grid layout returns eight rectangles around the centre title cell.
export function layoutPanels(layout, photoW, photoH) {
  const g = 0.012; // gutter, fraction of photo width
  if (layout === 'grid') {
    const cells = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (row === 1 && col === 1) continue; // centre cell is the title block
        const x0 = col / 3 + (col === 0 ? 0 : g / 2);
        const x1 = (col + 1) / 3 - (col === 2 ? 0 : g / 2);
        const y0 = row / 3 + (row === 0 ? 0 : g / 2);
        const y1 = (row + 1) / 3 - (row === 2 ? 0 : g / 2);
        cells.push([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
      }
    }
    return cells;
  }
  if (layout === 'hero3') {
    return [
      [[0, 0], [0.62, 0], [0.62, 1], [0, 1]],
      [[0.62 + g, 0], [1, 0], [1, 0.333], [0.62 + g, 0.333]],
      [[0.62 + g, 0.333 + g], [1, 0.333 + g], [1, 0.666], [0.62 + g, 0.666]],
      [[0.62 + g, 0.666 + g], [1, 0.666 + g], [1, 1], [0.62 + g, 1]],
    ];
  }
  if (layout === 'strip') {
    return [
      [[0, 0], [1, 0], [1, 0.62], [0, 0.62]],
      [[0, 0.62 + g], [0.333, 0.62 + g], [0.333, 1], [0, 1]],
      [[0.333 + g, 0.62 + g], [0.666, 0.62 + g], [0.666, 1], [0.333 + g, 1]],
      [[0.666 + g, 0.62 + g], [1, 0.62 + g], [1, 1], [0.666 + g, 1]],
    ];
  }
  if (layout === 'four') {
    return [
      [[0, 0], [0.5, 0], [0.5, 0.5], [0, 0.5]],
      [[0.5 + g, 0], [1, 0], [1, 0.5], [0.5 + g, 0.5]],
      [[0, 0.5 + g], [0.5, 0.5 + g], [0.5, 1], [0, 1]],
      [[0.5 + g, 0.5 + g], [1, 0.5 + g], [1, 1], [0.5 + g, 1]],
    ];
  }
  // comic: diagonal cuts. Top-left tall, top-right slanted, bottom two angled.
  return [
    [[0, 0], [0.58, 0], [0.50, 0.58], [0, 0.66]],
    [[0.58 + g, 0], [1, 0], [1, 0.52], [0.50 + g, 0.58]],
    [[0, 0.66 + g], [0.50, 0.58 + g], [0.44, 1], [0, 1]],
    [[0.44 + g, 1], [0.50 + g, 0.58 + g], [1, 0.52 + g], [1, 1]],
  ];
}

// Centre title cell of the Cover Grid, in pixels over the full cover.
export function gridTitleRect(W, H) {
  const g = 0.012 * W;
  return {
    x: W / 3 + g / 2,
    y: H / 3 + g / 2,
    w: W / 3 - g,
    h: H / 3 - g,
  };
}

function drawCoverFitImage(ctx, img, poly, px, py, pw, ph, pan, zoom) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of poly) {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  const bx = px + minX * pw, by = py + minY * ph, bw = (maxX - minX) * pw, bh = (maxY - minY) * ph;
  const trace = () => {
    ctx.beginPath();
    poly.forEach(([x, y], i) => {
      const dx = px + x * pw, dy = py + y * ph;
      if (i === 0) ctx.moveTo(dx, dy); else ctx.lineTo(dx, dy);
    });
    ctx.closePath();
  };
  ctx.save();
  trace();
  ctx.clip();
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  const scale = Math.max(bw / iw, bh / ih) * (zoom || 1);
  const dw = iw * scale, dh = ih * scale;
  const dx = bx + (bw - dw) / 2 + (pan ? pan.x * bw : 0);
  const dy = by + (bh - dh) / 2 + (pan ? pan.y * bh : 0);
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
  ctx.save();
  trace();
  ctx.strokeStyle = 'rgba(10,10,14,0.9)';
  ctx.lineWidth = Math.max(2, pw * 0.004);
  ctx.stroke();
  ctx.restore();
}

function applyGrade(ctx, grade, W, H, photoH) {
  const warm = ctx.createLinearGradient(0, 0, W, photoH);
  warm.addColorStop(0, grade.warm);
  warm.addColorStop(1, grade.cool);
  ctx.fillStyle = warm;
  ctx.fillRect(0, 0, W, photoH);
}

function drawGrainAndVignette(ctx, W, H) {
  const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.28)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}

// One palm silhouette, drawn with canvas curves: a short leaning trunk and
// six short fronds that droop down and out, so they stay in the corner and
// never reach the title lettering above them.
function drawPalm(ctx, x, y, s, lean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(lean, 1);
  ctx.strokeStyle = 'rgba(24,8,32,0.9)';
  ctx.fillStyle = 'rgba(24,8,32,0.9)';
  ctx.lineWidth = Math.max(2, s * 0.05);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(s * 0.06, -s * 0.35, s * 0.16, -s * 0.62);
  ctx.stroke();
  const topX = s * 0.16, topY = -s * 0.62;
  for (let i = 0; i < 6; i++) {
    const a = (-0.30 - i * 0.26) * Math.PI;
    const len = s * (0.34 + (i % 2) * 0.08);
    const ex = topX + Math.cos(a) * len;
    const ey = topY + Math.sin(a) * len * 0.55 + s * 0.10;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(topX + Math.cos(a) * len * 0.5, topY + s * 0.06, ex, ey);
    ctx.stroke();
  }
  ctx.restore();
}

// The painted title block in the centre of the Cover Grid: sunset gradient,
// palm silhouettes at the corners, a thin gold border, and the title in
// heavy condensed caps with a gradient fill and dark outline.
function drawTitleBlock(ctx, state, W, H) {
  const r = gridTitleRect(W, H);
  const style = CAPTION_STYLES[state.captionStyle] || CAPTION_STYLES.sunset;
  const grad = ctx.createLinearGradient(r.x, r.y, r.x, r.y + r.h);
  grad.addColorStop(0, '#ff2e88');
  grad.addColorStop(0.45, '#ff7a1a');
  grad.addColorStop(0.8, '#b04dff');
  grad.addColorStop(1, '#5b2a86');
  ctx.fillStyle = grad;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  // A low sun glow behind the lettering.
  const sun = ctx.createRadialGradient(r.x + r.w / 2, r.y + r.h * 0.62, 4, r.x + r.w / 2, r.y + r.h * 0.62, r.w * 0.42);
  sun.addColorStop(0, 'rgba(255,210,63,0.55)');
  sun.addColorStop(1, 'rgba(255,210,63,0)');
  ctx.fillStyle = sun;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  drawPalm(ctx, r.x + r.w * 0.03, r.y + r.h * 0.99, r.w * 0.28, 1);
  drawPalm(ctx, r.x + r.w * 0.97, r.y + r.h * 0.99, r.w * 0.26, -1);
  ctx.strokeStyle = '#ffd23f';
  ctx.lineWidth = Math.max(3, r.w * 0.012);
  ctx.strokeRect(r.x + ctx.lineWidth / 2, r.y + ctx.lineWidth / 2, r.w - ctx.lineWidth, r.h - ctx.lineWidth);
  const title = (state.title || 'VICE CUT').toUpperCase();
  const fontFor = (s) => `900 ${s}px "Arial Black", Arial, sans-serif`;
  let size = r.w * 0.24;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.font = fontFor(size);
  while (ctx.measureText(title).width > r.w * 0.88 && size > 10) {
    size *= 0.92;
    ctx.font = fontFor(size);
  }
  const fill = ctx.createLinearGradient(r.x, r.y, r.x, r.y + r.h * 0.6);
  const stops = style.fill;
  stops.forEach((c, i) => fill.addColorStop(i / Math.max(1, stops.length - 1), c));
  const ty = r.y + r.h * 0.44;
  ctx.save();
  if (style.glow) { ctx.shadowColor = style.glow; ctx.shadowBlur = size * 0.30; }
  ctx.lineWidth = Math.max(2, size * 0.10);
  ctx.strokeStyle = style.stroke;
  ctx.lineJoin = 'round';
  ctx.strokeText(title, r.x + r.w / 2, ty);
  ctx.fillStyle = fill;
  ctx.fillText(title, r.x + r.w / 2, ty);
  ctx.restore();
  const tag = (state.tagline || '').trim();
  let subSize = Math.max(10, r.w * 0.052);
  ctx.font = `700 ${subSize}px Arial, sans-serif`;
  while (tag && ctx.measureText(tag).width > r.w * 0.86 && subSize > 8) {
    subSize *= 0.92;
    ctx.font = `700 ${subSize}px Arial, sans-serif`;
  }
  ctx.fillStyle = '#ffffff';
  if (tag) ctx.fillText(tag, r.x + r.w / 2, r.y + r.h * 0.68);
  let bottom = tag ? r.y + r.h * 0.82 : r.y + r.h * 0.68;
  if (state.stars) {
    ctx.fillStyle = '#ffd23f';
    ctx.font = `700 ${subSize}px Arial, sans-serif`;
    ctx.fillText('★★★★★', r.x + r.w / 2, bottom);
    bottom += subSize * 1.4;
  }
  if (state.badge) {
    const b = 'LEONIDA';
    ctx.font = `900 ${Math.max(9, r.w * 0.045)}px Arial, sans-serif`;
    const bw = ctx.measureText(b).width + subSize * 1.2;
    const bh = subSize * 1.5;
    const bx = r.x + (r.w - bw) / 2, by = bottom - bh / 2;
    ctx.fillStyle = '#ff2e88';
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, bh * 0.5);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText(b, r.x + r.w / 2, by + bh / 2);
  }
}

function drawTitleBand(ctx, state, W, H, bandY, bandH) {
  const style = CAPTION_STYLES[state.captionStyle] || CAPTION_STYLES.chrome;
  ctx.fillStyle = '#0b0b10';
  ctx.fillRect(0, bandY, W, bandH);
  const stripe = ctx.createLinearGradient(0, 0, W, 0);
  stripe.addColorStop(0, '#ffb300');
  stripe.addColorStop(0.5, '#ff2e88');
  stripe.addColorStop(1, '#00d5ff');
  ctx.fillStyle = stripe;
  ctx.fillRect(0, bandY, W, Math.max(3, bandH * 0.045));
  const pad = W * 0.04;
  let badgeW = 0;
  if (state.badge) {
    ctx.font = `900 ${Math.max(11, bandH * 0.22)}px Arial, sans-serif`;
    badgeW = ctx.measureText('LEONIDA').width + bandH * 0.30;
  }
  let size = bandH * 0.52;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  const title = (state.title || 'VICE CUT').toUpperCase();
  const fontFor = (s) => `900 ${s}px "Arial Black", Arial, sans-serif`;
  ctx.font = fontFor(size);
  while (ctx.measureText(title).width > W - pad * 2 - (badgeW ? badgeW + pad : 0) && size > 10) {
    size *= 0.92;
    ctx.font = fontFor(size);
  }
  const grad = ctx.createLinearGradient(0, bandY, 0, bandY + bandH);
  const stops = style.fill;
  stops.forEach((c, i) => grad.addColorStop(i / Math.max(1, stops.length - 1), c));
  const ty = bandY + bandH * 0.52;
  ctx.save();
  if (style.glow) { ctx.shadowColor = style.glow; ctx.shadowBlur = size * 0.35; }
  ctx.lineWidth = Math.max(2, size * 0.09);
  ctx.strokeStyle = style.stroke;
  ctx.lineJoin = 'round';
  ctx.strokeText(title, pad, ty);
  ctx.fillStyle = grad;
  ctx.fillText(title, pad, ty);
  ctx.restore();
  const tag = (state.tagline || '').trim();
  let subSize = Math.max(11, bandH * 0.20);
  ctx.font = `700 ${subSize}px Arial, sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffd23f';
  let rightText = tag;
  if (state.stars) rightText = (rightText ? rightText + '  ' : '') + '★★★★★';
  while (rightText && ctx.measureText(rightText).width > W * 0.55 && subSize > 8) {
    subSize *= 0.92;
    ctx.font = `700 ${subSize}px Arial, sans-serif`;
  }
  if (rightText) ctx.fillText(rightText, W - pad, bandY + bandH * 0.86);
  if (state.badge) {
    const b = 'LEONIDA';
    ctx.font = `900 ${Math.max(11, bandH * 0.22)}px Arial, sans-serif`;
    const bw = badgeW;
    const bx = W - pad - bw, by = bandY + bandH * 0.12;
    ctx.fillStyle = '#ff2e88';
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bandH * 0.30, bandH * 0.15);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(b, bx + bw / 2, by + bandH * 0.15);
    ctx.textAlign = 'left';
  }
}

// Draw the full cover. state: { layout, grade, captionStyle, title, tagline,
// stars, badge, photos: HTMLImageElement[], panelPhotos: number[], pans: [{x,y}], zooms: number[] }
export function drawCover(ctx, state, W, H) {
  const grade = GRADES[state.grade] || GRADES.sunset;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0b0b10';
  ctx.fillRect(0, 0, W, H);
  if ((state.layout || 'grid') === 'grid') {
    ctx.save();
    ctx.filter = `saturate(${grade.sat}) contrast(${grade.con})`;
    const polys = layoutPanels('grid', W, H);
    polys.forEach((poly, i) => {
      const img = state.photos && state.photos[state.panelPhotos ? state.panelPhotos[i] : i];
      if (!img) return;
      drawCoverFitImage(ctx, img, poly, 0, 0, W, H, state.pans && state.pans[i], state.zooms && state.zooms[i]);
    });
    ctx.restore();
    applyGrade(ctx, grade, W, H, H);
    drawGrainAndVignette(ctx, W, H);
    drawTitleBlock(ctx, state, W, H);
    return;
  }
  const bandH = Math.round(H * (H > W ? 0.17 : 0.19));
  const photoH = H - bandH;
  ctx.save();
  ctx.filter = `saturate(${grade.sat}) contrast(${grade.con})`;
  const polys = layoutPanels(state.layout || 'comic', W, photoH);
  polys.forEach((poly, i) => {
    const img = state.photos && state.photos[state.panelPhotos ? state.panelPhotos[i] : i];
    if (!img) return;
    drawCoverFitImage(ctx, img, poly, 0, 0, W, photoH, state.pans && state.pans[i], state.zooms && state.zooms[i]);
  });
  ctx.restore();
  applyGrade(ctx, grade, W, H, photoH);
  drawGrainAndVignette(ctx, W, photoH);
  drawTitleBand(ctx, state, W, H, photoH, bandH);
}

// Render the cover to an offscreen canvas at the requested export size.
export function renderCoverCanvas(state, sizeKey) {
  const size = SIZES[sizeKey] || SIZES.square;
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  drawCover(canvas.getContext('2d'), state, size.w, size.h);
  return canvas;
}

export function exportCoverPNG(state, sizeKey) {
  return new Promise((resolve, reject) => {
    const canvas = renderCoverCanvas(state, sizeKey);
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('PNG export failed'));
    }, 'image/png');
  });
}
