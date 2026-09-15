# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a reveal.js-based presentation template for Innovation Hacking talks. It provides a starting point for creating professional presentations with integrated Python demos, custom styling, and support for multiple presentation variants.

## Architecture

### Server Architecture

The server is built on Express.js with Socket.IO for real-time communication:
- **src/server/server.js**: Main entry point that starts the server on port 8000
- **src/server/start-server.js**: Configures Express app, Socket.IO, and binds various servers (video streamer, markdown/HTML slides, static files)
- **src/server/demo-server.js**: Manages Python demo processes via Socket.IO, handles text/image output from demos
- **src/server/image-stream-server.js**: Streams images from demos to clients
- Uses `tng-reveal-template` (TNG's internal presentation template library) for core presentation functionality

### Demo System

Python demos are spawned as child processes and communicate via JSON over stdin/stdout:
- Demo configurations are defined in `config.json` under `pythonDemos`
- Each demo specifies an executable path relative to the demo directory
- Demos send JSON messages with `{text: "...", image: "...", status: "..."}` format to communicate with the server
- The server broadcasts demo output to all connected clients via Socket.IO
- The `demos/` directory is a git submodule pointing to an internal TNG repository (optional for basic presentations)

### Presentation Structure

- **presentation/*.html**: Individual slide files in HTML format
- **config.json**: Defines presentation metadata, slide ordering for different talk durations, and demo configurations
- Multiple presentation variants can be defined (e.g., "45min Version", "30min Version")
- Speakers are defined in presentation/00_title_and_speakers.html and closing_speaker_slide.html
- Slides are loaded dynamically by the template system based on configuration
- Each slide file contains `<section>` elements that become individual slides in reveal.js

## Common Development Commands

### Build and Run

```bash
# Install dependencies (requires TNG VPN access for tng-reveal-template)
npm install

# Build CSS from LESS
npm run build

# Start development server on port 8000
npm start
```

Then navigate to http://localhost:8000

### Publishing and Printing

```bash
# Publish presentation (configuration in package.json publicationSettings)
npm run publish

# Unpublish presentation
npm run unpublish

# Generate PDF version
npm run print -- --presentation "Main Presentation"
```

### Python Demo Setup (Optional)

The demos require Python 3.9 and CUDA 11.2:

```bash
# Initialize demo submodule
git submodule update --init --recursive
chmod -R 777 demos

# Create virtual environment and install dependencies
python3.9 -m venv demos/venv
source demos/venv/bin/activate
pip install -r demos/requirements.txt
```

## Customizing the Template

When helping users customize this template for their own presentations:

1. **Update config.json**: Change title, description, authors, date, and slide order
2. **Update package.json**: Change name and description to match the presentation
3. **Modify slides**: Update slide content in `presentation/` directory
4. **Add speaker images**: Place photos in `img/speaker/` and reference in speaker slides
5. **Create new slides**: Follow naming convention `##_topic.html` and add to config.json
6. **Update styles**: Modify `style/custom.less` and rebuild with `npm run build`

## Key Configuration Files

- **config.json**: Central configuration for presentation metadata, slides, and Python demos
- **package.json**: Node.js dependencies and npm scripts
- **style/custom.less**: LESS stylesheet (compiled to style/custom.css with `npm run build`)
- **particlesjs-config.json**: Configuration for particles.js background effects

## Slide Creation Guidelines

- Each HTML file should contain one or more `<section>` elements
- Use `<section>` nesting for vertical slide navigation
- Add `class="fragment"` to elements for progressive reveals
- Include `<aside class="notes">` for speaker notes
- Use `data-auto-animate` for smooth transitions between related slides
- Follow the numbered naming convention for proper ordering

### Slide Formatting Standard

**IMPORTANT**: All slides MUST follow this consistent structure for proper styling and presentation:

```html
<section data-transition="fade" data-transition-speed="fast">
    <h1>Slide Title</h1>
    <div class="content">
        <!-- All slide content goes here -->
        <p>Your content...</p>
        <ul>
            <li class="fragment">Bullet points</li>
        </ul>
        <!-- Videos, images, etc. -->
    </div>
    <aside class="notes">
        Speaker notes go here (outside content div)
    </aside>
</section>
```

**Key Rules**:
1. **One title per slide**: a single `<h1>`. Never an `<h1>` + `<h2>` pair, never `<h3>`.
   - Choose per slide between the generic chapter name and a specific title:
     - **Generic** ("Berkeley Humanoid Lite", "Sim2Real Gap") when the slide *is* the topic - a chapter opener or section divider
     - **Specific** ("Cable Management", "Backlash: Old vs. New") when the slide is about one detail
   - Keep titles to **~32 characters or fewer** so they stay on one line at the 110px `h1` size. Rewrite the title rather than let it wrap.
   - Repeating one title across a 2-3 slide build is good. Do not disambiguate with "... in Simulation" / "... in Reality" suffixes.
   - The chapter name is not lost - it lives in `data-title` on the wrapping `<section>` and drives the generated Overview slides.
   - The title slide is the exception: `h1` + `h2` there is a title and a subtitle, not two competing titles.
   - The older decks (`lets_dance`, `skill_issue`, `just_like_the_simulations`) still use `h1` + `h2`. CSS for one style must not disturb the other; `h1 + div.content` selects single-title slides only.

2. **Content wrapper**: ALL slide content MUST be wrapped in `<div class="content">`
   - This includes paragraphs, lists, images, videos, and all other content
   - Keep inline styles on the content div if needed for layout (e.g., `style="display: flex; ..."`)
   - Sources and fragment text should be inside the content div

3. **Clean markup**:
   - Do NOT use `<br>` tags for spacing - let CSS handle layout
   - Remove unnecessary inline styles like `width: 100%` or `max-height: 80vh` on wrapper divs
   - Keep layout-specific inline styles only where truly needed (flexbox, grid, etc.)

4. **Speaker notes**: Place `<aside class="notes">` AFTER the content div but inside the section

### Layout and Sizing

The reveal canvas is **1920 x 1080**. Derive sizes from that budget, do not guess, and measure real
media dimensions with `ffprobe` first.

- An `<h1>` occupies `60` (margin-top) + `110` (1em line) + `20` (margin-bottom) = **190px**
- The footer is fixed to the bottom **60px**
- So the band left for media on a single-title slide is **190 -> 1020 = 830px**
- `.content` is `content-box` with `padding: 10px`, so its declared `height` excludes that padding
- Deck standard: `margin-top: 30px; height: 730px` leaves a 60px optical gutter above and below
- Usable content box: **1630 x 730**, with a 60px gap between columns in `.content.split`

**Two-element (left/right) slides** must have both columns balanced:

- Two images: pin both to the same height, `H = min(730, (1630 - 60) / (aspect1 + aspect2))`
- Text + media: choose a middleground (~600px). Never let media run to full height beside a 400px text block.
- Always check the row fits: `col1 + 60 + col2 <= 1630`
- A `<figure>` is the flex child, not the media inside it. A `figcaption` in normal flow adds to the
  column height and breaks alignment - keep captions `position: absolute; top: 100%`.
- State which constraint was binding (width or height) when reporting a chosen size.

### Transitions

- **`fade` is the default** - in place, zero movement, with `data-transition-speed="fast"`
- **`slide` only at Overview boundaries**: first slide of a chapter gets `data-transition="slide-in fade-out"`,
  last slide gets `data-transition="fade-in slide-out"`
- Reveal splits a transition into an in-half and an out-half. Use that to get motion on both crossings,
  since Overview slides are template-generated and cannot carry attributes.
- `data-auto-animate` overrides transitions between its own members. Only use it when the two slides'
  media have the **same aspect ratio** - otherwise the element visibly flies across the slide.

### Image Annotations

Overlays (red crosses, dimension arrows) go in an `.annotated` wrapper that shrink-wraps the image, with
positions as **percentages of the image box** so they track it at any scale. Seed the percentages from the
source deck's own shape geometry and leave a comment naming the numbers to nudge.

### Working From a Source Deck (PPTX / PDF)

- **Content only - never copy the source's styling.** Background, fonts and colours come from this template.
- **Preserve emphasis exactly**: extract bold runs from the PPTX XML (`a:rPr/@b`) and reproduce them,
  including where the spaces fall inside the bold.
- **Keep list markers.** Both `list-style: none` and `display: flex` on a `<ul>` suppress `::marker`;
  neither belongs on a slide list.
- **Do not invent content** to fill a slide. Slides that are empty in the source stay empty, with the
  source's TODO preserved in the speaker notes.
- Hidden slides (`show="0"` in the slide XML) are excluded unless asked otherwise.
- Speaker notes from the source are preserved verbatim in `<aside class="notes">`.
- Videos: re-encode with ffmpeg (`-crf 25`, scale to 1920). Bake speed changes into the file
  (`setpts=PTS/N`) rather than scripting `playbackRate` - inline scripts in dynamically loaded slides
  are unreliable.
- Images carrying a PowerPoint `rot=` on the picture need physical rotation; the JPEG itself is unrotated.

### Working Agreements

- **Never run commands that reach the network or TNG-internal infrastructure.** No `ssh`, `git ls-remote`,
  `npm install`, `curl` to internal hosts, or starting the dev server. Write the commands out and let the
  user run them. Local offline work (file edits, `ffmpeg`, `pdftoppm`, `unzip`, `lessc`) is fine.
- **Assert on every scripted edit.** A `str.replace` that matches nothing fails silently, and an earlier
  edit may have changed the anchor text. Assert the match so the script aborts instead of reporting
  success for work that never happened.
- **Change only what was asked.** Restyling a list is not licence to drop its bullets.
- **Reason from measurements**, then report the numbers and which constraint was binding.

### Converting Agenda to Slide Files

When creating a new presentation from an `agenda.md` file, follow this systematic conversion process:

**Agenda Structure:**
```markdown
## Agenda

1. Chapter Name
   - Top-level bullet: Main point with optional details after colon
     - Sub-bullet: Additional detail
     - Sub-bullet: Another detail
   - Another top-level bullet
2. Next Chapter
   - More content...
```

**Conversion Rules:**

1. **Numbered sections → Chapter files**:
   - `1. Motivation & Intro` → `10_motivation.html`
   - `2. Robot Foundation Models` → `20_robot_foundation_models.html`
   - `3. Simulation` → `30_simulation.html`
   - Continue pattern: 10, 20, 30, 40, 50, etc.

2. **Top-level bullets → Individual slides**:
   - Each dash (`-`) at the first indentation level becomes a new `<section>` slide

3. **Bullet formatting → Slide structure**:
   - **If bullet has colon**: `- Why we built this: We love chess`
     - Text before colon → `<h2>Why we built this</h2>`
     - Text after colon → `<p>We love chess</p>` inside content div
   - **If no colon**: `- Let's talk about physics`
     - Entire text → `<h2>Let's talk about physics</h2>`
     - Empty content div (to be filled with actual content later)

4. **Sub-bullets → List items**:
   - Convert to `<ul><li>` structure inside content div
   - Do NOT add `class="fragment"` by default (add manually later if needed)
   - Preserve nesting structure for sub-sub-bullets

5. **Chapter consistency**:
   - The `<h1>` tag contains the chapter name (from numbered section)
   - Same `<h1>` used for ALL slides within that chapter file
   - Example: All slides in `10_motivation.html` have `<h1>Motivation & Intro</h1>`

**Example Conversion:**

```markdown
1. Motivation & Intro
   - Why we built this: We love chess, but we don't want to move our arms.
     - we are nerds that don't work out
     - chess pieces are just too damn heavy
```

Becomes:

```html
<html lang="en">
<section data-title="Motivation & Intro">
<section>
    <h1>Motivation & Intro</h1>
    <h2>Why we built this</h2>
    <div class="content">
        <p>We love chess, but we don't want to move our arms.</p>
        <ul>
            <li>we are nerds that don't work out</li>
            <li>chess pieces are just too damn heavy</li>
        </ul>
    </div>
</section>
</section>
</html>
```

**Process:**
1. Read the `agenda.md` file completely
2. Identify all numbered sections (chapters)
3. For each chapter, create a new HTML file
4. Convert each top-level bullet to a slide
5. Apply the slide formatting standard to all generated slides
6. **Add all slide files to `config.json`** under the appropriate presentation name
7. Review and add speaker notes, fragments, or special formatting as needed

**Important**: After creating the slide files, always update `config.json` to include them in the presentation's slide array. Order should be:
- `00_title_and_speakers.html`
- `10_...html`, `20_...html`, `30_...html`, etc. (in numeric order)
- `closing_speaker_slide.html`

### Asset Paths

**IMPORTANT**: All asset paths (images, videos, media) MUST use absolute paths starting with `/`:
- Use `/img/` for all images (e.g., `/img/speaker/photo.png`, `/img/style/logo.svg`)
- Use `/media/` for all media files (e.g., `/media/video/demo.mp4`)
- Use `/img/posters/` for video poster images
- **NEVER** use relative paths like `../img/` or `../../media/`

This ensures assets work correctly across all presentation variants and subdirectories.

### Embedding Videos

When adding video files to slides, use this standard format that works properly with reveal.js:

```html
<video preload="none" data-start="0" muted loop data-id="video" poster="/img/posters/FILENAME_poster.jpeg">
    <source src="/media/video/FILENAME.mp4" type="video/mp4">
    Your browser does not support the video tag.
</video>
```

Key attributes:
- `preload="none"` - Prevents preloading the video until the slide is active
- `data-start="0"` - Sets the start time for the video
- `muted` - Videos start muted (required for autoplay in most browsers)
- `loop` - Videos loop automatically
- `data-id="video"` - Identifier for reveal.js animations
- `poster="/img/posters/..."` - Poster image to show before video loads (use absolute path)
- Do NOT include `width`, `height`, or `controls` attributes - let CSS handle sizing

Video files should be placed in `media/video/` directory. Poster images should be placed in `img/posters/` directory.

## Important Notes

- The `tng-reveal-template` dependency is hosted on TNG's internal Bitbucket and requires VPN access
- The demos submodule also requires access to TNG's internal Bitbucket (optional for basic presentations)
- Demo communication protocol: Python scripts should output JSON lines with `text`, `image`, or `status` fields
- The server expects demos to be in `demos/` directory and uses `demos/venv/bin/python` as the Python executable
- Presentations can be run without Python demos by simply not starting any demos via the demo control interface
