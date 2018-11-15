const meow = require('meow');
const readline = require('readline');
const { startServer } = require('./');

const cli = meow(`
    Usage
        $ simple-metric-server

    Options
        --port  Port of the web server
        --name  Name of the metric

    Examples
        $ watch-metric | simple-metric-server --port 8080 --name "User count"
`, {
    flags: {
        port: {
            type: 'string'
        },
        name: {
            type: 'string'
        }
    }
});

if (isNaN(cli.flags.port)) {
    console.error(`Missing or wrong value for option 'port'`);
    cli.showHelp();
}
if (!cli.flags.name) {
    console.log(`Missing value for option 'name'`);
    cli.showHelp();
}

const options = {
    port: parseInt(cli.flags.port),
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