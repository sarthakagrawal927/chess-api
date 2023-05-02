const express = require('express')
const app = express()
const http = require('http');
const server = http.createServer(app);
const port = 8080
const loadEngine = require("./stockfishjs/example/load_engine.js");
let engine = loadEngine(require("path").join(__dirname, "/stockfishjs/src/stockfish.js"));
const { Server } = require("socket.io");
const io = new Server(server);
const mode = "EVAL2"

// seems wrong
const fenregex = "/^([rnbqkpRNBQKP1-8]+\/){7}([rnbqkpRNBQKP1-8]+)\s[bw]\s(-|K?Q?k?q?)\s(-|[a-h][36])\s(0|[1-9][0-9]*)\s([1-9][0-9]*)/"

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.post('/', (request, response) => {
  console.log("time start", Date.now())

  engine.send("ucinewgame");
  engine.send("position fen " + request.body.fen);
  engine.send(mode === "EVAL" ? "eval" : "go depth 18", function onDone(result){
    console.log({result})
    response.status(200).send(result)
    // engine.quit();
  }, function onStream(data){
    console.log({data})
  });
  console.log("time end", Date.now())
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
    io.to(ltsRoom).emit('newMatch', `result from ${ltsRoom}`);
  }, 1000)
})();
