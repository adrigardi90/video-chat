const express = require('express');
const roomAPI = express.Router();

const rooms = [
    {
        id: 1,
        name: 'GENERAL'
    },
    {
        id: 2, 
        name: 'SPORTS'
    },
    {
        id: 3, 
        name: 'GAMES'
    },
]

// route for get rooms



module.export = roomAPI