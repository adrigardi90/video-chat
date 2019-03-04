const app = require('./app')
const http = require('http');
const config = require('./config')

// Server
const server = http.createServer(app);

// Atach server to the socket
app.io.attach(server)

server.listen(config.PORT, () => {
    console.log(`Server Listening on port ${config.PORT}`)
});

