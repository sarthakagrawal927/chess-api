const express = require("express");
const morgan = require("morgan");
const http = require("http");
const { Chess } = require("chess.js");
const { getResults } = require("./engine.js");
const logger = require("./logger.js");
const { pushToWyre, loadWyre } = require("./wyre.js");
const { simulateChessGame } = require("./chessStreamer.js");
// const votesRouter = require("./routes/votes.js");
// const { initializeSocket } = require("./socket.js");

// const { addVoteToQueue, getProgressReport, getVoteResult } = require('./queue.js');

const app = express();
const server = http.createServer(app);
const port = 8080;

const fenStrings = [
  "r4rk1/p2qn1pp/2pbbp2/3pp3/4P3/Q1Nn1N2/P1PBBPPP/R4RK1 w - - 0 14",
  "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b - - 0 14",
];

// middlewares
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(morgan(":method :url :response-time ms"));

// routes
// app.use(votesRouter)

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
      pushToWyre(finishedChessResult);
      response.status(200).json(finishedChessResult);
      chess.reset();
    }
  } catch (e) {
    logger.error({ e }, "Error in app.post");
    return response.status(400).json({ error: "Something went wrong" });
  }
});

async function startServer() {
  await loadWyre();
  // for(let i=0;i<6;i++)
    simulateChessGame(2);
  // initializeSocket(server);

  server.listen(port, async (err) => {
    if (err) {
      return logger.error("something bad happened", err);
    }
    logger.info(`server is listening on ${port}`);
  });

  // Gracefully handle server shutdown
  process.on('SIGINT', () => {
    console.log('Received SIGINT signal. Shutting down gracefully...');
    server.close((err) => {
      if (err) {
        console.error('Error closing the server:', err);
        process.exit(1);
      }
      console.log('Server closed.');
      process.exit(0);
    });
  });
}

// setInterval(async () => {
//   try {
//     let gameId = Math.floor(Math.random() * fenStrings.length);
//     const fen = fenStrings[gameId];
//     logger.info({ fen }, "New move in simulateChess");
//     const results = await getResults(fen);
//     logger.info({ results }, "Results from simulateChess");
//     pushToWyre({ fen, ...results });
//   } catch (err) {
//     logger.error({ err }, "Error in simulateChess");
//   }
// }, 1000);

startServer();
