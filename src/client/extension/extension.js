const THEME_STORAGE_KEY = 'presentation-theme';

// Show the generated Overview slide once in the whole talk. The template gives every
// chapter its own copy of the chapter list; as soon as you have advanced off the first
// one into the chapter it introduces, all of them are taken out of the deck, so
// neither the later chapters nor stepping backwards lands on it again.
//
// This lives here rather than in config.json because the template renders index.html
// from its own package and only passes `title`, `description`, `authors`, `date`,
// `style.{charredTrail,autoFragment,footer}` and `names.overview` through to the page -
// there is no hook for an extra config key. `?overviewOnce=0` in the URL overrides the
// constant for one window, which is handy for rehearsing with the overviews left in.
const OVERVIEW_ONCE = true;

(function applySavedThemeEarly() {
    try {
        const saved = localStorage.getItem(THEME_STORAGE_KEY);
        const apply = () => {
            if (saved === 'light') {
                document.body.classList.add('light-mode');
            }
        };
        if (document.body) {
            apply();
        } else {
            document.addEventListener('DOMContentLoaded', apply, { once: true });
        }
    } catch (e) { /* localStorage may be unavailable */ }
})();

module.exports = {
    configure: function (Reveal, config) {
        updateFooter(Reveal);
        preventRevealKeyBindingsInPrompts(Reveal);
        startVideoOnClick();
        startVideoWithSpace(Reveal);
        loadParticlesConfig(Reveal);
        setupThemeToggle(Reveal);
        dropOverviewsOnceSeen(Reveal);
        syncAnnotationsToVideo(Reveal);


        return config;
    },

    configureCustomDependencies: function (Reveal, dependencies) {
        dependencies.push({src: 'socket.io/socket.io.js'});
        dependencies.push({src: 'node_modules/particles.js/particles.js'});
        dependencies.push({src: 'node_modules/qrcodejs2/qrcode.min.js'});
        dependencies.push({src: 'src/client/qr-generator.js'});
        dependencies.push({src: 'src/client/usd-viewer.js'});
        dependencies.push({
            src: 'src/client/plugin/demo-plugin.js', callback: function () {
                if (typeof io !== "undefined") {
                    const socket = io();
                    Reveal.Demos(socket);
                }
            }
        });

        // Extra JS file for the demos
        if (decodeURIComponent(window.location.pathname) === '/Demo Control.html') {
            dependencies.push({src: 'src/client/demo.js'});
        }

        return dependencies;
    }
};

const updateFooter = (Reveal) => {
    Reveal.addEventListener('ready', () => {
        if (document.querySelector('#alternative-footer') === null) {
            return;
        }

        document.querySelector('.footer').innerHTML =
            document.querySelector('#alternative-footer').innerHTML;
    });
};

const preventRevealKeyBindingsInPrompts = (Reveal) => {
    Reveal.addEventListener('ready', () => {
        [...document.getElementsByClassName('prompt')].forEach((inputField) => {
            inputField.addEventListener('keypress', (event) => {
                event.stopPropagation();
                return false;
            });
        });
    });
};

// Entering a slide only shows a video's poster frame. The first click starts it
// from its data-start, a click while it is running pauses it again. The listener
// lives on the document and matches the video under the click, so it also covers
// slides that the external slide loader puts into the DOM later.
const startVideoOnClick = () => {
    document.addEventListener('click', (event) => {
        const video = event.target.closest('video');
        if (!video) {
            return;
        }
        if (video.paused || video.ended) {
            const start = video.getAttribute('data-start');
            if (start !== null) {
                video.currentTime = start;
            }
            video.play().catch((error) => console.error('video play failed', error));
        } else {
            video.pause();
        }
    });
}

// Space plays the current slide's paused videos before reveal sees the key, so the
// first press starts the video and only the next one advances the deck. Everything
// else - no video on the slide, video already running, typing in an input, overview
// or speaker view open - falls through to reveal's own space = next.
const startVideoWithSpace = (Reveal) => {
    document.addEventListener('keydown', (event) => {
        if (event.key !== ' ') {
            return;
        }
        const target = event.target;
        if (target && (target.isContentEditable || /^(input|textarea|select|button)$/i.test(target.tagName))) {
            return;
        }
        if (Reveal.isOverview && Reveal.isOverview()) {
            return;
        }
        if (Reveal.isSpeakerNotes && Reveal.isSpeakerNotes()) {
            return;
        }
        const slide = Reveal.getCurrentSlide();
        if (!slide) {
            return;
        }
        const pausedVideos = Array.from(slide.getElementsByTagName('video'))
            .filter((video) => video.paused || video.ended);
        if (pausedVideos.length === 0) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        pausedVideos.forEach((video) => {
            const start = video.getAttribute('data-start');
            if (start !== null) {
                video.currentTime = start;
            }
            video.play().catch((error) => console.error('video play failed', error));
        });
    }, true);
}

