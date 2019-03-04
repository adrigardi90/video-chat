const config = require('./../config')
const events = require('./events.js')

// Socket namespace
let namespace;

// When connecting
const onConnection = (socket) => {

    // Listening for joining a room
    socket.on('joinRoom', events.joinRoom(socket, namespace));

    // Listening for new public messages
    socket.on('publicMessage', events.publicMessage(namespace))

    // Leave room
    socket.on('leaveRoom', events.leaveRoom(socket, namespace))

    // Listening for private chats
    socket.on('joinPrivateRoom', events.joinPrivateRoom(socket, namespace));

    // Leave private chat
    socket.on('leavePrivateRoom', events.leavePrivateRoom(socket, namespace))

    // Private message listener
    socket.on('privateMessage', events.privateMessage(namespace))

    // Private message for Signaling PeerConnection
    socket.on('privateMessagePCSignaling', events.privateMessagePCSignaling(namespace))

}

exports.createNameSpace = (io) => {
    namespace = io
    namespace
        // .of(config.CHAT_NAMESPACE)
        .on('connection', onConnection)
}