const socketIo = require('socket.io');



class WebSocket {
    constructor(webserver, reg) {
        this.reg = reg;
        this.io = socketIo(webserver, {path: '/ws'});
        this.initHandler();
    }

    initHandler() {
        this.io.on('connection', async (socket) => {

                console.log(`Connected: ${socket.handshake.address}`);

                socket.on('disconnect', () => {
                    console.log(`Disconnected: ${socket.handshake.address}`);
                    delete this.reg[ socket.uuid ];
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
                        timeCreated: new Date() / 1000,
                        status: 0,
                        ip: socket.handshake.address,
                    };
                    this.reg[uuid] = item;
                    cb( null,
                        {
                            url: 'http://mc.sui.li:808/' + uuid,
                            expires: 60*3
                        }
                    );
                });
            }
        );

    }
}

module.exports = WebSocket;