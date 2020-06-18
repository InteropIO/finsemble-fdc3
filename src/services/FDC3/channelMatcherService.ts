// import "@chartiq/finsemble/dist/types";

//ensure that the store is created for the channel matcher.
// If it's not created will we create it here
export default function ChannelMatcherStoreSetup(
  DistributedStoreClient: any,
  Logger: any
) {
  const { getStore, createStore } = DistributedStoreClient;
  createStore(
    {
      store: "FDC3ToExternalChannelPatches",
      global: false,
      values: {},
    },
    (err: any, data: string) =>
      err
        ? Logger.error(err)
        : Logger.log("FDC3ToExternalChannelPatches store created: " + data)
  );
}
