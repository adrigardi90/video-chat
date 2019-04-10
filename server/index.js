const http = require('http');
const redis = require('socket.io-redis');

const app = require('./app')
const config = require('./config')

// Server
const server = http.createServer(app);

// Atach server to the socket
app.io.attach(server)

// Using the adapter to pass event between nodes
app.io.adapter(redis({ host: config.REDIS_HOST, port: config.REDIS_PORT }));

server.listen(config.PORT, () => {
    console.log(`Server Listening on port ${config.PORT}`)
});
