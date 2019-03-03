
const express = require('express');
const app = express();
const io = app.io = require('socket.io')();
const cors = require('cors');
const bodyParser = require('body-parser');

const users = require('./routes/user');
const rooms = require('./routes/room');
const chat = require('./chat_namespace');

app.use(cors())
app.use(bodyParser.json());

/**
 * Middleware
 */
app.use((req, res, next) => {
    console.log('Time: ', Date.now());
    next();
});

/**
 * Routing
 */
app.use('/user', users)
app.use('/rooms', rooms)


/**
 * Chat socket namespace
 */
chat.createNameSpace(io)


module.exports = app
