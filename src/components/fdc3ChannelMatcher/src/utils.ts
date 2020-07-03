export const equals = (a, b) => {
  if (a === b) return true;
  if (a instanceof Date && b instanceof Date)
    return a.getTime() === b.getTime();
  if (!a || !b || (typeof a !== "object" && typeof b !== "object"))
    return a === b;
  if (a.prototype !== b.prototype) return false;
  let keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  return keys.every((k) => equals(a[k], b[k]));
};

type ProviderChannel = {
  channelName: string;
  inbound?: string | null;
  outbound?: string | null;
};

/**
 *
 * @param providerName "CompanyA"
 * @param providerChannel
 */
const setProviderChannel = (
  providerName: string,
  providerChannel: ProviderChannel
) =>
  FSBL.Clients.DistributedStoreClient.getStore(
    {
      store: "FDC3ToExternalChannelPatches",
    },
    (err: any, store: any) => {
      if (err) throw new Error(err);
      store.setValue({ field: providerName, value: providerChannel });
    }
  );

//implementation from the 3rd party

async function channelSetup(newChannel: string) {
  // Finsemble store
  const provider = "Company1";
  setProviderChannel(provider, { channelName: newChannel, inbound: null });

  // fdc3
  const channel = await fdc3.getOrCreateChannel(newChannel);
  const context = {};
  channel.broadcast(context);
  channel.addContextListener((context) => {
    // doSomethingHere(context)
  });
}
