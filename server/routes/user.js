
const express = require('express');
const userRouter = express.Router();

// users in memory
let loggedUsers = []

// Login
userRouter.post('/login', (req, res) => {
    const newuser = req.body
    if(!newuser.username) return res.send({code: 400, message: 'Data is required'})

    console.log(`Login user ${newuser.username}`)

    const isLoggedIn = loggedUsers.some( user => user.username === newuser.username)
    if(isLoggedIn) return res.send({code: 401, message: 'Username already exists'})
    loggedUsers.push(req.body)
    res.send({code: 200, message: 'Logged in succesfully'})
})

// Logout
userRouter.post('/logout', (req, res) => {
    const logoutUser = req.body

    const i = loggedUsers.findIndex( user => user.username === logoutUser.username)
    if(i < 0) return res.send({code: 400, message: 'User not found'})

    console.log(`Logout user ${logoutUser.username}`)

    loggedUsers.splice(i, 1)
    res.send({code: 200, message: 'Logged in succesfully'})
})


module.exports = userRouter