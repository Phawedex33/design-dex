/* ============================================================
   app.js — Design Dex
   Core init · Global state · Tool switching · Utilities
   Entry point — imported as type="module" in index.html
   ============================================================ */

import { history }              from './history.js';
import { initUpload, handleFile } from './upload.js';
import { initFilters, rebuildFilterPreviews } from './filters.js';
import { initFragment }         from './fragment.js';
import { initAdjust }           from './adjust.js';
import { initBackground }       from './background.js';
import { initText }             from './text.js';
import { initCrop }             from './crop.js';
import { initExport }           from './export.js';

/* ── Global State ───────────────────────────────────────────── */
export const state = {
  sourceImage:  null,   // original HTMLImageElement
  sourceIsVideo: false,
  fileName:     '',
  activeTool:   'fragment',
};

/* ── Toast ──────────────────────────────────────────────────── */
export function toast(msg, duration = 2800) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), duration);
}

/* ── Render image to canvas ─────────────────────────────────── */
export function renderToCanvas(img) {
  const canvas   = document.getElementById('mainCanvas');
  const area     = document.getElementById('canvasArea');
  const maxW     = area.clientWidth  - 48;
  const maxH     = area.clientHeight - 48;
  const scale    = Math.min(maxW / img.width, maxH / img.height, 1);

  canvas.width  = Math.round(img.width  * scale);
  canvas.height = Math.round(img.height * scale);

  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/* ── Tool switching ─────────────────────────────────────────── */
function setActiveTool(tool) {
  state.activeTool = tool;

  document.querySelectorAll('.tool-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('[data-tool]').forEach(b => b.classList.remove('active'));

  document.getElementById(`panel-${tool}`)?.classList.add('active');
  document.querySelectorAll(`[data-tool="${tool}"]`)
    .forEach(b => b.classList.add('active'));

  // Rebuild filter previews lazily when switching to filters
  if (tool === 'filters' && state.sourceImage) {
    rebuildFilterPreviews();
  }
}

/* ── Undo / Redo ────────────────────────────────────────────── */
function setupUndoRedo() {
  const canvas = document.getElementById('mainCanvas');

  const undo = () => { if (history.undo(canvas)) toast('↩ Undo'); };
  const redo = () => { if (history.redo(canvas)) toast('↪ Redo'); };

  document.getElementById('undoBtn')?.addEventListener('click', undo);
  document.getElementById('redoBtn')?.addEventListener('click', redo);
  document.getElementById('undoBtnPanel')?.addEventListener('click', undo);
  document.getElementById('redoBtnPanel')?.addEventListener('click', redo);
  document.getElementById('clearHistoryBtn')?.addEventListener('click', () => {
    history.clear();
    toast('History cleared');
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z') { e.preventDefault(); undo(); }
      if (e.key === 'y') { e.preventDefault(); redo(); }
    }
  });
}

/* ── Dock button reset (undo to original) ───────────────────── */
function setupResetBtn() {
  // The ↩ dock button already wired to undo above.
  // Double-click the upload ring to reset everything.
  document.getElementById('uploadRing')?.addEventListener('dblclick', () => {
    if (state.sourceImage) {
      renderToCanvas(state.sourceImage);
      history.clear();
      toast('Reset to original');
    }
  });
}

/* ── Init ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  // Wire tool buttons (header pills + dock)
  document.querySelectorAll('[data-tool]').forEach(el => {
    el.addEventListener('click', () => setActiveTool(el.dataset.tool));
  });

  // Init all modules
  initUpload();
  initFilters();
  initFragment();
  initAdjust();
  initBackground();
  initText();
  initCrop();
  initExport();
  setupUndoRedo();
  setupResetBtn();

  toast('👋 Welcome to Design Dex — upload an image to begin');
});