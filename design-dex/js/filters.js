/* ============================================================
   filters.js — Design Dex
   Bitmap · Colour · Texture filters (TUI-inspired)
   All filters operate directly on a Canvas 2D context
   ============================================================ */

import { state, toast } from './app.js';
import { history } from './history.js';

/* ── Pixel-level helper ────────────────────────────────────── */
export function applyPixel(ctx, fn) {
  const c  = ctx.canvas;
  const id = ctx.getImageData(0, 0, c.width, c.height);
  const d  = id.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = fn([d[i], d[i+1], d[i+2], d[i+3]]);
    d[i]=Math.round(r[0]); d[i+1]=Math.round(r[1]);
    d[i+2]=Math.round(r[2]); d[i+3]=r[3];
  }
  ctx.putImageData(id, 0, 0);
}

/* ── Filter Definitions ─────────────────────────────────────
   Each filter: { name, icon, fn(ctx, opts) }
   ──────────────────────────────────────────────────────────── */

export const BITMAP_FILTERS = [
  {
    name: 'Grayscale', icon: '▩',
    fn(ctx) {
      applyPixel(ctx, ([r,g,b,a]) => {
        const v = Math.round(r*0.299 + g*0.587 + b*0.114);
        return [v,v,v,a];
      });
    }
  },
  {
    name: 'Invert', icon: '◑',
    fn(ctx) {
      applyPixel(ctx, ([r,g,b,a]) => [255-r, 255-g, 255-b, a]);
    }
  },
  {
    name: 'Bitmap', icon: '⬛',
    fn(ctx, { threshold=128 }={}) {
      applyPixel(ctx, ([r,g,b,a]) => {
        const v = (r*0.299 + g*0.587 + b*0.114) >= threshold ? 255 : 0;
        return [v,v,v,a];
      });
    }
  },
  {
    name: 'Edge', icon: '◈',
    fn(ctx, { strength=3 }={}) {
      const c = ctx.canvas;
      const src = ctx.getImageData(0,0,c.width,c.height);
      const dst = ctx.createImageData(c.width,c.height);
      const s=src.data, d=dst.data, w=c.width, h=c.height;

      for (let y=1;y<h-1;y++) {
        for (let x=1;x<w-1;x++) {
          const px=(y*w+x)*4;
          const g=(ox,oy)=>{
            const i=((y+oy)*w+(x+ox))*4;
            return s[i]*0.299+s[i+1]*0.587+s[i+2]*0.114;
          };
          const gx=-g(-1,-1)+g(1,-1)-2*g(-1,0)+2*g(1,0)-g(-1,1)+g(1,1);
          const gy=-g(-1,-1)-2*g(0,-1)-g(1,-1)+g(-1,1)+2*g(0,1)+g(1,1);
          const mag=Math.min(255,Math.sqrt(gx*gx+gy*gy)*strength);
          d[px]=d[px+1]=d[px+2]=mag; d[px+3]=255;
        }
      }
      ctx.putImageData(dst,0,0);
    }
  },
];

export const COLOR_FILTERS = [
  {
    name: 'Sepia', icon: '◧',
    fn(ctx) {
      applyPixel(ctx, ([r,g,b,a]) => [
        Math.min(255, r*0.393+g*0.769+b*0.189),
        Math.min(255, r*0.349+g*0.686+b*0.168),
        Math.min(255, r*0.272+g*0.534+b*0.131), a
      ]);
    }
  },
  {
    name: 'Warm', icon: '◕',
    fn(ctx) {
      applyPixel(ctx, ([r,g,b,a]) => [Math.min(255,r+30),g,Math.max(0,b-25),a]);
    }
  },
  {
    name: 'Cool', icon: '◔',
    fn(ctx) {
      applyPixel(ctx, ([r,g,b,a]) => [Math.max(0,r-20),g,Math.min(255,b+35),a]);
    }
  },
  {
    name: 'Vivid', icon: '◉',
    fn(ctx) {
      applyPixel(ctx, ([r,g,b,a]) => {
        const avg=(r+g+b)/3;
        return [
          Math.min(255,avg+(r-avg)*1.6),
          Math.min(255,avg+(g-avg)*1.6),
          Math.min(255,avg+(b-avg)*1.6), a
        ];
      });
    }
  },
  {
    name: 'Fade', icon: '◌',
    fn(ctx) {
      applyPixel(ctx, ([r,g,b,a]) => [r*0.78+50,g*0.78+50,b*0.78+50,a]);
    }
  },
  {
    name: 'Tint', icon: '◍',
    fn(ctx) {
      applyPixel(ctx, ([r,g,b,a]) => {
        const v=r*0.299+g*0.587+b*0.114;
        return [Math.min(255,v*0.8+60),Math.min(255,v*0.9),Math.min(255,v*1.1+20),a];
      });
    }
  },
];

