const ChessObjKey = 'chessObj';

async function wyreLoader() {
  console.log("started.");
  const { createWyre } = await import("@wyre-client/core");
  console.log("imported.");
  const sync = createWyre({
    data: {[ChessObjKey]: []},
    onChange: () => {},
  });
  console.log("created.");
  const syncInstance = await sync.init("testing:dynamic:import6");
  console.log("done.");
  return syncInstance;
}

module.exports = { wyreLoader, ChessObjKey };