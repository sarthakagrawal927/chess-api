const logger = require("./logger.js");
const loadEngine = require("./stockfishjs/example/load_engine.js");
let engine = loadEngine(require("path").join(__dirname, "/stockfishjs/src/stockfish.js"));

const ENGINE_MODE = {
  EVAL: 1,
  BEST_MOVE: 2
}

const MODE_COMMAND = {
  [ENGINE_MODE.EVAL]: "eval",
  [ENGINE_MODE.BEST_MOVE]: "go depth 18"
}

const loadEnginePro = () => {
  engine = loadEngine(require("path").join(__dirname, "/stockfishjs/src/stockfish.js"));
}

async function getResult(fen, mode = ENGINE_MODE.BEST_MOVE) {
  engine.send("ucinewgame");
  engine.send("position fen " + fen);

  return new Promise((resolve, reject) => {
    const onDone = (result) => {
      resolve(result);
    };

    const onStream = (data) => {
      if (data.startsWith("Final evaluation") && mode === ENGINE_MODE.EVAL) {
        resolve(data);
      }
    };

    engine.send("isready", onReady = () => {
      engine.send(MODE_COMMAND[mode], onDone, onStream);
    });

    // setTimeout(() => {
    //   logger.error(`Timeout in getResult ${JSON.stringify({fen, mode, engine})}`);
    //   resolve("timeout")
    // }, 10000);

  }).catch((error) => {
    logger.error(`Error in getResult ${JSON.stringify({error, engine})}`);
  });
}

async function getResults(fen) {
  loadEnginePro();
  const [bestMove, winProbability] = await Promise.all([
    getResult(fen, ENGINE_MODE.BEST_MOVE),
    getResult(fen, ENGINE_MODE.EVAL)
  ]);
  return { bestMove, winProbability };
}

module.exports = { getResults }