export const TEXTURE_FILTERS = [
  {
    name: 'Emboss', icon: '▣',
    fn(ctx) {
      const c=ctx.canvas;
      const src=ctx.getImageData(0,0,c.width,c.height);
      const dst=ctx.createImageData(c.width,c.height);
      const s=src.data,d=dst.data,w=c.width,h=c.height;
      for (let y=1;y<h-1;y++) {
        for (let x=1;x<w-1;x++) {
          const px=(y*w+x)*4;
          for (let ch=0;ch<3;ch++) {
            const v=128
              -2*s[((y-1)*w+(x-1))*4+ch]
              -  s[((y-1)*w+x   )*4+ch]
              -  s[(y   *w+(x-1))*4+ch]
              +  s[(y   *w+x    )*4+ch]
              +  s[(y   *w+(x+1))*4+ch]
              +  s[((y+1)*w+x   )*4+ch]
              +2*s[((y+1)*w+(x+1))*4+ch];
            d[px+ch]=Math.min(255,Math.max(0,v));
          }
          d[px+3]=255;
        }
      }
      ctx.putImageData(dst,0,0);
    }
  },
  {
    name: 'Pixelate', icon: '▦',
    fn(ctx, { pixelSize=8 }={}) {
      const c=ctx.canvas;
      const id=ctx.getImageData(0,0,c.width,c.height);
      const d=id.data;
      for (let y=0;y<c.height;y+=pixelSize) {
        for (let x=0;x<c.width;x+=pixelSize) {
          const i=(y*c.width+x)*4;
          const [r,g,b]=[d[i],d[i+1],d[i+2]];
          for (let dy=0;dy<pixelSize&&y+dy<c.height;dy++) {
            for (let dx=0;dx<pixelSize&&x+dx<c.width;dx++) {
              const j=((y+dy)*c.width+(x+dx))*4;
              d[j]=r;d[j+1]=g;d[j+2]=b;
            }
          }
        }
      }
      ctx.putImageData(id,0,0);
    }
  },
  {
    name: 'Noise', icon: '⁘',
    fn(ctx, { noiseAmount=40 }={}) {
      applyPixel(ctx, ([r,g,b,a]) => {
        const n=(Math.random()-0.5)*noiseAmount*2;
        return [
          Math.min(255,Math.max(0,r+n)),
          Math.min(255,Math.max(0,g+n)),
          Math.min(255,Math.max(0,b+n)), a
        ];
      });
    }
  },
  {
    name: 'Sharpen', icon: '◆',
    fn(ctx) {
      const c=ctx.canvas;
      const src=ctx.getImageData(0,0,c.width,c.height);
      const dst=ctx.createImageData(c.width,c.height);
      const s=src.data,d=dst.data,w=c.width,h=c.height;
      const k=[0,-1,0,-1,5,-1,0,-1,0];
      for (let y=1;y<h-1;y++) {
        for (let x=1;x<w-1;x++) {
          const px=(y*w+x)*4;
          for (let ch=0;ch<3;ch++) {
            const v=
              k[0]*s[((y-1)*w+(x-1))*4+ch]+k[1]*s[((y-1)*w+x)*4+ch]+k[2]*s[((y-1)*w+(x+1))*4+ch]+
              k[3]*s[(y*w+(x-1))*4+ch]    +k[4]*s[(y*w+x)*4+ch]    +k[5]*s[(y*w+(x+1))*4+ch]+
              k[6]*s[((y+1)*w+(x-1))*4+ch]+k[7]*s[((y+1)*w+x)*4+ch]+k[8]*s[((y+1)*w+(x+1))*4+ch];
            d[px+ch]=Math.min(255,Math.max(0,v));
          }
          d[px+3]=255;
        }
      }
      ctx.putImageData(dst,0,0);
    }
  },
];

