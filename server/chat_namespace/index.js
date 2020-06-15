const events = require('./events.js')
const config = require('./../config')
const ChatRedis = require('../redis')

// Socket namespace
let namespace

// When connecting
const onConnection = (socket) => {
    console.log(`Socket connected to port ${config.PORT}`)
    let userRoom, userName

    // Listening for joining a room
    socket.on('joinRoom', ({ username, room, status }) => {
        console.log(`User ${username} wants to join the room ${room}`)

        // Join the room
        socket.join(room, async () => {
            console.log(`User ${username} joined the room ${room}`)
            // We implement here the listener to save the room where the user is
            userRoom = room
            userName = username

            try {
                // add user for the suitable ROOM
                await ChatRedis.addUser(room, userName, { username, status, privateChat: false, conference: false })
                const users = await ChatRedis.getUsers(room)
                // Notify all the users in the same room
                namespace.in(room).emit('newUser', { users, username })
            } catch (error) {
                console.log(error)
            }
        })

    })

    // Listening for new public messages
    socket.on('publicMessage', events.publicMessage(namespace))
    socket.on('conferenceInvitation', events.conferenceInvitation(namespace))
    // Leave room
    socket.on('leaveRoom', events.leaveRoom(socket, namespace))
    // Leave room
    socket.on('leaveChat', events.leaveChat(socket, namespace))
    // Listening for private chats
    socket.on('joinPrivateRoom', events.joinPrivateRoom(socket, namespace))
    socket.on('joinConference', events.joinConference(socket, namespace))
    // Leave private chat
    socket.on('leavePrivateRoom', events.leavePrivateRoom(socket, namespace))
    socket.on('leaveConference', events.leaveConference(socket, namespace))
    // Private message listener
    socket.on('privateMessage', events.privateMessage(namespace))
    // Private message for Signaling PeerConnection
    socket.on('privateMessagePCSignaling', events.privateMessagePCSignaling(namespace))
    socket.on('PCSignalingConference', events.PCSignalingConference(namespace))
    // Set status
    socket.on('changeStatus', events.changeStatus(socket, namespace))

    // Disconnect
    socket.on('disconnect', async () => {
        console.log(`User "${userName}" with socket ${socket.id} disconnected`)
        try {
            await ChatRedis.delUser(userName, config.KEY)
            events.leaveChat(socket, namespace)({
                room: userRoom,
                username: userName
            })
        } catch (error) {
            console.log(error)
        }
    })

}

exports.createNameSpace = (io) => {
    exports.io = io
    namespace = io
        .of(config.CHAT_NAMESPACE)
        .on('connection', onConnection)
}