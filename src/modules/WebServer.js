const http = require('http');

class WebServer {
    constructor(port, reg) {
        this.reg = reg;
        this.server = http.createServer(async (req, res) => {

                let name = req.url.replace(/^\//, '');

                if (typeof reg[name] != 'undefined' && reg[name].status== 0) {
                    reg[name].status = 1;
                    res.writeHead(200, {
                        'Content-Type': 'applicatoin/zip',
                        'Content-Disposition': 'attachment; filename=images.zip',
                        'Content-Length': reg[name].size
                    });
                    res.flushHeaders();
                    let byteCount = 0;
                    try {
                        let bytes = '';
                        do {
                            bytes = await reg[name].socket.getData();
                            res.write(bytes.buffer.slice(0, bytes.bytesRead));
                        } while (bytes.bytesRead > 0) ;
                        res.end();
                    } catch (e) {
                        console.log(e.message);
                        res.end();
                    }
                }else if (typeof reg[name] != 'undefined' && reg[name].status== 1) {
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