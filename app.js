const express = require("express");
const morgan = require("morgan");
const http = require("http");
const { Chess } = require("chess.js");
const { getResults } = require("./engine.js");
const logger = require("./logger.js");
const { wyreLoader, ChessObjKey } = require("./loader/wyre-loader.js");
// const { addVoteToQueue, getProgressReport, getVoteResult } = require('./queue.js');

const app = express();
const server = http.createServer(app);
const port = 8080;
let wyreChess;

const fenStrings = [
  "r4rk1/p2qn1pp/2pbbp2/3pp3/4P3/Q1Nn1N2/P1PBBPPP/R4RK1 w - - 0 14",
  "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b - - 0 14",
];

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(morgan(":method :url :response-time ms"));

const chess = new Chess();

app.post("/", async (request, response) => {
  // return response.json({res: "Received a file", body: request.body})
  if (!request.body.pgnFile && !request.body.fen)
    return response.json({ error: "No pgn provided" });
  try {
    let fen = request.body.fen;
    if (!fen) {
      chess.loadPgn(request.body.pgnFile);
      const chessHeader = chess.header();
      const chessMoves = chess.moves();
      fen = chess.fen();
      const results = await getResults(fen);
      const finishedChessResult = { fen, chessHeader, chessMoves, ...results };
      wyreChess[ChessObjKey].push(finishedChessResult);
      response.status(200).json(finishedChessResult);
      chess.reset();
    }
  } catch (e) {
    logger.error({ e }, "Error in app.post");
    return response.json({ error: "Invalid pgn" });
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


async function startServer() {
  wyreChess = await wyreLoader();
  simulateChess();

  server.listen(port, async (err) => {
    if (err) {
      return logger.error("something bad happened", err);
    }
    logger.info(`server is listening on ${port}`);
  });

  server.on("error", (err) => {
    logger.error("server error", err);
  });
}

async function simulateChess(wyreChess) {
  for (;;) {
    try {
      if (connectedUserCount) {
        let gameId = Math.floor(Math.random() * fenStrings.length);
        const fen = fenStrings[gameId];
        logger.info({ fen }, "New move in simulateChess");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const results = await getResults(fen);
        logger.info({ results }, "Results from simulateChess");
        if (wyreChess) {
          logger.info("Pushing", { wyreChess }, "wyreChess");
          wyreChess[ChessObjKey].push({fen, ...results});
        }
      } else await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (err) {
      logger.error({ err }, "Error in simulateChess");
    }
  }
}

// (function simulateVoting(){
//   setInterval(()=>{
//     const ans = Math.random() > 0.5 ? 1 : 2
//     addVoteToQueue({ans})
//   }, 0.1)
// })();

startServer();
