const WebServer = require('./modules/WebServer.js');
const WebSocket = require('./modules/WebSocket.js');

const reg = {

};

(async () => {
    const webServer = new WebServer(808, reg);
    const webSocket = new WebSocket(webServer.getServer(), reg);
})();