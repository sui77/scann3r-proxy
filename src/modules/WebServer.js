const http = require('http');

class WebServer {
    constructor(config, reg) {
        const registeredItems = config.registeredItems;
        this.server = http.createServer(async (req, res) => {
                const {method, url, headers } = req;
                let uuid = url.replace(/^\//, '');

                req.on('data', (chunk) => {
                    console.log("DATA", typeof req.wsocket, headers['content-length']);
                    if (req.wsocket != null) {
                        console.log('PUTCHUNK');
                        req.wsocket.putData(uuid, headers['content-length'], chunk);
                    }
                    res.end();
                });

                req.on('end', function () {
                    console.log("END");
                    if (req.wsocket != null) {
                        req.wsocket.emit('done', uuid);
                    }
                });


                if (typeof registeredItems[uuid] != 'undefined' && method == "GET" && registeredItems[uuid].status == 0) {
                    registeredItems[uuid].status = 1;
                    res.writeHead(200, {
                        'Content-Type': 'application/zip',
                        'Content-Disposition': 'attachment; filename=images.zip',
                        'Content-Length': registeredItems[uuid].size,
                        'X-Forwarded-For': registeredItems[uuid].ip,
                    });
                    res.flushHeaders();
                    let byteCount = 0;
                    try {
                        let bytes = '';
                        do {
                            bytes = await registeredItems[uuid].socket.getData(uuid);
                            console.log('BYTES READ', bytes.bytesRead);
                            await res.write(bytes.buffer.slice(0, bytes.bytesRead));
                            console.log("written");
                        } while (bytes.bytesRead > 0) ;

                        res.end();
                    } catch (e) {
                        console.log(e.message);
                        res.end();
                    }
                } else if (typeof registeredItems[uuid] != 'undefined' && method == "PUT" && registeredItems[uuid].status == 1) {
                    registeredItems[uuid].status = 2;
                    req.wsocket =  registeredItems[uuid].socket;

                    console.log(uuid, typeof registeredItems[uuid].socket.putData);
                    console.log("POST");
                } else if (typeof registeredItems[uuid] != 'undefined' && registeredItems[uuid].status >= 2) {
                    res.statusCode = 410;
                    res.setHeader('Content-Type', 'text/html');
                    res.write("410 Gone (This download was available only once.)\n");
                    res.end();
                } else {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'text/html');
                    res.write("404 not found\n");
                    res.end();
                }
            }
        ).listen(config.httpPort);
    }

    getServer() {
        return this.server;
    }
}

module.exports = WebServer;