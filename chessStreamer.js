const { Chess } = require("chess.js");
const { pushToWyre } = require("./wyre");
const { printMemoryUsage } = require("./memoryUsage");
const { getDataWithFen } = require("./utils/chessify");
// const { printMemoryUsage } = require("./memoryUsage");

const pgnHeader = `[Event "FIDE World Championship Match 2023 Rapid Tie-break"]
[Site "Astana KAZ"]
[Date "2023.04.30"]
[Round "4"]
[White "Nepomniachtchi, Ian"]
[Black "Liren, Ding"]
[Result "0-1"]
[WhiteElo "2761"]
[WhiteTitle "GM"]
[WhiteFideId "4168119"]
[BlackElo "2829"]
[BlackTitle "GM"]
[BlackFideId "8603677"]
[UTCDate "2023.04.30"]
[UTCTime "09:58:57"]
[Variant "Standard"]
[ECO "C84"]

`

const movesData = [
  "1. e4 e5",
  "2. Nf3 Nc6",
  "3. Bb5 a6",
  "4. Ba4 Nf6",
  "5. O-O Be7",
  "6. Re1 b5",
  "7. Bb3 d6",
  "8. c3 O-O",
  "9. h3 Nb8",
  "10. d4 Nbd7",
  "11. c4 c6",
  "12. cxb5 axb5",
  "13. Nc3 Bb7",
  "14. Bg5 b4",
  "15. Nb1 h6",
  "16. Bh4 c5",
  "17. dxe5 Nxe4",
  "18. Bxe7 Qxe7",
  "19. exd6 Qf6",
  "20. Nbd2 Nxd6",
  "21. Nc4 Nxc4",
  "22. Bxc4 Nb6",
  "23. Ne5 Rae8",
  "24. Bxf7+ Rxf7",
  "25. Nxf7 Rxe1+",
  "26. Qxe1 Kxf7",
  "27. Qe3 Qg5",
  "28. Qxg5 hxg5",
  "29. b3 Ke6",
  "30. a3 Kd6",
  "31. axb4 cxb4",
  "32. Ra5 Nd5",
  "33. f3 Bc8",
  "34. Kf2 Bf5",
  "35. Ra7 g6",
  "36. Ra6+ Kc5",
];


async function simulateChessGame (gameId = 1) {
  console.log({gameId})
  const chess = new Chess();
  let currentPgn = pgnHeader;
  await new Promise((resolve) => setTimeout(resolve, 5000));
  let startTime = Date.now();
  for (let i = 0; i < 10; i++) {
    currentPgn += ` ${movesData[i]}`;
    chess.loadPgn(currentPgn);
    const chessHeader = chess.header();
    const chessMoves = chess.moves();
    const fen = chess.fen();
    if(!fen){
      logger.error("Could not generate FEN",{currentPgn})
      continue;
    }
    const results = await getDataWithFen(fen);
    const finishedChessResult = { fen, chessHeader, chessMoves, ...results };
    if (i === movesData.length - 1) {
      i = -1;
      currentPgn = pgnHeader;
    }
    const endTime = Date.now();
    console.log(`GameID: ${gameId} Time taken for the move ${endTime - startTime}ms`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    printMemoryUsage();
    startTime = Date.now();
    pushToWyre(finishedChessResult);
    chess.reset();
  }
}


module.exports = { simulateChessGame }