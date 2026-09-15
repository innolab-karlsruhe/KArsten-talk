
const events = require('events');

function imageStreamServer(socket, streamName) {

    const clients = [];
    const streamClients = [];

    const eventEmitter = new events.EventEmitter();

    initialize();

    function initialize() {
        socket.on('connection', function (client) {
            addClient(client);

            client.on(streamName + ':start', function (processConfiguration) {
                eventEmitter.emit('start', processConfiguration);
            });

            client.on(streamName + ':stop', function () {
                eventEmitter.emit('stop');
            });

            client.on(streamName + ':configure', function (configuration) {
                eventEmitter.emit('configure', configuration);
            });

            client.on(streamName + ':text_input', function (data) {
                eventEmitter.emit('text_input', data);
            });

            client.on(streamName + ':command', function (data) {
                eventEmitter.emit('command', data);
            });

            client.on(streamName + ':register_stream_client', function () {
                streamClients.push(client);
            });

            client.on('disconnect', function () {
                removeClient(client);
            });
        });
    }

    function addClient(client) {
        clients.push(client);
        eventEmitter.emit('new_client', client);
    }

    function removeClient(client) {
        removeClientFrom(clients, client);
        removeClientFrom(streamClients, client);
    }

    function removeClientFrom(clientList, client) {
        const index = clientList.indexOf(client);
        if (index !== -1) {
            clientList.splice(index, 1);
        }
    }

    function on(eventName, eventHandler) {
        eventEmitter.on(eventName, eventHandler);
    }

    function sendToAllClients(eventName, data) {
        for (let i = 0; i < clients.length; i++) {
            sendToClient(clients[i], eventName, data);
        }
    }

    function sendToStreamClients(eventName, data) {
        for (let i = 0; i < streamClients.length; i++) {
            sendToClient(streamClients[i], eventName, data);
        }
    }

    function sendToClient(client, eventName, data) {
        client.emit(streamName + ':' + eventName, data)
    }

    return {
        on: on,
        sendToAllClients: sendToAllClients,
        sendToStreamClients : sendToStreamClients,
        sendToClient: sendToClient
    };
}

module.exports = imageStreamServer;
