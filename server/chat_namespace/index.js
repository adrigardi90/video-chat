const events = require('./events.js')
const config = require('./../config')

// Socket namespace
let namespace;

// When connecting
const onConnection = (socket) => {

    console.log(`Socket connected to port ${config.PORT}`)
    
    // Listening for joining a room
    socket.on('joinRoom', events.joinRoom(socket, namespace));

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

}

exports.createNameSpace = (io) => {
    namespace = io
    namespace
        // .of(config.CHAT_NAMESPACE)
        .on('connection', onConnection)
}