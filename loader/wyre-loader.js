const { createWyre } = require("@wyre-client/core");

const UNIQUE_ID = "gcl:chess:live";
/**
 *
 */
export const wyreLoader = async (initialData = {}) => {
  const sync = createWyre({
    data: initialData,
    onCreate: () => {},
  });
  const data = await sync.init(UNIQUE_ID);
  return data;
};
