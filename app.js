const express = require('express')
const morgan = require('morgan')
const http = require('http');
const { Server } = require("socket.io");
const { Chess } = require('chess.js')
const { getResults } = require("./engine.js");
const logger = require('./logger.js');
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


const chess = new Chess();

app.post('/', async(request, response) => {
  return response.json({res: "Received a file"})
  if(!request.body.pgnFile && !request.body.fen) return response.json({error: "No pgn provided"})
  try {
    let fen = request.body.fen;
    if(!fen) {
      chess.loadPgn(request.body.pgnFile)
      fen = chess.fen()
      chess.reset()
    }
    logger.info({fen}, "New move in app.post")
    response.status(200).json(await getResults(fen))
  } catch(e) {
    logger.error({e}, "Error in app.post")
    return response.json({error: "Invalid pgn"})
  }
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
  logger.info({connectedUserCount}, "New user connected")

  socket.on("joinRoom", (args) => {
    socket.join(args.roomId)
    // leaveAllRooms(socket, args)
  })

  socket.on("leaveRoom", (args) => {
    socket.leave(args.roomId)
  })

  socket.on("disconnect", () => {
    connectedUserCount -= 1;
    logger.info({connectedUserCount}, "User disconnected")
  });
});

server.listen(port, async (err) => {
  if (err) {
    return logger.error('something bad happened', err)
  }
  logger.info(`server is listening on ${port}`)
});


(async function simulateChess(){
  for (;;) {
    try {
      if(connectedUserCount > 0) {
        const fen = fenStrings[Math.floor(Math.random() * fenStrings.length)]
        logger.info({fen}, "New move in simulateChess")
        await new Promise(resolve => setTimeout(resolve, 3000));
        const results = await getResults(fen)
        logger.info({results}, "Results from simulateChess")
        io.local.emit('newMove', {...results, fen});
      }
      else await new Promise(resolve => setTimeout(resolve, 20000));
    } catch(err) {
      console.log({err})
      logger.error({err}, "Error in simulateChess")
    }
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
