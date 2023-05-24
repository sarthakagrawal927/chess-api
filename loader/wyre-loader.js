const getWyreSyncInstance = async () => {
  console.log("started.");
  const { createWyre } = await import("@wyre-client/core");
  console.log("imported.");
  return async (dataKey, instanceKey) => {
    const sync = createWyre({
    data: {[dataKey]: []},
    onChange: () => {},
    });
    console.log(`${dataKey}: ${instanceKey}: created.`);
    const syncInstance = await sync.init(instanceKey);
    console.log(`${dataKey}: ${instanceKey}: done.`);
    return syncInstance;
  }
}

module.exports = { getWyreSyncInstance };