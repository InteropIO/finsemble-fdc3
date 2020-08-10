import produce from "immer"
import './FDC3ChannelMatcherTypes'
import '../FDC3/interfaces/Channel'
import '../FDC3/interfaces'
const Finsemble = require("@chartiq/finsemble");
const FDC3Client = require("../FDC3/FDC3Client").default;

const { Logger, DistributedStoreClient, LinkerClient } = Finsemble.Clients;

Finsemble.Clients.Logger.start();
Finsemble.Clients.Logger.log("FDC3ChannelMatcher Service starting up");
LinkerClient.start(() => { });
// Add and initialize any other clients you need to use (services are initialized by the system, clients are not):
// Finsemble.Clients.AuthenticationClient.initialize();
// Finsemble.Clients.ConfigClient.initialize();
// Finsemble.Clients.DialogManager.initialize();
Finsemble.Clients.DistributedStoreClient.initialize();
// Finsemble.Clients.DragAndDropClient.initialize();
// Finsemble.Clients.LauncherClient.initialize();
Finsemble.Clients.LinkerClient.initialize();
// Finsemble.Clients.HotkeyClient.initialize();
// Finsemble.Clients.SearchClient.initialize();
// Finsemble.Clients.StorageClient.initialize();
Finsemble.Clients.WindowClient.initialize();
// Finsemble.Clients.WorkspaceClient.initialize();

// NOTE: When adding the above clients to a service, be sure to add them to the start up dependencies.

/**
 * TODO: Add service description here
 */
class FDC3ChannelMatcher extends Finsemble.baseService {
  providerState: any;
  /**
   * Initializes a new instance of the FDC3ChannelMatcher class.
   */
  constructor() {
    super({
      // Declare any service or client dependencies that must be available before your service starts up.
      startupDependencies: {
        // If the service is using another service directly via an event listener or a responder, that service
        // should be listed as a service start up dependency.
        services: [
          "FDC3",
          // "assimilationService",
          // "authenticationService",
          // "configService",
          // "hotkeysService",
          // "loggerService",
          "linkerService",
          // "searchService",
          // "storageService",
          // "windowService",
          // "workspaceService"
        ],
        // When ever you use a client API with in the service, it should be listed as a client startup
        // dependency. Any clients listed as a dependency must be initialized at the top of this file for your
        // service to startup.
        clients: [
          // "authenticationClient",
          // "configClient",
          // "dialogManager",
          "distributedStoreClient",
          // "dragAndDropClient",
          // "hotkeyClient",
          // "launcherClient",
          // "linkerClient",
          // "searchClient
          // "storageClient",
          // "windowClient",
          // "workspaceClient",
        ],
      },
    });
    // needed for fdc3 to attach to the window object


    this.providerState = { providers: {} };
    this.readyHandler = this.readyHandler.bind(this);
    this.channelMatcherStoreSetup = this.channelMatcherStoreSetup.bind(this)
    this.onExternalProviderStoreUpdate = this.onExternalProviderStoreUpdate.bind(this)
    this.fdc3Ready = this.fdc3Ready.bind(this);
    this.onBaseServiceReady(this.readyHandler);
  }

  /**
   * Fired when the service is ready for initialization
   * @param {function} callback
   */
  readyHandler(callback) {
    this.createRouterEndpoints();
    Finsemble.Clients.Logger.log("TestFDC3 Service ready");
    this.fdc3Ready()
    callback();
  }

  fdc3Ready() {
    window.FSBL = {};
    FSBL.Clients = Finsemble.Clients;
    // window.FSBL = { Clients: Finsemble.Clients }
    this.FDC3Client = new FDC3Client(Finsemble);
    window.addEventListener("fdc3Ready", this.channelMatcherStoreSetup); // ensure FDC3 is ready as ChannelMatcherStoreSetup relies on fdc3
  }

  async channelMatcherStoreSetup() {

    //EXAMPLE STORE:
    // const store: ThirdPartyProviders = {
    //   "providers": {
    //     "CompanyA": {
    //       "CompanyA_FCI_Yellow": {
    //         inbound: "group1",
    //         outbound: null
    //       }
    //     },
    //     "CompanyB": {
    //       "CompanyB_Group-A": {
    //         inbound: "group1",
    //         outbound: "group1"
    //       }
    //     }
    //   }
    // }


    const storeParams = {
      store: "FDC3ToExternalChannelPatches",
      global: true,
      persist: true,
      values: { providers: {} },
    };

    const callback = (err: any, store: any) => {
      if (err) {
        Logger.error(err);
        return;
      }
      if (store) {
        this.store = store
        // this.providerState = store.values
        Logger.log("FDC3ToExternalChannelPatches store created: " + store);
      }
    };

    // try and get the store, if it does not exist then set it up
    const { data: store } = await DistributedStoreClient.getStore(storeParams, (err: any, store: any) => {
      if (err || !store) Logger.warn("FDC3ToExternalChannelPatches store not found trying to create the store...")
    });

    if (store) {
      this.store = store
    } else {
      // do not destructure the distributed store as it breaks the reference to this
      const { err, data: store } = await DistributedStoreClient.createStore(storeParams, callback);

      if (store) this.store = store

      if (err) {
        Logger.error("error creating FDC3ToExternalChannelPatches store " + err)
        return err
      }
    }


    this.store.addListener({ field: 'providers' }, (err: string, result: { field: string, value: any }) => {
      if (err) {
        Logger.error("Issue with returning data from FDC3ToExternalChannelPatches listener" + err)
        return err
      }
      this.onExternalProviderStoreUpdate(result.value)
    },
      Logger.log("FDC3ToExternalChannelPatches store listener added")
    )

  }

