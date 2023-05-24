const { getWyreSyncInstance } = require("./loader/wyre-loader.js");
const logger = require("./logger.js");
const { WYRE_DATA_OBJ_KEY, WYRE_MESSAGE_TYPE } = require("./utils/constants.js");
// const { sendToSocket } = require("./socket.js");

let wyreMessageTypeToInstance;

const pushToWyre = (data, wyreMessageType = WYRE_MESSAGE_TYPE.CHESS_OBJ, retryCount = 2) => {
  // sendToSocket(data);
  if (wyreMessageTypeToInstance[wyreMessageType]) {
    const dataKey = WYRE_DATA_OBJ_KEY[wyreMessageType];
    wyreMessageTypeToInstance[wyreMessageType][dataKey].push(data);
    logger.info(`[PUSHING TO WYRE]: ${dataKey} ${JSON.stringify(data)}`);
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
  let wyreInstanceCreator = await getWyreSyncInstance();
  wyreMessageTypeToInstance = {
    [WYRE_MESSAGE_TYPE.CHESS_OBJ]: await wyreInstanceCreator(WYRE_DATA_OBJ_KEY.CHESS_OBJ, "testing:dynamic:import18"),
    [WYRE_MESSAGE_TYPE.COMMENTARY]: await wyreInstanceCreator(WYRE_DATA_OBJ_KEY.COMMENTARY, "testing:dynamic:import19"),
    [WYRE_MESSAGE_TYPE.POLL]: await wyreInstanceCreator(WYRE_DATA_OBJ_KEY.POLL, "testing:dynamic:import20"),
  }
  logger.info("[ALL WYRE INSTANCES LOADED]");
}

module.exports = { pushToWyre, loadWyre }