import { onExternalProviderStoreUpdate, setChannel, setOrUpdateInboundChannel, setOrUpdateOutboundChannel } from '../src/components/fdc3ChannelMatcher/src/channelPatcher'

global.fdc3 = {
  getCurrentChannel: jest.fn(() => 'current channel'),
  getOrCreateChannel: jest.fn(channel => {
    const channelObj = {
      addContextListener: jest.fn((handler) => {
        return { unsubscribe: jest.fn(() => `${channel} unsubscribed`) }
      }),
      broadcast: jest.fn((context) => `broadcast: ${context}`)
    }
    return channelObj
  })
}




const externalChannelExample = {
  Company1: {
    "Group-A": {
      inbound: "Green", //indicate patch not set
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


function inboundListenerUnsubscribe() {
  const inbound = this.inbound
  jest.fn(() => `${inbound} unsubscribed`)
}
function outboundListenerUnsubscribe() {
  const outbound = this.outbound
  jest.fn(() => `${outbound} unsubscribed`)
}

const externalChannelState = {
  Company1: {
    "Group-A": {
      inbound: "null", //indicate patch not set
      outbound: "Red", //name of FDC channel
      inboundListener: {
        unsubscribe: inboundListenerUnsubscribe
      },
      outboundListener: {
        unsubscribe: outboundListenerUnsubscribe
      },
    },
    "Group-B": {
      inbound: "Green",
      outbound: "Blue",
      inboundListener: {
        unsubscribe: inboundListenerUnsubscribe
      },
      outboundListener: {
        unsubscribe: outboundListenerUnsubscribe
      }
    },
  },
  Company2: {
    Orange: {
      inbound: "Purple",
      outbound: undefined, //indicates patch not supported
      inboundListener: {
        unsubscribe: inboundListenerUnsubscribe
      },
      outboundListener: {
        unsubscribe: outboundListenerUnsubscribe
      }
    },
  }
};



test('broadcast example', () => {
  const a = fdc3.getOrCreateChannel('a')
  expect(a.broadcast('test')).toBe('broadcast: test');
})

test('addContextListener example', () => {
  const b = fdc3.getOrCreateChannel('b')
  const unsub = b.addContextListener('test').unsubscribe()
  expect(unsub).toBe(`b unsubscribed`);
})

test('getCurrentChannel example', () => {
  expect(fdc3.getCurrentChannel()).toEqual('current channel')
})


test('setOrUpdateInboundChannel ', async () => {
  const channel = fdc3.getOrCreateChannel('Group-A')
  const res = await setOrUpdateInboundChannel(channel, "Red")
  expect(res).toHaveProperty('unsubscribe');
});

test('setOrUpdateOutboundChannel ', async () => {
  const channel = fdc3.getOrCreateChannel('Group-B')
  const res = await setOrUpdateOutboundChannel(channel, "Red")
  expect(res).toHaveProperty('unsubscribe');
});

test('setChannel ', async () => {

  const provider = "Company1"
  const [channelName, channelValues] = Object.entries(externalChannelExample[provider])[0]
  const state = {
    ...externalChannelState
  }
  const res = await setChannel(provider, channelName, channelValues, state)
  expect(res).not.toBeNull()
  expect(res).toHaveProperty("inboundListener")
  expect(res).toHaveProperty("outboundListener")
});

test('onExternalProviderStoreUpdate', async () => {
  const res = await onExternalProviderStoreUpdate(externalChannelExample, externalChannelState)
  expect(res).not.toBeNull();
});

test.only('onExternalProviderStoreUpdate  - state is null', async () => {
  const res = await onExternalProviderStoreUpdate(externalChannelExample, {})
  console.log(await res)
  expect(res.Company1['Group-A'].outboundListener).toBeDefined();
})