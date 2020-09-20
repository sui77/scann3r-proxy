const socketIo = require('socket.io');

class WebSocket {
    constructor(webserver, reg) {
        this.reg = reg;
        this.io = socketIo(webserver, {path: '/ws'});
        this.initHandler();
    }

    initHandler() {
        this.io.on('connection', async (socket) => {

                console.log('Connection...');

                socket.on('disconnect', () => {

                });

                socket.getData = () => {
                    return new Promise((resolve, reject) => {
                        socket.emit('getData', (data) => {
                            resolve(data);
                        });
                    });
                };

                socket.on('register', async (data, cb) => {
                    console.log('reg: ', data.uuid);
                    this.reg[data.uuid] = {
                        socket: socket,
                        status: 0,
                        size: data.size
                    };
                    cb(
                        {
                            url: 'http://mc.sui.li:807/' + data.uuid,
                        }
                    );
                });

            }
        );

    }
}

module.exports = WebSocket;