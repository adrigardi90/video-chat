const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http');
const server = http.createServer(app);
const cors = require('cors');
const io = require('socket.io')(server);

const users = [];

const PORT = 3000;

app.use(cors())

app.use(bodyParser.json());

// Middleware
app.use((req, res, next) => {
    console.log('Time: ', Date.now());
    next();
});

// SocketIO connection with channels
io.on('connection', (socket) => {

    // Listening for joining a room
    socket.on('joinRoom', ({username, room}) => {
        console.log(`user ${username} wants to join the room ${room}`);

        // Join the room
        socket.join(room, () => {
            console.log(`user ${username} joined the room ${room}`);

            // push user for the suitable ROOM!!!
            users.push({ username: username })

            // Notify all the users in the same room
            io.sockets.in(room).emit('newUser', users);
        });

    });

    // Listening for new public messages
    socket.on('publicMessage', ({ room, message, username }) => {
        io.sockets.in(room).emit('newMessage', {
            message,
            username
        });
    })

    socket.on('leaveRoom', ({room, username}) => {
        socket.leave(room, () => {
            // delete user from the suitable array
        })
    })

    //private message
    //io.to(data.room).emit('newUser', data);
})

server.listen(PORT, () => console.log(`Server Listening on port ${PORT}`));