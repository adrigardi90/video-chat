
const express = require('express');
const userRouter = express.Router();

const ChatRedis = require('../redis')

// We just want to store the logged users (username has to be unique)
// so we always use the same key to adapt it to our Redis implementation
const key = 'unique'


// Login
userRouter.post('/login', (req, res) => {
    const newUser = req.body
    if (!newUser.username) return res.send({ code: 400, message: 'Data is required' })

    console.log(`Login user ${newUser.username}`)

    ChatRedis.getUser(newUser.username, key)
        .then(user => {
            if (user === null) {
                ChatRedis.addUser(newUser.username, key, newUser)
                console.log(`User ${newUser.username} logged`)
                return res.send({ code: 200, message: 'Logged in succesfully' })
            }

            console.log(`User ${newUser.username} already exists`)
            return res.send({ code: 401, message: 'Username already exists' })
        })
})

// Logout
userRouter.post('/logout', (req, res) => {
    const user = req.body

    console.log(`Logout user ${user.username}`)

    ChatRedis.delUser(user.username, key)
        .then( data => {
            if(data === null) {
                return res.send({ code: 400, message: 'User not found' })
            }
                
            return res.send({ code: 200, message: 'Logged in succesfully' })
        })
})


module.exports = userRouter