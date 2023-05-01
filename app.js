const express = require('express')
const app = express()
const port = 8080
const loadEngine = require("./stockfishjs/example/load_engine.js");
let engine = loadEngine(require("path").join(__dirname, "/stockfishjs/src/stockfish.js"));
const mode = "EVAL"

// seems wrong
const fenregex = "/^([rnbqkpRNBQKP1-8]+\/){7}([rnbqkpRNBQKP1-8]+)\s[bw]\s(-|K?Q?k?q?)\s(-|[a-h][36])\s(0|[1-9][0-9]*)\s([1-9][0-9]*)/"

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.post('/', (request, response) => {
  console.log("time start", Date.now())

// run chess engine
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

app.listen(port, async (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }
  console.log(`server is listening on ${port}`)
})