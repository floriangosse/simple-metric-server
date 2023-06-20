import http from 'node:http';
import url from 'node:url';
import EventEmitter from 'node:events';

export function startServer({ name, port }) {
    const template = `
        <html>
            <head>
                <title>${name}</title>
                <style>
                    * { box-sizing: border-box; }
                    html, body { margin: 0; padding: 0; }
                    body {
                        display: flex;
                        height: 100%;
                        width: 100%;
                        justify-content: center;
                        align-items: center;
                        font-family: sans-serif;
                        color: #4b4b4b;
                    }
                    .metric__label {
                        margin-bottom: 0.3em;
                        font-size: 3vw;
                        text-align: center;
                        color: #505050;
                    }
                    .metric__value {
                        font-size: 8vw;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <div class="metric">
                    <div class="metric__label">${name}</div>
                    <div class="metric__value">&ndash;</div>
                </div>
                <script>
                    const metricElement = document.getElementsByClassName('metric__value')[0];
                    const source = new EventSource('/events');
                    source.onmessage = function(e) {
                        metricElement.innerText = e.data
                    };
                </script>
            </bod>
        </html>
    `;

    const channel = createChannel();

    const server = http.createServer((request, response) => {
        const { pathname } = url.parse(request.url);

        if (pathname === '/') {
            response.writeHead(200, {
                'Content-Type': 'text/html'
            });
            response.end(template);
        } else if (pathname === '/events') {
            response.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keepalive'
            });
            response.write('\n');

            const unsubscribe = channel.subscribe((metric) => {
                response.write(`data: ${metric}\n\n`);
            });

            request.on('close', () => unsubscribe());
        } else {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            response.end('Not found');
        }
    });

    server.listen(port);

    return {
        update: channel.update
    };
}

function createChannel() {
    const emitter = new EventEmitter();

    const subscribe = (callback) => {
        emitter.on('value', callback);

        return () => {
            emitter.removeListener('value', callback);
        };
    };

    const update = (value) => {
        emitter.emit('value', value);
    };

    return {
        subscribe,
        update
    };
}

