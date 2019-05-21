export const url = `${process.env.VUE_APP_SOCKET_HOST || 'localhost'}:${process.env.VUE_APP_SOCKET_PORT || '3000'}`

export const STORE_ACTIONS = {
    joinRoom: 'joinRoom',
    setRooms: 'setRooms',
    changeRoom: 'changeRoom',
    leaveChat:'leaveChat',
    changeStatus: 'changeStatus'
}
export const WS_EVENTS = {
    joinPrivateRoom: 'joinPrivateRoom',
    joinRoom: 'joinRoom',
    leaveRoom: 'leaveRoom',
    publicMessage: 'publicMessage',
    leavePrivateRoom: 'leavePrivateRoom',
    leaveChat: 'leaveChat',
    changeStatus: 'changeStatus'
}

export const STATUS_OPTIONS = {
    available: 'available',
    absent: 'absent',
    unavailable: 'unavailable'
}