/* ── Active filter state ────────────────────────────────────── */
let activeFilter = null;

/* ── Build filter preview chips ────────────────────────────── */
function buildGroup(filters, containerId) {
  const grid = document.getElementById(containerId);
  if (!grid) return;
  grid.innerHTML = '';

  filters.forEach(f => {
    const chip = document.createElement('div');
    chip.className = 'filter-chip';

    // Thumbnail canvas
    const fc = document.createElement('canvas');
    if (state.sourceImage) {
      const scale = 60 / Math.max(state.sourceImage.width, state.sourceImage.height);
      fc.width  = Math.round(state.sourceImage.width  * scale);
      fc.height = Math.round(state.sourceImage.height * scale);
      const fctx = fc.getContext('2d');
      fctx.drawImage(state.sourceImage, 0, 0, fc.width, fc.height);
      try { f.fn(fctx, { threshold:128, strength:3, pixelSize:8, noiseAmount:40 }); } catch(e) {}
    } else {
      fc.width = fc.height = 60;
    }

    const lbl = document.createElement('span');
    lbl.className = 'filter-chip__label';
    lbl.textContent = f.name;

    chip.appendChild(fc);
    chip.appendChild(lbl);

    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = f;

      // Show relevant sub-controls
      document.getElementById('bitmapControls').classList.toggle('hidden', f.name !== 'Bitmap');
      document.getElementById('edgeControls').classList.toggle('hidden',   f.name !== 'Edge');
      document.getElementById('pixelateControls').classList.toggle('hidden', f.name !== 'Pixelate');
      document.getElementById('noiseControls').classList.toggle('hidden',  f.name !== 'Noise');
    });

    grid.appendChild(chip);
  });
}

export function initFilters() {
  // Slider value display
  [
    ['bitmapThreshold', 'bitmapThresholdVal'],
    ['edgeStrength',    'edgeStrengthVal'],
    ['pixelateSize',    'pixelateSizeVal'],
    ['noiseAmount',     'noiseAmountVal'],
  ].forEach(([sid, vid]) => {
    const s = document.getElementById(sid);
    const v = document.getElementById(vid);
    if (s && v) s.addEventListener('input', () => v.textContent = s.value);
  });

  // Apply
  document.getElementById('applyFilterBtn')?.addEventListener('click', () => {
    if (!state.sourceImage || !activeFilter) {
      toast(activeFilter ? 'Load an image first' : 'Select a filter first');
      return;
    }
    const canvas = document.getElementById('mainCanvas');
    const ctx    = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(state.sourceImage, 0, 0, canvas.width, canvas.height);

    activeFilter.fn(ctx, {
      threshold:   parseInt(document.getElementById('bitmapThreshold').value),
      strength:    parseInt(document.getElementById('edgeStrength').value),
      pixelSize:   parseInt(document.getElementById('pixelateSize').value),
      noiseAmount: parseInt(document.getElementById('noiseAmount').value),
    });

    history.push(canvas, `Filter: ${activeFilter.name}`);
    toast(`✓ ${activeFilter.name} applied`);
  });

  // Reset
  document.getElementById('resetFilterBtn')?.addEventListener('click', () => {
    if (!state.sourceImage) return;
    const canvas = document.getElementById('mainCanvas');
    const ctx    = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(state.sourceImage, 0, 0, canvas.width, canvas.height);
    activeFilter = null;
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    ['bitmapControls','edgeControls','pixelateControls','noiseControls'].forEach(id =>
      document.getElementById(id)?.classList.add('hidden')
    );
    toast('Filter reset');
  });
}

/** Call after image is loaded to populate previews */
export function rebuildFilterPreviews() {
  buildGroup(BITMAP_FILTERS,  'filterGridBitmap');
  buildGroup(COLOR_FILTERS,   'filterGridColor');
  buildGroup(TEXTURE_FILTERS, 'filterGridTexture');
}