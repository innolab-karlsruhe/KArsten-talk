(function () {

    const forEach = (elements, action) => [...elements].forEach(action);

    const streamName = 'demos';

    let processStarted = false;
    let currentDemoId = "";

    let messages = "";

    let socket = null;

    function initialize() {
        socket = io();

        registerSocketListeners(socket);
        registerEventListeners(socket);
        setInterval(updateNotes, 100);
    }

    function registerSocketListeners(socket) {
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on(streamName + ':status', onStatus);
        socket.on(streamName + ':event', onEvent);
        socket.on(streamName + ':process_started', onProcessStarted);
        socket.on(streamName + ':process_stopped', onProcessStopped);
    }

    function registerEventListeners(socket) {
        window.addEventListener('click', function (e) {
            const target = e.target;
            if (target.className === 'start-demo-process') {
                socket.emit(streamName + ':start', configureDemo(target));
            } else if (target.className === 'stop-demo-process') {
                socket.emit(streamName + ':stop');
            } else if (target.className === 'configure-demo-process') {
                socket.emit(streamName + ':configure', configureDemo(target));
            } else if (target.className === 'create-output') {
                socket.emit(streamName + ':command', {type: 'create-output'});
            }
        });

        const element = document.getElementById('text-input');
        element.addEventListener('change', () => {
            socket.emit(streamName + ':text_input', {currentDemoId: currentDemoId, currentTextInput: element.value});
        });
    }

    function configureDemo(element) {
        let configurationData = JSON.parse(element.getAttribute('data-config'));
        configurationData.process = element.getAttribute('data-process');
        configurationData.demoId = element.getAttribute('data-demo-id');

        return configurationData;
    }

    function updateNotes() {
        forEach(document.getElementsByClassName('start-demo-process'),
            (element) => element.disabled = processStarted);
        forEach(document.getElementsByClassName('configure-demo-process'),
            (element) => element.disabled = !processStarted);
        forEach(document.getElementsByClassName('stop-demo-process'),
            (element) => element.disabled = !processStarted);
        forEach(document.getElementsByClassName('create-output'),
            (element) => element.disabled = !processStarted);
        forEach(document.getElementsByClassName('demo-progress'),
            (element) => element.value = messages);

        document.getElementById('text-input').disabled = currentDemoId === '';
    }

    function setInputText(text) {
        document.getElementById('text-input').value = text;
    }

    function onConnect() {
        socket.emit(streamName + ':register_stream_client');
    }

    function onDisconnect() {
        console.log('disconnect');
    }

    function onProcessStarted() {
        processStarted = true;
    }

    function onProcessStopped() {
        setInputText('');

        currentDemoId = '';
        processStarted = false;
    }

    function onStatus(data) {
        processStarted = data.processStarted;
        currentDemoId = data.currentDemoId;

        setInputText(data.currentTextInput);
        messages += JSON.stringify(data) + '\n';
    }

    function onEvent(data) {
        messages += JSON.stringify(data)
            .replace(/["{}]/g, "")
            .replace("type:", "")
            .replace(/,/g, ", ")
            .replace(/:/g, ": ")
            .replace(/_/g, " ") + '\n';
    }

    Reveal.addEventListener('ready', initialize);
})();