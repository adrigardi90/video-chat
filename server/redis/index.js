const redis = require('redis')
const bluebird = require('bluebird')

const config = require('./../config/')

// Using promises
bluebird.promisifyAll(redis);

function ChatRedis() {
    this.client = redis.createClient({
        host: config.REDIS_HOST
    });
}

/**
 * Add user with hash
 * @param  {} room
 * @param  {} socketId
 * @param  {} userObject
 */
ChatRedis.prototype.addUser = function (room, socketId, userObject) {
    this.client.hsetAsync(room, socketId, JSON.stringify(userObject)).then(
        () => console.debug('addUser', userObject + 'added to the room ' + room),
        err => console.log('addUser', err)
    );
}

/**
 * Get all users by room
 * @param  {} room
 */
ChatRedis.prototype.getUsers = function (room) {
    return this.client.hgetallAsync(room).then(users => {
        const userList = []

        for (let user in users) {
            userList.push(JSON.parse(users[user]))
        }

        return userList
    }, error => {
        console.log('getUsers', error)
        return null
    })
}

module.exports = new ChatRedis()
