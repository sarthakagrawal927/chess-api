const { ChessObjKey, wyreLoader } = require("./loader/wyre-loader.js");
const logger = require("./logger.js");

let wyreChess;

const pushToWyre = (data, clearTheArray = false, retryCount = 2) => {
  if (wyreChess) {
    wyreChess[ChessObjKey].push(data);
    if (clearTheArray) {
      wyreChess[ChessObjKey] = [];
    }
    logger.info("[PUSHING TO WYRE]", { data });
  } else {
    logger.info("[WYRE NOT LOADED]");
    if (retryCount) {
      setTimeout(() => {
        logger.info(`[RETRYING PUSH TO WYRE] Remaining Retries: ${retryCount-1}`);
        pushToWyre(data, false, retryCount - 1);
      }, 1000);
    }
  }
}

const loadWyre = async () => {
  wyreChess = await wyreLoader();
  console.log(wyreChess)
  logger.info("[WYRE LOADED]");
}

module.exports = { pushToWyre,loadWyre }