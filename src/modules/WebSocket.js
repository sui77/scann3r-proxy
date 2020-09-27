const socketIo = require('socket.io');



class WebSocket {
    constructor(config, webserver) {
        this.config = config;
        this.registeredItems = config.registeredItems;
        this.io = socketIo(webserver, {path: '/ws'});
        this.initHandler();
    }

    initHandler() {
        this.io.on('connection', async (socket) => {

                console.log(`Connected: ${socket.handshake.address}`);

                socket.on('disconnect', () => {
                    console.log(`Disconnected: ${socket.handshake.address}`);
                    for (let n in this.registeredItems) {
                        if (socket.id == this.registeredItems[n].socket.id) {
                            delete this.registeredItems[n];
                        }
                    }
                });

                socket.getData = (uuid) => {
                    return new Promise((resolve, reject) => {
                        socket.emit('getData', uuid, (data) => {
                            resolve(data);
                        });
                    });
                };

                socket.putData = (uuid, size, chunk) => {
                    console.log(uuid, size);
                    socket.emit('putData', uuid, size, chunk);
                };

                socket.on('register', async (uuid, size, cb) => {
                    let item = {
                        uuid: uuid,
                        size: size,
                        socket: socket,
                        timeCreated: Math.round(new Date() / 1000),
                        status: 0,
                        ip: socket.handshake.address,
                    };
                    this.registeredItems[uuid] = item;
                    cb(null, {
                        url: this.config.baseUrl + uuid,
                        expires: this.config.expires
                    });
                });
            }
        );
    }
}

module.exports = WebSocket;