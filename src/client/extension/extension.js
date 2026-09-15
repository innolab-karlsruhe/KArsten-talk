const THEME_STORAGE_KEY = 'presentation-theme';

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
        autoStartVideo(Reveal);
        loadParticlesConfig(Reveal);
        setupThemeToggle(Reveal);


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

const autoStartVideo = (Reveal) => {
    Reveal.addEventListener('slidechanged', function (event) {
        const videoTags = Array.prototype.slice.call(event.currentSlide.getElementsByTagName('video'));
        videoTags.forEach(function (tag) {
            if (window === window.top) {
                tag.play();
                if (tag.getAttribute('data-start') !== null) {
                    tag.currentTime = tag.getAttribute('data-start');
                }
            }
        });
    });
}
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
