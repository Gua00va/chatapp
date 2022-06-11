const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getRoomUsers } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = 3000

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))


io.on('connection', (socket)=>{
    console.log('New websocket connection')
    
    socket.on('join', (options, callback)=>{
        const { error, user } = addUser({ id: socket.id, ...options })
        
        if(error) {
            return callback(error)
        }

        socket.join(user.room)
        
        socket.emit('message', generateMessage('admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('admin', `${user.username} has joined`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getRoomUsers(user.room)
        })

        callback()

    })

    socket.on('sendMessage', (message, callback)=>{
        const filter = new Filter()

        const user = getUser(socket.id)

        if(filter.isProfane(message)){
            return callback('Profanity is not Allowed')
        }

        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('message', generateMessage('admin', `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
        
        
    })

    socket.on('sendLocation', (coords, callback)=>{
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `http://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

})

server.listen(port, () => {
  console.log(`Server up on port ${port}`)
})