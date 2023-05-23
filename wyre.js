const { ChessObjKey, wyreLoader } = require("./loader/wyre-loader.js");
const logger = require("./logger.js");
const { sendToSocket } = require("./socket.js");

let wyreChess;

const pushToWyre = (data, retryCount = 2) => {
  sendToSocket(data);
  if (wyreChess) {
    wyreChess[ChessObjKey].push(data);
    logger.info("[PUSHING TO WYRE]", { data });
  } else {
    logger.info("[WYRE NOT LOADED]");
    if (retryCount) {
      setTimeout(() => {
        logger.info(`[RETRYING PUSH TO WYRE] Remaining Retries: ${retryCount-1}`);
        pushToWyre(data, retryCount - 1);
      }, 1000);
    }
  }
}

const loadWyre = async () => {
  wyreChess = await wyreLoader();
  logger.info("[WYRE LOADED]");
}

module.exports = { pushToWyre,loadWyre }