// Marks positioned in percent of a video box only stay on their part while the camera
// holds still. An `.annotated` wrapper can name the second the shot changes with
// data-annotations-until="<seconds>"; its marks then fade out at that point and come
// back on their own when the clip loops. The class does the fading, so a paused or
// unplayed video (the PDF export, say) keeps its marks.
const syncAnnotationsToVideo = (Reveal) => {
    // 'ready' is the first point at which the externally loaded slide files are in
    // the DOM, so it is also the first point at which there is anything to find.
    Reveal.addEventListener('ready', () => {
        document.querySelectorAll('.annotated[data-annotations-until]').forEach((box) => {
            const video = box.querySelector('video');
            const until = parseFloat(box.getAttribute('data-annotations-until'));
            if (!video || isNaN(until)) {
                return;
            }

            const update = () => box.classList.toggle('annotations-hidden', video.currentTime >= until);

            // timeupdate carries playback; seeked catches the jump back to data-start
            // that starting a video with a click does.
            video.addEventListener('timeupdate', update);
            video.addEventListener('seeked', update);
            video.addEventListener('loadedmetadata', update);
            update();
        });
    });
};

const overviewOnceEnabled = () => {
    const search = window.location.search;

    // The printed deck keeps every overview - reveal drives the PDF export by walking
    // the slides, and pulling them out mid-walk would drop them from the export.
    if (/print-pdf/gi.test(search)) {
        return false;
    }

    const override = new URLSearchParams(search).get('overviewOnce');
    if (override !== null) {
        return override !== '0' && override !== 'false';
    }

    return OVERVIEW_ONCE;
};

const dropOverviewsOnceSeen = (Reveal) => {
    if (!overviewOnceEnabled()) {
        return;
    }

    Reveal.addEventListener('slidechanged', (event) => {
        const left = event.previousSlide;
        if (!left || !left.classList.contains('overview')) {
            return;
        }

        // Only a chapter's own overview, which the template puts inside the chapter's
        // stack. A data-before-overview section is a top-level slide instead, and
        // dropping one would shift the horizontal indices rather than the vertical.
        const stack = left.parentElement;
        if (!stack || stack.tagName !== 'SECTION') {
            return;
        }

        // Only once we have moved forward off the overview into the chapter it
        // introduces. Stepping back out of one has to leave the deck alone, otherwise
        // overshooting into the next chapter during a talk drops the chapter list
        // before it has actually been presented.
        if (event.currentSlide.parentElement !== stack) {
            return;
        }

        const indices = Reveal.getIndices();

        // Every chapter gets its own copy of the same chapter list, so dropping only
        // this one still walks you into the next chapter's copy. The list has now had
        // its one showing, so all of them go - the ones further down the deck too.
        document.querySelectorAll('.reveal .slides > section > section.overview')
            .forEach((overview) => {
                const owner = overview.parentElement;
                overview.remove();

                // An overview is its stack's first vertical slide, so whatever reveal
                // remembered about where we were in that stack is now one slide too far.
                const remembered = parseInt(owner.getAttribute('data-previous-indexv'), 10);
                if (!isNaN(remembered)) {
                    owner.setAttribute('data-previous-indexv', String(Math.max(0, remembered - 1)));
                }
            });

        // The Overview boundaries used to have slide-in/fade-out transitions for visual
        // distinction. Now that the overviews are gone, make those crossings plain
        // fades. The attributes sit on the slides inside each chapter stack (not on
        // the stack itself), and the deck's global fallback transition is a slide, so
        // they get an explicit `fade` rather than losing the attribute.
        document.querySelectorAll('.reveal .slides > section > section[data-transition]')
            .forEach((slide) => {
                if (slide.getAttribute('data-transition').includes('slide-')) {
                    slide.setAttribute('data-transition', 'fade');
                }
            });

        Reveal.sync();

        // Re-anchor on the slide we are already showing: reveal's own indexv still
        // counts the overview that was just taken out from under it. No section
        // changes past/present/future, so this fixes the index without a visible move.
        Reveal.slide(indices.h, Math.max(0, indices.v - 1));
    });
};

const loadParticlesConfig = (Reveal) => {
    Reveal.addEventListener('particles', () => {
        particlesJS.load('particles-js', 'particlesjs-config.json', function () {
            console.log('callback - particles.js config loaded');
        });
    });
};

const setupThemeToggle = (Reveal) => {
    Reveal.addEventListener('ready', () => {
        if (document.body.querySelector(':scope > .theme-toggle')) {
            return;
        }

        const button = document.createElement('button');
        button.className = 'theme-toggle not-printed';
        button.type = 'button';
        button.setAttribute('aria-label', 'Toggle light/dark mode');
        button.innerHTML = `
            <svg class="theme-toggle-icon-dark" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            <svg class="theme-toggle-icon-light" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
            </svg>
            <span class="theme-toggle-label"></span>
        `;

        const label = button.querySelector('.theme-toggle-label');
        const updateLabel = () => {
            label.textContent = document.body.classList.contains('light-mode') ? 'Dark' : 'Light';
        };
        updateLabel();

        const stop = (e) => e.stopPropagation();
        button.addEventListener('mousedown', stop);
        button.addEventListener('touchstart', stop);
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const isLight = document.body.classList.toggle('light-mode');
            try {
                localStorage.setItem(THEME_STORAGE_KEY, isLight ? 'light' : 'dark');
            } catch (err) { /* ignore */ }
            updateLabel();
        });

        document.body.appendChild(button);
    });
};
