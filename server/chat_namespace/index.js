const events = require('./events.js')
const config = require('./../config')
const ChatRedis = require('../redis')

// Socket namespace
let namespace;

// When connecting
const onConnection = (socket) => {

    console.log(`Socket connected to port ${config.PORT}`)

    let userRoom

    // Listening for joining a room
    socket.on('joinRoom', ({ username, room, status }) => {
        console.log(`user ${username} wants to join the room ${room}`);
    
        // Join the room
        socket.join(room, () => {
            console.log(`user ${username} joined the room ${room}`);
            // We implement here the listener to save the room where the user is
            userRoom = room
    
            // add user for the suitable ROOM
            ChatRedis.addUser(room, socket.id, {
                username,
                status,
                privateChat: false
            })
    
            ChatRedis.getUsers(room).then(users => {
                if (users === null) return
    
                // Notify all the users in the same room
                namespace.in(room).emit('newUser', { users, username });
            })
        });
    
    });

    // Listening for new public messages
    socket.on('publicMessage', events.publicMessage(namespace))

    // Leave room
    socket.on('leaveRoom', events.leaveRoom(socket, namespace))

    // Leave room
    socket.on('leaveChat', events.leaveChat(socket, namespace))

    // Listening for private chats
    socket.on('joinPrivateRoom', events.joinPrivateRoom(socket, namespace));

    // Leave private chat
    socket.on('leavePrivateRoom', events.leavePrivateRoom(socket, namespace))

    // Private message listener
    socket.on('privateMessage', events.privateMessage(namespace))

    // Private message for Signaling PeerConnection
    socket.on('privateMessagePCSignaling', events.privateMessagePCSignaling(namespace))

    // Set status
    socket.on('changeStatus', events.changeStatus(socket, namespace))

    // Disconnect
    socket.on('disconnect', () => {
        console.log(`Socket ${socket.id} disconnected`);
        ChatRedis.getUser(userRoom, socket.id).then( user => {
            events.leaveChat(socket, namespace)({
                room: userRoom,
                username: user.username
            })
        })
    })

}

exports.createNameSpace = (io) => {
    namespace = io
        .of(config.CHAT_NAMESPACE)
        .on('connection', onConnection)
}