const express = require('express');
const http = require('http');
const path = require('path');

const socketIo = require('socket.io');

const { createStaticWebServer } = require('tng-reveal-template/src/server/static-file-server');
const { bindVideoStreamer } = require('tng-reveal-template/src/server/video-streamer');
const { bindMarkdownSlides } = require('tng-reveal-template/src/server/markdown-server');
const { bindHtmlSlides } = require('tng-reveal-template/src/server/html-server');
const { createTemplateWebServer } = require('tng-reveal-template/src/server/template-server');

const demoServer = require('./demo-server');

const startServer = (serverOptions, callback) => {
    const port = serverOptions.port;
    const serverPath = serverOptions.path || process.cwd();

    const serverMainDirectory = path.resolve(serverPath);
    process.chdir(serverMainDirectory);

    const app = express();
    const server = http.createServer(app);

    const socket = new socketIo.Server(server);
    demoServer.useSocketIoServer(socket);
    bindVideoStreamer(app, serverPath);
    createTemplateWebServer(app, serverMainDirectory);
    bindMarkdownSlides(app, serverMainDirectory);
    bindHtmlSlides(app, serverMainDirectory);
    createStaticWebServer(app, serverMainDirectory);


    server.listen(port, () => {
        console.log(`Server listening on localhost:8000`);
        if (typeof callback === 'function') {
            callback(server);
        }
    });
    return app;
};

module.exports = {
    startServer: startServer
};
