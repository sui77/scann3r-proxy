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

                socket.getData = () => {
                    return new Promise((resolve, reject) => {
                        socket.emit('getData', (data) => {
                            resolve(data);
                        });
                    });
                };

                socket.putData = (chunk) => {
                        socket.emit('putData', chunk);
                };

                socket.on('register', async (data, cb) => {
                    console.log('reg: ', data);
                    socket.uuid = data.uuid;
                    data.status = 0;
                    data.socket = socket;
                    data.ip = socket.handshake.address;
                    this.reg[data.uuid] = data;
                    cb( null,
                        {
                            url: 'http://mc.sui.li:808/' + data.uuid,
                        }
                    );
                });

            }
        );

    }
}

module.exports = WebSocket;