  onExternalProviderStoreUpdate(thirdPartyProvider: Provider) {

    const updateProviderChannel = async (providerName: string, channelName: string, channelValues: ProviderChannel) => {
      try {
        const { inbound = null, outbound = null } = channelValues
        const { inboundListener, outboundListener } = await this.setFDC3ProviderChannel(providerName, channelName, channelValues, this.providerState)

        // update state
        const newState = produce(this.providerState, draftState => {
          // if the provider does not exist in state add it as an empty object
          if (!draftState.providers?.[providerName]) {
            draftState.providers[providerName] = {}
          }
          // update the provider channel in state
          draftState.providers[providerName][channelName] = {
            inbound,
            outbound,
            inboundListener,
            outboundListener
          }
        })
        this.providerState = newState

      } catch (error) {
        Logger.error('could not add or update the external provider. ' + error)
      }

    }

    const providers: [string, ProviderChannels][] = Object.entries(thirdPartyProvider)
    providers.forEach(([providerName, providerChannels]) => {
      // find the channel(s) that have updated / changed and then update the fdc3channel and state
      console.log([providerName, providerChannels])
      Object.entries(providerChannels)
        .filter(([providerChannelName, { inbound, outbound }]) => {
          // check to see if the values have been updated since last time
          const channelState = this.providerState.providers?.[providerName]?.[providerChannelName];
          const inboundState = channelState?.inbound;
          const outboundState = channelState?.outbound;

          if (inbound !== inboundState || outbound !== outboundState) return true

        })
        .forEach(async ([providerChannelName, channelValues]) =>
          await updateProviderChannel(providerName, providerChannelName, channelValues)
        )

      // TODO: When FDC3 adds a method to remove channels, add the ability to remove channel listeners
    })
  }

  async setFDC3ProviderChannel(providerName: string,
    providerChannelName: string,
    providerChannel: ProviderChannel,
    state: any): Promise<{ inboundListener: Listener, outboundListener: Listener }> {

    try {
      const { inbound, outbound } = providerChannel;

      const channelState = state.providers?.[providerName]?.[providerChannelName];

      // set defaults for inbound and outbound listeners
      let inboundListener: Listener = channelState?.inboundListener;
      let outboundListener: Listener = channelState?.outboundListener;


      inboundListener = inbound &&
        await setFDC3ChannelCommunication({
          receivingChannelName: providerChannelName,
          broadcastingChannelName: inbound,
          receivingChannelListener: inboundListener
        })


      outboundListener = outbound &&
        await setFDC3ChannelCommunication({
          receivingChannelName: outbound,
          broadcastingChannelName: providerChannelName,
          receivingChannelListener: outboundListener
        })


      return { inboundListener, outboundListener };
    } catch (error) {
      Logger.error("Error setting up FDC3 Provider Channel. " + error);
      return;
    }

    /**
     *
     * Set the channel that listens to fdc3 context via receivingChannel and send it on via broadcastingChannel
     */
    async function setFDC3ChannelCommunication(
      { receivingChannelName, broadcastingChannelName, receivingChannelListener }: { receivingChannelName: string, broadcastingChannelName: string, receivingChannelListener: Listener }
    ): Promise<Listener | null> {
      try {
        // check for channels that are not set - this can be possible as inbound / outbound can be null (not supported)
        if (receivingChannelName && broadcastingChannelName) {

          receivingChannelListener && receivingChannelListener.unsubscribe()

          const receivingChannel = await fdc3.getOrCreateChannel(receivingChannelName)
          const broadcastingChannel = await fdc3.getOrCreateChannel(broadcastingChannelName)
          console.log(`${receivingChannelName} will listen to incoming and then ${broadcastingChannelName} will broadcast it on`)

          // proxy the calls from one channel to another
          const listener = await receivingChannel.addContextListener(
            async (context: Context) => {
              console.group();
              console.log(`recievingChannel: ${receivingChannelName} && broadcastingChannel: ${broadcastingChannelName} --- context: `)
              console.log(receivingChannel)
              console.log(broadcastingChannel)
              console.log(context)
              console.groupEnd()
              await broadcastingChannel.broadcast(context)
            }
          );

          return listener;
        }
        return null
      } catch (error) {
        Logger.error(error);
        return;
      }
    }

  }

  /**
   * Creates a router endpoint for you service.
   * Add query responders, listeners or pub/sub topic as appropriate.
   */
  createRouterEndpoints() {
    // Add responder for myFunction
    Finsemble.Clients.RouterClient.addResponder(
      "TestFDC3.myFunction",
      (err, message) => {
        if (err) {
          return Finsemble.Clients.Logger.error(
            "Failed to setup TestFDC3.myFunction responder",
            err
          );
        }

        Finsemble.Clients.Logger.log(
          "TestFDC3 Query: " + JSON.stringify(message)
        );
      }
    );
  }
}

const serviceInstance = new FDC3ChannelMatcher();

serviceInstance.start();
module.exports = serviceInstance;
