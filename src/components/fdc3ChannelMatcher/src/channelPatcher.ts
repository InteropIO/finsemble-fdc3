import { fdc3, Listener, Channel } from "../../../../FDC3-types";
import { rawListeners } from "process";
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
  const provider = "Fidessa"; // should this come from config?
  setProviderChannel(provider, { channelName: newChannel, inbound: null });

  // fdc3
  const channel = await fdc3.getOrCreateChannel(newChannel);
  const context = {};
  channel.broadcast(context);
  channel.addContextListener((newContext) => {
    // if the context is the same we do not need to run an update
    if (!equals(context, newContext)) return;
    // doSomethingHere(newContext)
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

//N.B. inbound indicates messages coming in from the external source and being repeated onto the indicated FDC3 channel
//outbound indicates messages coming from FDC3 and being sent out to the external source
//inbound and outbound values should be FDC3 system channel names, null if not set or undefined if not supported.

// const externalChannelsState: ExternalProviderState = {};

async function onExternalProviderStoreUpdate(
  distributedStoreValues,
  state: ExternalProviderState
): Promise<ExternalProviderState> {
  const provider = "Company1"; // TODO: switch this out for the provider name

  let providerState = { ...state };
  // const providers = Object.keys(distributedStoreValues);
  await Object.entries(distributedStoreValues[provider]).forEach(
    (channel): Promise<void> => {
      setChannel(provider, channel, externalChannelsState);
    }
  );
}

async function setChannel(
  provider: string,
  [channel, channelValues]: [string, ExternalChannelValues],
  state: ExternalProviderState
): Promise<ChannelListeners> {
  try {
    const { inbound, outbound } = channelValues;
    const thirdPartyChannel = await fdc3.getOrCreateChannel(`${channel}`);

    const channelState = state?.[provider]?.[channel];
    const inboundState = channelState.inbound;
    const outboundState = channelState.outbound;
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
    const outboundListener = outboundChannel.addContextListener((context) => {
      // TODO: does this need to check the current context the same way as the inbound

      thirdPartyChannel.broadcast(context);
    });

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

export { onExternalProviderStoreUpdate };
