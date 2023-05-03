const { setTimeout } = require("timers/promises");
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

async function getResult(fen, mode = ENGINE_MODE.BEST_MOVE){
  engine.send("ucinewgame");
  engine.send("position fen " + fen);
  return new Promise((resolve, _reject) => {
    engine.send(MODE_COMMAND[mode], function onDone(result){
      resolve(result)
    }, function onStream(data){
      if(data.startsWith("Final evaluation") && mode === ENGINE_MODE.EVAL){
        resolve(data)
      }
    });
    setTimeout(5000).then(()=>{
      resolve("Stock-fish Timed out")
    })
  })
}

async function getResults(fen){
  const [bestMove, winProbability] = await Promise.all([
    getResult(fen, ENGINE_MODE.BEST_MOVE),
    getResult(fen, ENGINE_MODE.EVAL),
  ])
  return {bestMove, winProbability}
}

module.exports = { getResults }