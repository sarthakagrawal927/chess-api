const loadEngine = require("./stockfishjs/example/load_engine.js");
let engine = loadEngine(require("path").join(__dirname, "/stockfishjs/src/stockfish.js"));
const mode = "EVAL2"

function getResult(fen, response){
  engine.send("ucinewgame");
  engine.send("position fen " + fen);
  engine.send(mode === "EVAL" ? "eval" : "go depth 18", function onDone(result){
    console.log({result})
    return response.json({result})
    // engine.quit();
  }, function onStream(data){
    console.log({data})
  });
}

module.exports = { getResult }