#!/usr/bin/env node

import readline from 'node:readline';
import getPort from 'get-port';
import meow from 'meow';
import { startServer } from './index.js';

const cli = meow(
    `
    Usage
        $ simple-metric-server

    Options
        --port  Port of the web server
        --name  Name of the metric

    Examples
        $ watch-metric | simple-metric-server --port 8080 --name "User count"
`,
    {
        importMeta: import.meta,
        flags: {
            port: {
                type: 'string'
            },
            name: {
                type: 'string'
            }
        }
    }
);

if (!!cli.flags.port && isNaN(cli.flags.port)) {
    console.error(`Invalid value for option 'port'`);
    cli.showHelp();
}
if (!cli.flags.name) {
    console.log(`Missing value for option 'name'`);
    cli.showHelp();
}

const options = {
    port: !!cli.flags.port ? parseInt(cli.flags.port) : await getPort({ port: 8080 }),
    name: cli.flags.name
};

const server = startServer(options);

console.log(`Server is running at:`);
console.log();
console.log(`    http://localhost:${options.port}`);
console.log();

const rl = readline.createInterface({
    input: process.stdin
});
rl.on('line', (input) => {
    server.update(input);
});
