const express = require('express')
const app = express()
const http = require('http');
const server = http.createServer(app);
const port = 8080
const { Server } = require("socket.io");
const io = new Server(server);
const { getResult } = require("./engine.js")

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.post('/', (request, response) => {
  return getResult(request.body.fen, response)
});

const leaveAllRooms = (socket, current) => {
  const rooms = socket.rooms.values()

  for (let val = rooms.next().value; val; val = rooms.next().value) {
    console.log({val})
    if (val !== current) {
      socket.leave(val)
    }
  }
}

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on("switch", (args) => {
    socket.join(args)
    leaveAllRooms(socket, args)
  })
});

server.listen(port, async (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }
  console.log(`server is listening on ${port}`)
});

(function simulateChess(){
  setInterval(()=>{
    const ltsRoom = Math.random() > 0.5 ? "room1" : "room2"
    io.to(ltsRoom).emit('newMove', `result from ${ltsRoom}`);
  }, 1000)
})();