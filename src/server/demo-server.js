const imageStreamServer = require('./image-stream-server');

const textGenerator = require('./generate-text');
const elizaBot = require('./generate-eliza-text');

const killProcess = require("./kill-process");
const childProcess = require("child_process");

const config = require('../../config.json');

const appendingDemos = ['eliza-demo', 'gpt3-demo', 'eliza-vs-gpt3-demo'];
const processBasedTextDemos = ['example-text-demo'];

const fs = require('fs');
const axios = require('axios')

const stabilityAiHost = 'https://api.stability.ai';
const stableDiffusionXlEngineId = 'stable-diffusion-xl-beta-v2-2-2';

async function timeout(time) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}

function useSocketIoServer(socket) {
    let server = imageStreamServer(socket, 'demos');

    let currentProcess = null;
    let currentTextFromProcess = '';
    let currentDemoId = null;
    let currentTextInput = 'Start Typing...';
    let currentTextOutput = '';
    let currentSpeechFile = undefined;
    let currentImageFile = undefined;

    initialize();

    function initialize() {
        server.on('new_client', updateClientInformation);
        server.on('start', startDemo);
        server.on('configure', configureDemo);
        server.on('stop', stopDemo);
        server.on('text_input', updateTextInput);
        server.on('command', processCommand);
    }

    function startDemo(demoConfiguration) {
        if (currentDemoId !== null) {
            stopDemo();
        }
        currentDemoId = demoConfiguration.demoId;

        initializeDemo();

        server.sendToAllClients("process_started");
        updateAllClientsInformation();
    }

    function initializeDemo() {
        if (currentDemoId === 'eliza-demo') {
            currentTextOutput = `Eliza: ${elizaBot.initialize()}\n`;
        }
        if (currentDemoId === 'eliza-vs-gpt3-demo') {
            const input = elizaBot.initialize();
            currentTextOutput = `Eliza: ${input}\n`;

            elizaVsGxpt3Demo(input).then();
        }

        if (config.pythonDemos[currentDemoId]) {
            const demoConfig = config.pythonDemos[currentDemoId];

            const processOptions = [
                '-u', demoConfig.executable
            ];

            currentProcess = childProcess.spawn(config.pythonDemos["python-executable"], processOptions, {
                cwd: config.pythonDemos["demo-directory"],
                shell: true
            });

            currentProcess.on('exit', onProcessExit);
            currentProcess.stdout.on('data', onDataFromProcess);
            currentProcess.stderr.on('data', onProcessError);
        } else {
            console.log(currentDemoId + " is not defined in config.json!")
        }
    }

    function onProcessExit() {
        stopDemo();
    }

    function onDataFromProcess(dataText) {
        try {
            currentTextFromProcess += dataText.toString().trim();
            //currentTextFromProcess = currentTextFromProcess.slice(0, currentTextFromProcess.lastIndexOf('}'))
            messages = currentTextFromProcess.split(/\n/)
            for (message in messages) {
                currentTextFromProcess = messages[message]
                if (dataText[dataText.length - 1] === 10) {

                    const data = JSON.parse(currentTextFromProcess);


                    if (data.image) {
                        sendImage(data.image);
                    }
                    if (data.text) {
                        console.log("message contains text")
                        updateTextOutput(data.text);
                    }
                    if (data.status) {
                        console.log(data.status)
                    }
                    currentTextFromProcess = "";

                }
            }


        } catch (e) {
            currentTextFromProcess = "";
            console.log(e)
        }

    }

    function sendImage(imageData) {
        server.sendToStreamClients('image', {
            currentDemoId: currentDemoId,
            currentImageFile: imageData
        });
    }

    function onProcessError(error) {
        console.log(error.toString());
    }

    function configureDemo(data) {
        sendToChildProcess(data);
    }


    function sendToChildProcess(data) {
        currentProcess?.stdin?.write(`${JSON.stringify(data)}\n`);
    }

    function stopDemo() {
        killProcess(currentProcess);

        currentProcess = null;
        currentDemoId = null;
        currentTextInput = '';
        currentTextOutput = '';
        currentSpeechFile = undefined;
        currentImageFile = undefined;

        server.sendToAllClients('process_stopped');
        updateAllClientsInformation();
    }

    function updateTextInput(data) {
        currentTextInput = data.currentTextInput;
        updateAllClientsInformation();
    }

    function processCommand(data) {
        if (data.type === 'create-output') {
            if (!appendingDemos.includes(currentDemoId)) {
                currentTextOutput = 'Calculating ...';
            }
            sendCommandToProcess({text: currentTextInput});
            updateAllClientsInformation();
        }
    }

    function sendCommandToProcess(data) {
        if (currentDemoId === 'eliza-demo') {
            const input = currentTextInput;
            updateTextOutput(`You: ${currentTextInput}\n`)
            elizaDemo(input).then((text) => updateTextOutput(`Eliza: ${text}\n`));
        } else if (currentDemoId === 'gpt3-demo') {
            const input = currentTextInput;
            updateTextOutput(`You: ${currentTextInput}\n`)
            gpt3Demo(input).then((text) => updateTextOutput(`GPT3: ${text.trim()}\n`));
        } else if (currentDemoId === 'sdxl-demo') {
            sdxlDemo().then(updateImageOutput);
        } else {
            processBasedTextDemo(currentTextInput);
        }
    }

    async function gpt3Demo(input) {
        return await textGenerator.issueCommand(`Reply to the following input: ${input}`, 50);
    }

    async function sdxlDemo() {
        return await createImageUsingStableDiffusionXl(
            `demo-image-1`,
            currentTextInput,
        );
    }

    async function createImageUsingStableDiffusionXl( fileBaseName, term) {

        const imageData = await createStableDiffusionXlImageOnServer('sk-A6QHB24CGeDmUwfFSFPfsJV9gkH5hse0EO7MMBNyxMVyFSPu', term);
        const buffer = Buffer.from(imageData, 'base64');
        fs.writeFileSync("img.jpeg", buffer);
        return "img.jpeg";
    };

    const createStableDiffusionXlImageOnServer = async (
        token,
        term
    ) => {
        try {
            const response = await axios.post(
                `${stabilityAiHost}/v1/generation/${stableDiffusionXlEngineId}/text-to-image`,
                {
                    text_prompts: [{text: term}],
                    cfg_scale: 7,
                    clip_guidance_preset: 'FAST_BLUE',
                    height: 512,
                    width: 768,
                    samples: 1,
                    steps: 50,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'Accept-Encoding': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    maxContentLength: 100000000,
                    maxBodyLength: 1000000000,
                }
            );

            const data = response.data;
            return data.artifacts[0].base64;
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    async function elizaDemo(input) {
        return elizaBot.generateResponseFor(input);
    }

    function processBasedTextDemo(input) {
        sendToChildProcess({'text': input});
    }

    async function elizaVsGpt3Demo(input) {
        while (currentDemoId === 'eliza-vs-gpt3-demo') {
            input = (await textGenerator.issueCommand(`Reply to the following input: ${input}`, 20)).trim();
            updateTextOutput(`GPT3: ${input}\n`);
            await timeout(5000);

            input = elizaBot.generateResponseFor(input);
            updateTextOutput(`Eliza: ${input}\n`);
            await timeout(3000);
        }
    }

    function updateTextOutput(data) {
        if (appendingDemos.includes(currentDemoId)) {
            currentTextOutput += data;
            currentTextInput = '';
        } else {
            currentTextOutput = data;
        }
        updateAllClientsInformation();
    }

    function updateImageOutput(data) {
        currentTextOutput = '';
        currentImageFile = data;
        updateAllClientsInformation();
    }

    function updateAllClientsInformation() {
        server.sendToAllClients('status', getCurrentStatus());

        // The speech file should only be sent once
        currentSpeechFile = undefined;
    }

    function updateClientInformation(client) {
        server.sendToClient(client, 'status', getCurrentStatus());
    }

    function getCurrentStatus() {
        return {
            processStarted: currentDemoId !== null,
            currentDemoId: currentDemoId,
            currentTextInput: currentTextInput,
            currentTextOutput: currentTextOutput,
            currentSpeechFile: currentSpeechFile,
            currentImageFile: currentImageFile
        };
    }
}

module.exports = {
    useSocketIoServer: useSocketIoServer
};