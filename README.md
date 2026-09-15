# KArsten

**How to Train Your Self-Printed Robot** — building a Berkeley Humanoid Lite from 3D-printed parts and
teaching it to walk with reinforcement learning.

A reveal.js presentation built on TNG's `tng-reveal-template`.

## Installation

You need to be in the TNG VPN to install, because `tng-reveal-template` is hosted on internal Bitbucket.

```bash
npm install        # dependencies
npm run build      # compile style/custom.less -> style/custom.css
```

## Running

```bash
npm start
```

Then open <http://localhost:8000> and pick **How to Train Your Self-Printed Robot**.

Press **S** during the presentation to open the speaker view (notes, next slide, timer) in a second
window — allow popups for `localhost:8000` if nothing appears.

## Printing

```bash
npm run print -- --presentation "How to Train Your Self-Printed Robot"
```

## Project Structure

```
.
├── config.json              # presentation metadata and slide order
├── presentation/
│   ├── karsten/             # the talk
│   ├── template/            # reference slides for the template's features
│   └── demos.html           # Python demo control
├── style/custom.less        # styling (compiled to custom.css)
├── img/karsten/             # images
├── img/posters/karsten/     # video poster frames
├── media/video/karsten/     # videos
└── input/                   # source deck the talk was extracted from (gitignored)
```

## Conventions

Slide structure, layout maths, transitions and the rules for working from the source deck are
documented in `CLAUDE.md`.
