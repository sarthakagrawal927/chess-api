const express = require("express");
const morgan = require("morgan");
const http = require("http");
const { Chess } = require("chess.js");
const logger = require("./logger.js");
const { pushToWyre, loadWyre } = require("./wyre.js");
const { simulateChessGame } = require("./chessStreamer.js");
const commentaryRouter = require("./routes/commentary.js");
const votesRouter = require("./routes/pollV1.js");
const { getDataWithFen } = require("./utils/chessify.js");

const app = express();
const server = http.createServer(app);
const port = 8080;

// middlewares
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(morgan(":method :url :response-time ms"));

// routes
app.use("/api/v1/commentary", commentaryRouter)
app.use("/api/v1/poll", votesRouter)

const chess = new Chess();

app.get("/", async (_request, response) => {
  return response.json({ res: "Hello World" });
});

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
      const results = await getDataWithFen(fen);
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

app.use((err, _req, res, _next) => {
  console.log({err})
  res.status(500).json({ error: "Something went wrong" });
})

async function startServer() {
  await loadWyre();
  simulateChessGame();

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

startServer();
