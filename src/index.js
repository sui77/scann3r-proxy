const WebServer = require('./modules/WebServer.js');
const WebSocket = require('./modules/WebSocket.js');

const config = {
    httpPort: 809,
    baseUrl: 'http://mc.sui.li:809/',
    expires: 60*3,                           // 3 minutes availabe for download
    expiresResponse: 60*60*24*2,             // 2 days available to receive response
    registeredItems: {}
};

(async () => {
    const webServer = new WebServer(config);
    const webSocket = new WebSocket(config, webServer.getServer());
    setInterval( maintenance, 1000);
})();

function maintenance() {
    console.log('maintenance');
    let time = Math.round(new Date() / 1000);
    for (n in config.registeredItems) {
        let item = config.registeredItems[n];
        if (item.status == 0 && (item.timeCreated + config.expires < time)) {
            item.socket.emit('expired', item.uuid);
        } else if (item.status == 1 && (item.timeCreated + config.expiresResponse < time)) {
            item.socket.emit('expired', item.uuid);
        }
        console.log( item.timeCreated + " " + item.status );
    }
}