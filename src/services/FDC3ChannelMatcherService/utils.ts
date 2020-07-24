/**
 *
 * 1) UI updates the store
 * 2) service updates the fdc3 channel
 * 3) all system channels can have a contextListener
 */

/**
 * 1) add listeners for all system channels
 * 2) add listeners for all provider fdc3_channels
 * 3) when context comes through then get the channels matched to the channel from "state" and
 * broadcast to those on the list
 * 4) do the same as step 3 but for the other way round
 */


{
  "Fidessa_FCI": {
    "Fidessa_FCI_Yellow": {
      "inbound": "group1",
        "inboundListener": '',
          "outbound": null
    }
  },
  "Bloomberg": {
    "Bloomberg_Group-A": {
      "inbound": "group1",
        "outbound": "group1"
    }
  }
}




let { err, data: store2 } = await FSBL.Clients.DistributedStoreClient.createStore({
  store: "FDC3ToExternalChannelPatches",
  global: true,
  persist: true,
  values: {},
}, (err, newStore) => newStore)



store2.setValue({
  field: 'providers', value: {
    "Fidessa_FCI": {
      "Fidessa_FCI_Yellow": {
        "inbound": "group1",
        "outbound": null
      }
    },
    "Bloomberg": {
      "Bloomberg_Group-A": {
        "inbound": "group1",
        "outbound": "group1"
      }
    }
  }
})


store2.addListener({ field: 'providers' }, console.log)


store2.setValue({
  field: 'providers.Bloomberg', value: {
    "Bloomberg_Group-A": {
      "inbound": "group2",
      "outbound": "group1"
    }
  }
})


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
  externalChannelsState: ExternalProviderState
): Promise<ExternalProviderState> {
  const [thirdPartyProviderName, thirdPartyProviderChannels] = Object.entries(
    distributedStoreValues
  )[0];

  const providerChannelList = Object.entries(thirdPartyProviderChannels);

  const updatedChannelValues = providerChannelList.map(
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
  const settlePromises = await Promise.all(updatedChannelValues);
  // The promises return an array of objects that need to be merged back to one object.
  const formatReturnedValues = settlePromises.reduce(
    (acc, curr) => ({ ...acc, ...curr }),
    {}
  );

  const newState = { [thirdPartyProviderName]: await formatReturnedValues };

  return newState;
}

// /**
//  *
//  * @param thirdPartyProvider "Company Name"
//  * @param channelName "e.g. Group A or Yellow"
//  * @param channelValues "inbound and outbound"
//  * @param state "current state to compare against, matches the store value closely"
//  */
// async function setChannel(
//   thirdPartyProvider: string,
//   channelName: string,
//   channelValues: ExternalChannelValues & ChannelListeners,
//   state: ExternalProviderState
// ): Promise<ChannelListeners> {
//   try {
//     const { inbound, outbound } = channelValues;
//     const thirdPartyChannel = await fdc3.getOrCreateChannel(`${channelName}`);

//     const channelState = state?.[thirdPartyProvider]?.[channelName];
//     const inboundState = channelState?.inbound;
//     const outboundState = channelState?.outbound;
//     let inboundListener: Listener = channelValues?.inboundListener;
//     let outboundListener: Listener = channelValues?.outboundListener;

//     if (inbound && !equals(inbound, inboundState)) {
//       channelState?.inboundListener.unsubscribe();
//       inboundListener = await setOrUpdateInboundChannel(
//         thirdPartyChannel,
//         inbound
//       );
//     }

//     if (outbound && !equals(outbound, outboundState)) {
//       channelState?.outboundListener.unsubscribe();
//       outboundListener = await setOrUpdateOutboundChannel(
//         thirdPartyChannel,
//         outbound
//       );
//     }

//     return { inboundListener, outboundListener };
//   } catch (error) {
//     console.error(error);
//     return error;
//   }
// }


/**
 *
 * @param thirdPartyProvider "Company Name"
 * @param channelName "e.g. Group A or Yellow"
 * @param channelValues "inbound and outbound"
 * @param state "current state to compare against, matches the store value closely"
 */
async function setProviderChannelsInboundOutbound(
  thirdPartyProviderName: string,
  thirdPartyProviderChannelName: string,
  thirdPartyProviderChannel: ProviderChannel,
  state: any
): void {
  try {
    const { inbound, outbound } = thirdPartyProviderChannel;

    const fdc3ThirdPartyChannel = await fdc3.getOrCreateChannel(`${thirdPartyProviderChannelName}`);

    const channelState = state.providers?.[thirdPartyProviderName]?.[thirdPartyProviderChannelName];

    const inboundState = channelState?.inbound;
    const outboundState = channelState?.outbound;

    let inboundListener: Listener = thirdPartyProviderChannel?.inboundListener;
    let outboundListener: Listener = thirdPartyProviderChannel?.outboundListener;

    if (inbound && inbound !== inboundState)) {
      channelState?.inboundListener.unsubscribe();
      inboundListener = await setOrUpdateInboundChannel(
        fdc3ThirdPartyChannel,
        inbound
      );
    }

    if (outbound && outbound !== outboundState) {
      channelState?.outboundListener.unsubscribe();
      outboundListener = await setOrUpdateOutboundChannel(
        fdc3ThirdPartyChannel,
        outbound
      );
    }

    // update the state here rather than returning the listener
    // return { inboundListener, outboundListener };
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
      async (context: Context) => inboundChannel.broadcast(context)
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
      async (context: Context) => thirdPartyChannel.broadcast(context)
    );

    return outboundListener;
  } catch (error) {
    console.error(error);
    return error;
  }
}
