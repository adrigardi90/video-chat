
const ChatRedis = require('../redis')

const changeStatus = (socket, namespace) => async ({ username, status, room }) => {
    console.log(`User "${username}" wants to change his status to ${status}`)

    try {
        const user = await ChatRedis.getUser(room, username)
        await ChatRedis.setUser(room, username, { ...user, status })
        const users = await ChatRedis.getUsers(room)
        // Notify all the users in the same room
        namespace.in(room).emit('newUser', { users, username })
    } catch (error) {
        console.log(error)
    }
}

const publicMessage = (namespace) => ({ room, message, username }) => {
    namespace.in(room).emit('newMessage', { message, username })
}

const conferenceInvitation = (namespace) => async ({ room, to, from }) => {
    console.log(`Conference - Invitation from "${from}" to "${to}" in room ${room}`)
    try {
        const { privateChat, conference } = await ChatRedis.getUser(room, to)
        // User already talking
        if (privateChat || conference) {
            console.log(`Conference - User "${to}" is already talking. PrivateChat: ${privateChat} - Conference: ${conference}`)
            return namespace.to(from).emit('conferenceInvitation', { message: `User ${to} is already talking`, from })
        }
        namespace.in(room).emit('conferenceInvitation', { room, to, from })
    } catch (error) {
        console.log(error)
    }
}

const joinConference = (socket, namespace) => ({ username, room, to, from }) => {
    const admin = username === to
    console.log(admin
        ? `Conference - User "${username}" wants to open a conference room`
        : `Conference - User "${username}" wants to join the "${to}" conference`)

    // Join the room
    socket.join(to, async () => {
        if (!room) return

        try {
            const user = await ChatRedis.getUser(room, username)
            await ChatRedis.setUser(room, username, { ...user, conference: to })
            console.log(admin
                ? `Conference - User "${username}" opened a conference`
                : `Conference - User "${username}" joined the "${to}" conference`)
            namespace.in(to).emit('joinConference', { username, to, room, from })
        } catch (error) {
            console.log(error)
        }
    })
}

const leaveConference = (socket, namespace) => async ({ room, from, conferenceRoom }) => {
    console.log(`Conference - User "${from}" wants to leave the conference room ${room}`)

    try {
        const user = await ChatRedis.getUser(room, from)
        await ChatRedis.setUser(room, from, { ...user, conference: false })
        socket.leave(conferenceRoom, () => {
            namespace.to(conferenceRoom).emit('leaveConference', { room, from })
            console.log(`Conference - User ${from} left the conference room ${room}`)
        })
    } catch (error) {
        console.log(error)
    }
}

const PCSignalingConference = (namespace) => ({ desc, to, from, room, candidate }) => {
    candidate
        ? console.log(`Conference - User "${from}" sends a candidate to "${to}"`)
        : console.log(`Conference - User "${from}" sends a ${from === room ? 'offer' : 'answer'} to "${to}"`)
    namespace.to(room).emit('PCSignalingConference', { desc, to, from, candidate })
}


const leaveRoom = (socket, namespace) => ({ room, username }) => {
    console.log(`Room - User "${username}" wants to leave the room ${room}`)

    socket.leave(room, async () => {
        console.log(`Room - User "${username}" left the room ${room}`)

        try {
            await ChatRedis.delUser(room, username)
            const users = await ChatRedis.getUsers(room)
            // Notify all the users in the same room
            namespace.in(room).emit('newUser', { users, username })
        } catch (error) {
            console.log(error)
        }
    })
}

const leaveChat = (socket, namespace) => async ({ room, username }) => {
    console.log(`User "${username}" wants to leave the chat`)

    try {
        await ChatRedis.delUser(room, username)
        const users = await ChatRedis.getUsers(room)
        // Leave the socket
        socket.leave(room, () => {
            console.log(`User "${username}" left the room ${room}`)
            // Notify all the users in the same room
            namespace.in(room).emit('leaveChat', { users, message: `${username} left the room`})
        })
    } catch (error) {
        console.log(error)
    }
}

const joinPrivateRoom = (socket, namespace) => ({ username, room, to, from, joinConfirmation }) => {
    console.log(`Private chat - User "${username}" ${!joinConfirmation
        ? 'wants to have a' : 'accept the private'} chat with with "${to}"`)

    // Join the room
    socket.join(to, async () => {
        if (!room) return

        try {
            const { privateChat } = await ChatRedis.getUser(room, to)
            if (!!privateChat && privateChat !== username) {
                namespace.to(to).emit('leavePrivateRoom', {
                    to, room,
                    privateMessage: `${to} is already talking`,
                    from: username,
                })
                // Leave the room
                socket.leave(to, () => console.log(`Private chat - User "${username}" forced to leave the room "${to}"`))
                return
            }

            const user = await ChatRedis.getUser(room, username)
            await ChatRedis.setUser(room, username, { ...user, privateChat: to })
            if (!joinConfirmation) namespace.in(room).emit('privateChat', { username, to, room, from })
        } catch (error) {
            console.log(error)
        }
    })
}

const leavePrivateRoom = (socket, namespace) => async ({ room, from, to }) => {
    console.log(`Private chat - User "${from}" wants to leave the private chat with "${to}"`)

    try {
        const user = await ChatRedis.getUser(room, from)
        await ChatRedis.setUser(room, from, { ...user, privateChat: false })
        socket.leave(to, () => {
            console.log(`Private chat - User "${from}" left the private chat with "${to}"`)
            namespace.to(to).emit('leavePrivateRoom', {
                to, from,
                privateMessage: `${from} has closed the chat`,
            })
        })
    } catch (error) {
        console.log(error)
    }
}

const privateMessage = (namespace) => ({ privateMessage, to, from, room }) => {
    console.log(`Private chat - User "${from}" sends a private message to "${to}"`)
    // Private message to the user
    namespace.to(room).emit('privateMessage', { to, privateMessage, from, room })
}

const privateMessagePCSignaling = (namespace) => ({ desc, to, from, room, candidate }) => {
    candidate
        ? console.log(`Private chat - User "${from}" sends a candidate to "${to}"`)
        : console.log(`Private chat - User "${from}" sends a ${from !== room ? 'offer' : 'answer'} to "${to}"`)
    // Private signaling to the user
    namespace.to(room).emit('privateMessagePCSignaling', { desc, to, from, candidate })
}

module.exports = {
    publicMessage,
    leaveRoom,
    joinPrivateRoom,
    leavePrivateRoom,
    privateMessage,
    privateMessagePCSignaling,
    leaveChat,
    changeStatus,
    conferenceInvitation,
    joinConference,
    leaveConference,
    PCSignalingConference
}