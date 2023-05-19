const loadEngine = require("./stockfishjs/example/load_engine.js");
let engine = loadEngine(require("path").join(__dirname, "/stockfishjs/src/stockfish.js"));

const ENGINE_MODE = {
  EVAL: 1,
  BEST_MOVE: 2
}

const MODE_COMMAND = {
  [ENGINE_MODE.EVAL]: "eval",
  [ENGINE_MODE.BEST_MOVE]: "go depth 10"
}

const loadEnginePro = () => {
  engine = loadEngine(require("path").join(__dirname, "/stockfishjs/src/stockfish.js"));
}

async function getResult(fen, mode = ENGINE_MODE.BEST_MOVE) {
  console.log({fen, mode})
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

  }).catch((error) => {
    console.log({error});
  });
}

async function getResults(fen) {
  loadEnginePro();
  const [bestMove, winProbability] = await Promise.all([
    getResult(fen, ENGINE_MODE.BEST_MOVE),
    getResult(fen, ENGINE_MODE.EVAL)
  ]);
  console.log({bestMove, winProbability})

  return { bestMove, winProbability };
}

module.exports = { getResults }