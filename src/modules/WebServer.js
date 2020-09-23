const http = require('http');

class WebServer {
    constructor(port, reg) {
        this.reg = reg;
        this.server = http.createServer(async (req, res) => {
                const {method, url} = req;
                let name = url.replace(/^\//, '');
                console.log(name, method);

                req.on('data', (chunk) => {
                    console.log("DATA", typeof this.socket);
                    if (this.socket != null) {
                        console.log('PUTCHUNK');
                        this.socket.putData(chunk);
                    }
                    res.end();
                });
                req.on('end', function () {
                    console.log("END");
                    if (this.socket != null) {
                        this.socket.emit('done');
                    }
                });


                if (typeof reg[name] != 'undefined' && method == "GET" && reg[name].status == 0) {
                    reg[name].status = 1;
                    res.writeHead(200, {
                        'Content-Type': 'application/zip',
                        'Content-Disposition': 'attachment; filename=images.zip',
                        'Content-Length': reg[name].size,
                        'X-Forwarded-For': reg[name].ip,
                    });
                //    res.flushHeaders();
                    let byteCount = 0;
                    try {
                        let bytes = '';
                        do {
                            bytes = await reg[name].socket.getData();
                            console.log('BYTES READ', bytes.bytesRead);
                            await res.write(bytes.buffer.slice(0, bytes.bytesRead));
                            console.log("written");
                        } while (bytes.bytesRead > 0) ;

                        res.end();
                    } catch (e) {
                        console.log(e.message);
                        res.end();
                    }
                } else if (typeof reg[name] != 'undefined' && method == "PUT" && reg[name].status == 1) {
                    reg[name].status = 2;
                    this.socket =  reg[name].socket;
                    console.log(name, typeof reg[name].socket.putData);
                    console.log("POST");
                } else if (typeof reg[name] != 'undefined' && reg[name].status >= 2) {
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
        ).listen(port);
    }

    getServer() {
        return this.server;
    }
}

module.exports = WebServer;