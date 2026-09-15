// 3D model viewer widget.
//
// Renders any `<div class="3d" model="/path/to/model.(usd|usdz|glb|gltf)">` into an
// interactive three.js scene: the model auto-spins and can be orbited with the mouse.
// The loader is picked from the file extension (USD vs glTF).
// Follows the same scan-and-enhance pattern as qr-generator.js, and is registered
// via configureCustomDependencies() in src/client/extension/extension.js.
//
// three.js is vendored from node_modules (offline-safe). Its examples/jsm modules
// import the bare specifier `three`, so we inject an import map that resolves it to
// the vendored build before performing our own dynamic imports.
(function () {
    const THREE_BUILD = '/node_modules/three/build/three.module.js';
    const THREE_JSM = '/node_modules/three/examples/jsm';

    function ensureImportMap() {
        if (document.querySelector('script[type="importmap"]')) {
            return;
        }
        const script = document.createElement('script');
        script.type = 'importmap';
        script.textContent = JSON.stringify({ imports: { three: THREE_BUILD } });
        (document.head || document.documentElement).appendChild(script);
    }

    // Lazily load three.js + controls once, caching the promise so repeated mounts
    // reuse the same modules.
    let threePromise = null;
    function ensureThree() {
        if (threePromise) {
            return threePromise;
        }
        ensureImportMap();
        threePromise = (async () => {
            const THREE = await import(THREE_BUILD);
            const { OrbitControls } = await import(`${THREE_JSM}/controls/OrbitControls.js`);
            const { RoomEnvironment } = await import(`${THREE_JSM}/environments/RoomEnvironment.js`);
            return { THREE, OrbitControls, RoomEnvironment };
        })();
        return threePromise;
    }

    // Pick a loader class from the file extension, importing (and caching) only the
    // loader module actually needed. USD is Z-up, glTF is Y-up.
    const loaderCache = {};
    function loadLoaderClass(ext) {
        if (loaderCache[ext]) {
            return loaderCache[ext];
        }
        let promise;
        if (ext === 'glb' || ext === 'gltf') {
            promise = import(`${THREE_JSM}/loaders/GLTFLoader.js`).then((m) => m.GLTFLoader);
        } else {
            promise = import(`${THREE_JSM}/loaders/USDLoader.js`)
                .then((m) => m.USDLoader)
                .catch(() => import(`${THREE_JSM}/loaders/USDZLoader.js`).then((m) => m.USDZLoader));
        }
        loaderCache[ext] = promise;
        return promise;
    }

    const mounted = new WeakSet();

    async function mount(container) {
        if (mounted.has(container)) {
            return;
        }
        mounted.add(container);

        const url = (container.getAttribute('model') || '').trim();
        if (!url) {
            console.warn('[usd-viewer] div.3d has no model attribute', container);
            return;
        }

        // Divs collapse without content; give the canvas something to fill — but only
        // when the author gave no explicit sizing. clientHeight is unreliable here:
        // viewers mount for every slide on Reveal 'ready'/'slidechanged', and a slide
        // that isn't currently shown is display:none, so clientHeight is 0 even for an
        // explicitly-sized div. Keying off inline style avoids clobbering that size.
        if (!container.style.height && !container.style.minHeight) {
            container.style.display = 'block';
            container.style.width = '100%';
            container.style.minHeight = '60vh';
        }

        const ext = url.split(/[?#]/)[0].split('.').pop().toLowerCase();
        const isUsd = ext.startsWith('usd');
        const { THREE, OrbitControls, RoomEnvironment } = await ensureThree();
        const Loader = await loadLoaderClass(ext);

        const scene = new THREE.Scene();
        // Keep the near/far range tight around the (normalized ~1.5-unit) model. A huge
        // near/far ratio wastes depth-buffer precision and causes z-fighting; the model
        // is scaled to ~1.5 units and the camera is clamped to maxDistance 10.
        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        // Metallic PBR materials show their surroundings via reflections, not diffuse
        // light, so they need an environment map to look lit. Generate a synthetic
        // neutral room (no HDR asset needed) and use it as the scene environment.
        const pmrem = new THREE.PMREMGenerator(renderer);
        scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.01).texture;


        // Directional lights are parented to the camera so they orbit with the view.
        // Otherwise, as the camera auto-rotates around the model, the world-fixed lit
        // side sweeps across it and the lights look like they spin with the model.
        scene.add(camera);
        const key = new THREE.DirectionalLight(0xffffff, 1.2);
        key.position.set(3, 4, 2);
        camera.add(key);
        camera.add(key.target);
        const fill = new THREE.DirectionalLight(0xffddaa, 1.4);
        fill.position.set(-3, 2, -1);
        camera.add(fill);
        camera.add(fill.target);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.2;
        controls.enablePan = false;
        controls.minDistance = 0.5;
        controls.maxDistance = 10;

        camera.position.set(2, 1.5, 2);
        controls.target.set(0, 0, 0);
        controls.update();

        const pivot = new THREE.Group();
        scene.add(pivot);

        const loader = new Loader();
        loader.load(url, (result) => {
            const model = result.isObject3D ? result : (result.scene || result);
            // USD is Z-up; rotate into three.js's Y-up world. glTF is already Y-up.
            if (isUsd) {
                model.rotation.x = -Math.PI / 2;
            }
            pivot.add(model);

            // Physics/robotics USD ships collision geometry (purpose="guide") that
            // overlaps the visual meshes and z-fights with it. Drop those meshes so
            // only the visuals render (and so they don't skew the bounding-box fit).
            const collisionMeshes = [];
            model.traverse((o) => {
                if (o.isMesh && /collision/i.test(o.name)) {
                    collisionMeshes.push(o);
                }
            });
            collisionMeshes.forEach((o) => o.removeFromParent());

            // Clamp metalness so fully-metallic materials don't read as pure mirrors.
            const MAX_METALNESS = 0.3;
            model.traverse((o) => {
                if (!o.isMesh || !o.material) {
                    return;
                }
                const materials = Array.isArray(o.material) ? o.material : [o.material];
                materials.forEach((m) => {
                    if (typeof m.metalness === 'number') {
                        m.metalness = Math.min(m.metalness, MAX_METALNESS);
                    }
                });
            });

            let box = new THREE.Box3().setFromObject(pivot);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            if (!isFinite(maxDim) || maxDim === 0) {
                console.warn('[usd-viewer] empty/degenerate bounding box for', url);
                return;
            }

            const targetSize = 1.5;
            pivot.scale.setScalar(targetSize / maxDim);
            box = new THREE.Box3().setFromObject(pivot);
            const center = box.getCenter(new THREE.Vector3());
            pivot.position.sub(center);

            pivot.traverse((o) => {
                if (o.isMesh && !o.material) {
                    o.material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.3, roughness: 0.6 });
                }
            });
        }, undefined, (err) => {
            console.error('[usd-viewer] failed to load', url, err);
        });

        const resize = () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            if (w === 0 || h === 0) {
                return;
            }
            // updateStyle=true so three sets the canvas CSS size to w×h. With false,
            // the canvas keeps its device-pixel buffer size (w×devicePixelRatio) as its
            // layout size, making it render at 2× the div on Retina displays.
            renderer.setSize(w, h, true);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        };
        resize();
        new ResizeObserver(resize).observe(container);

        // Only render while the containing slide is visible.
        let raf = 0;
        let active = false;
        const tick = () => {
            if (!active) {
                return;
            }
            controls.update();
            renderer.render(scene, camera);
            raf = requestAnimationFrame(tick);
        };
        const isVisible = () => {
            const section = container.closest('section');
            return !section || section.classList.contains('present');
        };
        const sync = () => {
            const visible = isVisible();
            if (visible && !active) {
                active = true;
                resize();
                tick();
            } else if (!visible && active) {
                active = false;
                cancelAnimationFrame(raf);
            }
        };
        sync();
        if (typeof Reveal !== 'undefined' && typeof Reveal.addEventListener === 'function') {
            Reveal.addEventListener('slidechanged', sync);
        }
    }

    function renderViewers() {
        // A class starting with a digit isn't a valid bare CSS selector, so match on
        // the attribute and filter by class instead of querying `div.3d`.
        document.querySelectorAll('div[model]').forEach((el) => {
            if (el.classList.contains('3d')) {
                mount(el);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderViewers, { once: true });
    } else {
        renderViewers();
    }

    if (typeof Reveal !== 'undefined' && typeof Reveal.addEventListener === 'function') {
        Reveal.addEventListener('ready', renderViewers);
        Reveal.addEventListener('slidechanged', renderViewers);
    }
})();
