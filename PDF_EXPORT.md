# PDF Export - PDF2PPT Conversion

This document describes how to export any presentation from this repo as a PDF and convert it to a powerpoint !not compatible with videos!.

## Prerequisites

- The dev server must be running (`npm start`)
- `npx` is available (comes with Node.js / npm)
- No additional installation required — `decktape` runs via `npx`

## Available Presentations and Their URLs

| Presentation | URL |
|---|---|
| Let's Dance! | `http://localhost:8000/Let's%20Dance!.html` |
| Skill Issue | `http://localhost:8000/Skill%20Issue.html` |
| Just like the Simulations | `http://localhost:8000/Just%20like%20the%20Simulations.html` |

> The URL for each presentation is `http://localhost:8000/<NAME>.html` where `<NAME>` matches the key in `config.json` under `slides`, URL-encoded.

## Dark Mode Export (default)

```bash
npx decktape reveal "http://localhost:8000/Let's%20Dance\!.html" lets_dance.pdf --size 1920x1080
```

Replace the URL and output filename for other presentations. The export navigates every slide
(including fragments) and takes roughly 2–4 minutes for a 100-slide deck.

## Light Mode Export

Light mode is controlled by the CSS class `body.light-mode`. There is no URL parameter to enable
it, so the simplest approach is to temporarily add the class to the HTML template.

### Step 1 — Patch the template

Open `node_modules/tng-reveal-template/index.html` and find line 20:

```html
<body class="${style.charredTrail ? 'charred': ''} ${style.autoFragment ? 'auto-fragment': ''} ${style.footer ? 'with-footer': ''}">
```

Add `light-mode ` at the start of the class string:

```html
<body class="light-mode ${style.charredTrail ? 'charred': ''} ${style.autoFragment ? 'auto-fragment': ''} ${style.footer ? 'with-footer': ''}">
```

The server serves the template dynamically — no restart needed. Verify by opening the presentation
URL in a browser: it should look light.

### Step 2 — Export

```bash
npx decktape reveal "http://localhost:8000/Let's%20Dance\!.html" lets_dance_light.pdf --size 1920x1080
```

### Step 3 — Revert the patch

Remove `light-mode ` from the body class in `node_modules/tng-reveal-template/index.html`.

> `node_modules/` is not committed to git, so this only affects your local environment.

## Options

| Flag | Description | Example |
|---|---|---|
| `--size` | Viewport in pixels | `--size 1920x1080` |
| `--pause` | Milliseconds to wait between slides (default: 1000) | `--pause 2000` |
| `--slides` | Export only a subset of slides | `--slides 1-10,15` |
| `--screenshots` | Also save each slide as a PNG image | `--screenshots` |
| `--screenshots-directory` | Output folder for screenshots | `--screenshots-directory out/` |

## Troubleshooting

**Output is only 1 slide or very small file**
The URL is wrong. Make sure you use the direct presentation HTML URL
(`/Let's%20Dance!.html`), not the index page or a query-parameter variant.

**Export hangs on a slide**
A video may be blocking. Add `--pause 3000` to give videos more time to settle,
or check that all `<video>` tags have `preload="none"`.

**Light mode is not applied**
Check that `body.light-mode` appears in the served HTML:
```bash
curl -s "http://localhost:8000/Let's%20Dance!.html" | grep 'body class'
```
The output should contain `light-mode`.

## PDF to Powerpoint ##
```bash
# Install the core PDF rendering library
brew install poppler

# Install directly from the GitHub repository URL
uv tool install git+https://github.com/dnvriend/pdf-to-pptx-tool.git

# convert your presentation
pdf-to-pptx-tool convert my_report.pdf presentation.pptx
```
