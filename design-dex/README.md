# design-dex


A futuristic, in-browser image and video editor built with vanilla JavaScript and Canvas API.

## Features

- **Puzzle Fragmentor** — Break images into puzzle pieces with 6 styles (Classic, Wavy, Sharp, Round, Diamond, Random)
- **Filters** — Grayscale, Invert, Bitmap/Threshold, Edge Detection (Sobel), Emboss, Pixelate, Noise, Sharpen, Sepia & more
- **Adjustments** — Brightness, Contrast, Exposure, Saturation, Hue, Temperature, Blur, Vignette
- **Background Swap** — Replace background with colour, gradient, image or video
- **Background Removal** — AI-powered in-browser background removal (no API key needed)
- **Text Overlay** — Add custom text with font, size, colour and position controls
- **Crop & Resize** — Freeform crop and resize to custom or preset dimensions
- ↩**Undo/Redo** — Full history stack with keyboard shortcuts
- ⬇**Export** — Download as PNG or export puzzle pieces as ZIP

## Tech Stack

- Vanilla JavaScript (ES6+)
- HTML5 Canvas API
- [@imgly/background-removal](https://github.com/imgly/background-removal-js) — in-browser AI background removal
- [JSZip](https://stuk.github.io/jszip/) — client-side ZIP generation
- Inspired by [tui.image-editor](https://github.com/nhn/tui.image-editor)

## Getting Started

```bash
git clone https://github.com/Phawedex33/Design-dex.git
cd Design-dex
```

Then open `index.html` in your browser — or use VS Code **Live Server** for hot reload.

## Project Structure

```
design-dex/
├── index.html          ← App shell & markup
├── css/
│   ├── main.css        ← Variables, reset, typography
│   ├── layout.css      ← Grid, header, dock, panels
│   └── components.css  ← Buttons, cards, sliders, chips
├── js/
│   ├── app.js          ← Core init & global state
│   ├── upload.js       ← File upload & drag/drop
│   ├── filters.js      ← All filter algorithms
│   ├── fragment.js     ← Puzzle fragmentor
│   ├── adjust.js       ← Image adjustments
│   ├── background.js   ← Background swap tool
│   ├── text.js         ← Text overlay tool
│   ├── crop.js         ← Crop & resize tool
│   ├── history.js      ← Undo/redo stack
│   └── export.js       ← Download & ZIP export
└── lib/
    └── jszip.min.js    ← Bundled JSZip
```

## Commits

Each feature is committed separately for a clean git history.

## License

MIT