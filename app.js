const express = require('express')
const morgan = require('morgan')
const http = require('http');
const { Server } = require("socket.io");

const { getResults } = require("./engine.js");
// const { addVoteToQueue, getProgressReport, getVoteResult } = require('./queue.js');

const app = express()
const server = http.createServer(app);
const port = 8080
const io = new Server(server);

const fenStrings = [
  "r4rk1/p2qn1pp/2pbbp2/3pp3/4P3/Q1Nn1N2/P1PBBPPP/R4RK1 w - - 0 14",
  "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b - - 0 14",
];

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(morgan(':method :url :response-time ms'))

app.post('/', async(request, response) => {
  if(!request.body.pgnFile) return response.json({error: "No pgn provided"})
  // getMoves(request.body.pgnFile)
  // const fen = printFEN()
  return response.json(await getResults(fenStrings[0]))
});

let connectedUserCount = 0;


// app.post('/vote', async(request, response) => {
//   addVoteToQueue(request.body)
//   response.json({status: "ok"})
// })

// app.get('/queue_progress', async(_request, response) => {
//   response.json(await getProgressReport())
// })

// app.get("/vote_result", async(request, response) => {
//   response.json(await getVoteResult(request.query.match_id))
// })

const leaveAllRooms = (socket, current) => {
  const rooms = socket.rooms.values()

  for (let val = rooms.next().value; val; val = rooms.next().value) {
    if (val !== current) {
      socket.leave(val)
    }
  }
}

io.on('connection', (socket) => {
  connectedUserCount += 1;
  console.log('a user connected');

  socket.on("joinRoom", (args) => {
    socket.join(args.roomId)
    // leaveAllRooms(socket, args)
  })

  socket.on("leaveRoom", (args) => {
    socket.leave(args.roomId)
  })

  socket.on("disconnect", () => {
    connectedUserCount -= 1;
    console.log('a user disconnected');
  });
});

server.listen(port, async (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }
  console.log(`server is listening on ${port}`)
});


(async function simulateChess(){
  for (;;) {
    console.log({connectedUserCount})
    if(connectedUserCount > 0) {
      const fen = fenStrings[Math.floor(Math.random() * fenStrings.length)]
      const results = await getResults(fen)
      console.log({results})
      io.local.emit('newMove', {...results, fen});
    }
    else await new Promise(resolve => setTimeout(resolve, 1000));
    // const ltsRoom = Math.random() > 0.5 ? "room1" : "room2"
    // io.to(ltsRoom).emit('newMove', `result from ${ltsRoom}`);
  }
})();

// (function simulateVoting(){
//   setInterval(()=>{
//     const ans = Math.random() > 0.5 ? 1 : 2
//     addVoteToQueue({ans})
//   }, 0.1)
// })();
