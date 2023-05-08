const express = require('express')
const morgan = require('morgan')
const http = require('http');
const { Server } = require("socket.io");

const { getResults } = require("./engine.js");
const { addVoteToQueue, getProgressReport, getVoteResult } = require('./queue.js');

const app = express()
const server = http.createServer(app);
const port = 8080
const io = new Server(server);

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(morgan(':method :url :response-time ms'))

app.post('/', async(request, response) => {
  return response.json(await getResults(request.body.fen))
});

app.post('/vote', async(request, response) => {
  addVoteToQueue(request.body)
  response.json({status: "ok"})
})

app.get('/queue_progress', async(_request, response) => {
  response.json(await getProgressReport())
})

app.get("/vote_result", async(request, response) => {
  response.json(await getVoteResult(request.query.match_id))
})

const leaveAllRooms = (socket, current) => {
  const rooms = socket.rooms.values()

  for (let val = rooms.next().value; val; val = rooms.next().value) {
    if (val !== current) {
      socket.leave(val)
    }
  }
}

io.on('connection', (socket) => {
  // console.log('a user connected');

  socket.on("joinRoom", (args) => {
    socket.join(args.roomId)
    // leaveAllRooms(socket, args)
  })

  socket.on("leaveRoom", (args) => {
    socket.leave(args.roomId)
  })
});

server.listen(port, async (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }
  console.log(`server is listening on ${port}`)
});

// (function simulateChess(){
//   setInterval(()=>{
//     const ltsRoom = Math.random() > 0.5 ? "room1" : "room2"
//     io.to(ltsRoom).emit('newMove', `result from ${ltsRoom}`);
//   }, 1000)
// })();

// (function simulateVoting(){
//   setInterval(()=>{
//     const ans = Math.random() > 0.5 ? 1 : 2
//     addVoteToQueue({ans})
//   }, 0.1)
// })();
