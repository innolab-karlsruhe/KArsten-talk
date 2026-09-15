(function () {

    const streamName = 'demos';

    Reveal.Demos = function (socket) {
        let currentDemoId = "";

        function initialize() {
            registerSocketListeners();
            registerSlideListeners();
        }

        function registerSlideListeners() {
            if (typeof Reveal === 'undefined' ||
                typeof Reveal.addEventListener !== 'function') {
                return;
            }
            Reveal.addEventListener('slidechanged', applyCurrentSlideMode);
        }

        function applyCurrentSlideMode(event) {
            if (!inMainSlideWindow()) {
                return;
            }
            const slide = event && event.currentSlide
                ? event.currentSlide
                : (typeof Reveal.getCurrentSlide === 'function' ? Reveal.getCurrentSlide() : null);
            if (!slide) return;
            const mode = slide.getAttribute('data-demo-mode');
            const demoId = slide.getAttribute('data-demo-id') || slide.id;
            if (!mode || !demoId) return;
            socket.emit(streamName + ':configure', {demoId: demoId, mode: mode});
        }

        function registerSocketListeners() {
            socket.on('connect', onConnect);
            socket.on('disconnect', onDisconnect);
            socket.on(streamName + ':status', onStatus);
            socket.on(streamName + ':text_input', onTextInput);
            socket.on(streamName + ':image', onImage);
        }

        function onConnect() {
            if (inMainSlideWindow()) {
                socket.emit(streamName + ':register_stream_client');
            }
        }

        function inMainSlideWindow() {
            return window.top === window && decodeURIComponent(window.location.pathname) !== '/Demo Control.html';
        }

        function onDisconnect() {
            console.log('disconnect');
        }

        function onStatus(data) {
            const wasRunning = currentDemoId !== '' && currentDemoId !== null;
            currentDemoId = data.currentDemoId;
            const isNowRunning = currentDemoId !== '' && currentDemoId !== null;

            setInputText(data);
            setOutputText(data);
            setOutputImage(data);
            playSpeechFile(data);

            if (!wasRunning && isNowRunning) {
                applyCurrentSlideMode();
            }
        }

        function onTextInput(data) {
            setInputText(data);
        }

        function demoTargetSelector(demoId, childSelector) {
            return `#${demoId} ${childSelector}, [data-demo-id="${demoId}"] ${childSelector}`;
        }

        function setInputText(data) {
            if (data.currentDemoId !== '') {
                document.querySelectorAll(demoTargetSelector(data.currentDemoId, '.text-input')).forEach(element => {
                    setElementText(element, data.currentTextInput);
                });
            }
        }

        function setOutputText(data) {
            if (data.currentDemoId !== '') {
                document.querySelectorAll(demoTargetSelector(data.currentDemoId, '.text-output')).forEach(element => {
                    setElementText(element, data.currentTextOutput);
                });
            }
        }

        function setElementText(element, value) {
            if (element.tagName.toLowerCase() === 'textarea' ||
                element.tagName.toLowerCase() === 'input') {
                element.value = value;
            } else {
                element.innerHTML = value;
            }

            if (element.tagName.toLowerCase() === 'textarea') {
                element.scrollTop = element.scrollHeight;
            }
        }

        function onImage(data) {
            setOutputImage(data);
        }

        function setOutputImage(data) {
            if (data.currentDemoId !== '' && typeof data.currentImageFile !== 'undefined') {
                document.querySelectorAll(demoTargetSelector(data.currentDemoId, '.image-output')).forEach(element => {
                    element.setAttribute('src', data.currentImageFile);
                });
            }
        }

        function playSpeechFile(data) {
            if (typeof data.currentSpeechFile !== 'undefined' && shouldPlayAudioFile()) {
                const audio = new Audio(data.currentSpeechFile);
                audio.play().then();
            }
        }

        function shouldPlayAudioFile() {
            // The audio file should not be played in the speaker notes neither in demo control
            return window === window.top && window.location.pathname !== '/Demo-Control.html';
        }

        initialize();
    };
}());