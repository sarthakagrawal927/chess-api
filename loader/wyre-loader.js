const ChessObjKey = 'chessObj';

async function wyreLoader() {
  console.log("started.");
  const { createWyre } = await import("@wyre-client/core");
  const sync = createWyre({
    data: {[ChessObjKey]: []},
    onChange: () => {},
  });
  const syncInstance = await sync.init("testing:dynamic:import5");
  console.log("done.");
  return syncInstance;
}

module.exports = { wyreLoader, ChessObjKey };