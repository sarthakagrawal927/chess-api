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

  return new Promise((resolve) => {
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

const numberRegex = /-?\d+\.?\d*/;

async function getResults(fen) {
  loadEnginePro();
  try {
    let [bestMove, winProbability] = await Promise.all([
      null, // getResult(fen, ENGINE_MODE.BEST_MOVE),
      getResult(fen, ENGINE_MODE.EVAL) // Final evaluation       -2.49 (white side)
    ]);
    const numberPresent = winProbability.match(numberRegex);
    winProbability = (numberPresent && numberPresent.length > 0) ? parseFloat(winProbability.match(numberRegex)[0]) : null;
    return { bestMove, winProbability };
  } catch (err) {
    logger.error(`Error in getResults: ${err.message}, fen: ${fen}`);
    throw err;
  }
}

module.exports = { getResults }