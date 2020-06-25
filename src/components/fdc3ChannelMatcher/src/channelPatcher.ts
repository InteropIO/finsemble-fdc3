// import { fdc3, Listener, Channel } from "../../../../FDC3-types";

const FSBL: any = {};

const equals = (a, b) => {
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

// need to add an origin to the context or it will loop back
// to avoid this I could memoize/ store the value of the message sent and if it is identical to the one received then not send it on?

const externalChannelExample: ExternalProviders = {
  Company1: {
    "Group-A": {
      inbound: null, //indicate patch not set
      outbound: "Yellow", //name of FDC channel
    },
    "Group-B": {
      inbound: "Blue",
      outbound: "Blue",
    },
  },
  Company2: {
    Orange: {
      inbound: "Yellow",
      outbound: undefined, //indicates patch not supported
    },
  },
};

interface ExternalProviders {
  [externalProvider: string]: ExternalChannel<ExternalChannelValues>;
}

interface ExternalChannel<T> {
  [externalChannel: string]: T;
}

interface ExternalChannelValues {
  inbound: string | null;
  outbound: string | null;
}

interface ChannelListeners {
  inboundListener: Listener;
  outboundListener: Listener;
}

interface ExternalProviderState {
  [externalProvider: string]: ExternalChannel<
    ChannelListeners & ExternalChannelValues
  >;
}

/*
 - get initial values from store
 - update a local state
 - listen for new state changes
 - only update the changes in state
 -
*/

/**
 *
 * @param distributedStoreValues "FSBL Distributed store used by third party "
 * @param state "state used to compare changes against and to store listeners"
 *
 * Inbound indicates messages coming in from the external source and being forwarded onto the indicated FDC3 channel.
 * Outbound indicates messages coming from FDC3 and being sent out to the external source.
 * inbound and outbound values should be FDC3 system channel names, null if not set or undefined if not supported.
 */
async function onExternalProviderStoreUpdate(
  distributedStoreValues: ExternalProviders,
  state: ExternalProviderState
): Promise<ExternalProviderState> {
  let externalChannelsState = { ...state };

  const [thirdPartyProviderName, thirdPartyProviderChannels] = Object.entries(
    distributedStoreValues
  )[0];

  const providerChannelList = Object.entries(thirdPartyProviderChannels);

  const newState = providerChannelList.map(
    async ([channelName, channelValues]): Promise<
      ExternalChannel<ChannelListeners & ExternalChannelValues>
    > => {
      const { inbound, outbound } = channelValues;
      const { inboundListener, outboundListener } = await setChannel(
        thirdPartyProviderName,
        channelName,
        channelValues,
        externalChannelsState
      );

      const newProviderState = {
        [channelName]: {
          inbound,
          outbound,
          inboundListener,
          outboundListener,
        },
      };
      return newProviderState;
    }
  );

  // The map above resolves to multiple promises in an array resolve them here.
  const settlePromises = await Promise.all(newState);
  // The promises return an array of objects that need to be merged back to one object.
  const formatReturnedValues = settlePromises.reduce(
    (acc, curr) => ({ ...acc, ...curr }),
    {}
  );

  externalChannelsState[thirdPartyProviderName] = formatReturnedValues;

  return externalChannelsState;
}

/**
 *
 * @param thirdPartyProvider "Company Name"
 * @param channelName "e.g. Group A or Yellow"
 * @param channelValues "inbound and outbound"
 * @param state "current state to compare against, matches the store value closely"
 */
async function setChannel(
  thirdPartyProvider: string,
  channelName: string,
  channelValues: ExternalChannelValues,
  state: ExternalProviderState
): Promise<ChannelListeners> {
  try {
    const { inbound, outbound } = channelValues;
    const thirdPartyChannel = await fdc3.getOrCreateChannel(`${channelName}`);

    const channelState = state?.[thirdPartyProvider]?.[channelName];
    const inboundState = channelState?.inbound;
    const outboundState = channelState?.outbound;
    let inboundListener: Listener;
    let outboundListener: Listener;

    if (inbound && !equals(inbound, inboundState)) {
      channelState?.inboundListener.unsubscribe();
      inboundListener = await setOrUpdateInboundChannel(
        thirdPartyChannel,
        inbound
      );
    }

    if (outbound && !equals(outbound, outboundState)) {
      channelState?.outboundListener.unsubscribe();
      outboundListener = await setOrUpdateOutboundChannel(
        thirdPartyChannel,
        outbound
      );
    }

    return { inboundListener, outboundListener };
  } catch (error) {
    console.error(error);
    return error;
  }
}

/**
 *
 * @param thirdPartyChannel ""
 * @param inbound
 */
async function setOrUpdateInboundChannel(
  thirdPartyChannel: Channel,
  inbound: string
): Promise<Listener> {
  try {
    const inboundChannel = await fdc3.getOrCreateChannel(`${inbound}`);

    const inboundListener = thirdPartyChannel.addContextListener(
      async (context) => {
        const currentContext = await inboundChannel.getCurrentContext();

        // prevent a loop when sending and listening to context
        if (equals(context, currentContext)) return;

        inboundChannel.broadcast(context);
      }
    );

    return inboundListener;
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function setOrUpdateOutboundChannel(
  thirdPartyChannel: Channel,
  outbound: string
): Promise<Listener> {
  try {
    const outboundChannel = await fdc3.getOrCreateChannel(`${outbound}`);

    const outboundListener = outboundChannel.addContextListener(
      async (context: Context) => {
        const currentContext = await thirdPartyChannel.getCurrentContext();

        // prevent a loop when sending and listening to context
        if (equals(context, currentContext)) return;

        thirdPartyChannel.broadcast(context);
      }
    );

    return outboundListener;
  } catch (error) {
    console.error(error);
    return error;
  }
}

// ________________ HELPERS ___________

// optional structure
/*   {
    "provider": "BBG",
    "channel": "BBGGroup1",
    "inbound": [],
    "outbound": []
  },
  {
    "provider": "Fidessa",
    "channel": "Orange",
    "inbound": [],
    "outbound": []
  } */

type ChannelStore = {
  // provider: string;
  channel: string;
  inbound: string;
  outbound: string;
};
/**
 *
 * @param store
 */
const formatExternalChannelStore = (externalChannelStore: {}): ChannelStore[] => {
  const providers = Object.values(externalChannelStore);
  const providerChannels = Object.values(providers).reduce(
    (acc: {}, curr: {}) => {
      const res = { ...acc, ...curr };
      return res;
    },
    []
  );

  const formattedProviderChannels = Object.entries(providerChannels).map(
    ([key, value]) => {
      const {
        inbound,
        outbound,
      }: { inbound: string; outbound: string } = value;
      return { channel: key, inbound, outbound };
    }
  );

  return formattedProviderChannels;
};

// __________________ exports _______________

export {
  onExternalProviderStoreUpdate,
  setChannel,
  setOrUpdateInboundChannel,
  setOrUpdateOutboundChannel,
};
