const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http');
const server = http.createServer(app);
const cors = require('cors');
const io = require('socket.io')(server);

const users = {
    general: [

    ],
    sports: [

    ]
};

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
    socket.on('joinRoom', ({ username, room }) => {
        console.log(`user ${username} wants to join the room ${room}`);

        // Join the room
        socket.join(room, () => {
            console.log(`user ${username} joined the room ${room}`);

            // push user for the suitable ROOM!!!
            users[room].push({ username: username })

            // Notify all the users in the same room
            io.sockets.in(room).emit('newUser', users[room]);
        });

    });

    // Listening for new public messages
    socket.on('publicMessage', ({ room, message, username }) => {
        io.sockets.in(room).emit('newMessage', {
            message,
            username
        });
    })

    // Leave room
    socket.on('leaveRoom', ({ room, username }) => {
        console.log(`user ${username} wants to leave the room ${room}`);

        socket.leave(room, () => {
            console.log(`user ${username} left the room ${room}`);

            let usersRoom = users[room]
            // delete user from the suitable array
            usersRoom = usersRoom.filter((user) => (user.username !== username))

            // Notify all the users in the same room
            io.sockets.in(room).emit('newUser', usersRoom);
        })
    })

    // Listening for private chats
    socket.on('joinPrivateRoom', ({ username, room, to }) => {
        console.log(`user ${username} wants to have a private chat with ${to}`);

        // Join the room
        socket.join(to, () => {

            if (room !== null) {
                // Notify the user to talk with (in the same main room)
                io.sockets.in(room).emit('privateChat', {
                    username,
                    to
                });
            }
        });
    });

    // Leave private chat
    socket.on('leavePrivateRoom', ({ room, from, to }) => {
        console.log(`user ${from} wants to leave the private chat with ${room}`);

        io.to(room).emit('leavePrivateRoom', {
            to,
            privateMessage: `${from} has closed the chat`,
            from,
            room
        })

        socket.leave(room, () => {
            console.log(`user ${from} left the private chat with ${room}`);
        })
    })

    // Private message listener
    socket.on('privateMessage', ({ privateMessage, to, from, room }) => {
        console.log(`User ${from} wants sends a message to ${to}`);

        // Private message to the user
        io.to(room).emit('privateMessage', { to, privateMessage, from, room })
    })
})

server.listen(PORT, () => console.log(`Server Listening on port ${PORT}`));