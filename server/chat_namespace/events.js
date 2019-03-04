const users = {
    general: [

    ],
    sports: [

    ]
};


const joinRoom = (socket, namespace) => ({ username, room }) => {
    console.log(`user ${username} wants to join the room ${room}`);

    // Join the room
    socket.join(room, () => {
        console.log(`user ${username} joined the room ${room}`);

        // push user for the suitable ROOM!!!
        users[room].push({ username: username })

        // Notify all the users in the same room
        namespace.sockets.in(room).emit('newUser', users[room]);
    });

}

const publicMessage = (namespace) => ({ room, message, username }) => {
    namespace.sockets.in(room).emit('newMessage', {
        message,
        username
    });
}

const leaveRoom = (socket, namespace) => ({ room, username }) => {
    console.log(`user ${username} wants to leave the room ${room}`);

    socket.leave(room, () => {
        console.log(`user ${username} left the room ${room}`);

        let usersRoom = users[room]
        // delete user from the suitable array
        usersRoom = usersRoom.filter((user) => (user.username !== username))

        // Notify all the users in the same room
        namespace.sockets.in(room).emit('newUser', usersRoom);
    })
}

const joinPrivateRoom = (socket, namespace) => ({ username, room, to }) => {
    console.log(`user ${username} wants to have a private chat with ${to}`);

    // Join the room
    socket.join(to, () => {

        if (room !== null) {
            // Notify the user to talk with (in the same main room)
            namespace.sockets.in(room).emit('privateChat', {
                username,
                to
            });
        }
    });
}

const leavePrivateRoom = (socket, namespace) => ({ room, from, to }) => {
    console.log(`user ${from} wants to leave the private chat with ${room}`);

    namespace.to(room).emit('leavePrivateRoom', {
        to,
        privateMessage: `${from} has closed the chat`,
        from,
        room
    })

    socket.leave(room, () => {
        console.log(`user ${from} left the private chat with ${room}`);
    })
}

const privateMessage = (namespace) => ({ privateMessage, to, from, room }) => {
    console.log(`User ${from} wants sends a message to ${to}`);

    // Private message to the user
    namespace.to(room).emit('privateMessage', { to, privateMessage, from, room })
}

const privateMessagePCSignaling = (namespace) => ({ desc, to, from, room }) => {
    console.log(`User ${from} sends an offer ${to}`);

    // Private signaling to the user
    namespace.to(room).emit('privateMessagePCSignaling', { desc, to, from })
}

module.exports = {
    joinRoom,
    publicMessage,
    leaveRoom,
    joinPrivateRoom,
    leavePrivateRoom,
    privateMessage,
    privateMessagePCSignaling
}