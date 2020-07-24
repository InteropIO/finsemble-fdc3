import produce from "immer"
import './FDC3ChannelMatcherTypes'
import '../FDC3/interfaces/Channel'
import '../FDC3/interfaces'
const Finsemble = require("@chartiq/finsemble");
const FDC3Client = require("../FDC3/FDC3Client").default;
new FDC3Client(Finsemble);

const { Logger, DistributedStoreClient } = Finsemble.Clients;
const { log, error } = Logger;

Finsemble.Clients.Logger.start();
Finsemble.Clients.Logger.log("FDC3ChannelMatcher Service starting up");

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
          "FDC3Service",
          // "assimilationService",
          // "authenticationService",
          // "configService",
          // "hotkeysService",
          // "loggerService",
          // "linkerService",
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
          "linkerClient",
          // "searchClient
          // "storageClient",
          "windowClient",
          // "workspaceClient",
        ],
      },
    });
    // needed for fdc3 to attach to the window object
    window.FSBL = { Clients: Finsemble.Clients }

    this.providersState = {};
    this.readyHandler = this.readyHandler.bind(this);
    this.ChannelMatcherStoreSetup = this.ChannelMatcherStoreSetup.bind(this)
    this.updateProviderChannelState = this.updateProviderChannelState.bind(this)
    this.onBaseServiceReady(this.readyHandler);
  }

  /**
   * Fired when the service is ready for initialization
   * @param {function} callback
   */
  readyHandler(callback) {
    this.createRouterEndpoints();
    Finsemble.Clients.Logger.log("TestFDC3 Service ready");
    window.addEventListener("fdc3Ready", this.ChannelMatcherStoreSetup); // ensure FDC3 is ready as ChannelMatcherStoreSetup relies on fdc3
    callback();
  }

  async ChannelMatcherStoreSetup() {
    // TODO: check to see if store exists first, if not create it

    //EXAMPLE STORE:
    // const store: ThirdPartyProviders = {
    //   "providers": {
    //     "Fidessa_FCI": {
    //       "Fidessa_FCI_Yellow": {
    //         inbound: "group1",
    //         outbound: null
    //       }
    //     },
    //     "Bloomberg": {
    //       "Bloomberg_Group-A": {
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
      } else {
        Logger.log("FDC3ToExternalChannelPatches store created: " + store);
      }
    };

    // try and get the store, if it does not exist then set it up
    const { data: store } = await DistributedStoreClient.getStore({
      store: "FDC3ToExternalChannelPatches"
    }, callback);

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


    store.addListener({ field: 'providers' }, (err: string, result: { field: string, value: any }) => {
      if (err) {
        Logger.error("Issue with returning data from FDC3ToExternalChannelPatches listener" + err)
        return err
      }
      this.onExternalProviderStoreUpdate(result)
    },
      log("FDC3ToExternalChannelPatches store listener added")
    )

  }

  onExternalProviderStoreUpdate(result: { field: string; value: any; }) {
    const { field, value: thirdPartyProviders }: { field: string, value: ThirdPartyProviders } = result;

    const updateProviderChannel = async (providerName: string, channelName: string, channelValues: ProviderChannel) => {
      try {
        const { inbound = null, outbound = null } = channelValues
        const { inboundListener, outboundListener } = await this.setFDC3ProviderChannel(providerName, channelName, channelValues, this.state)

        // update state
        const newState = produce(this.providersState, draftState => {
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

    const providers: [string, ProviderChannels][] = Object.entries(thirdPartyProviders.providers)
    providers.forEach(([providerName, providerChannels]) => {
      Object.entries(providerChannels)
        .forEach(([channelName, channelValues]) =>
          updateProviderChannel(providerName, channelName, channelValues)
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

      const fdc3ThirdPartyChannel: Channel = await fdc3.getOrCreateChannel(`${providerChannelName}`);

      const channelState = state.providers?.[providerName]?.[providerChannelName];

      const inboundState = channelState?.inbound;
      const outboundState = channelState?.outbound;
      // set defaults for inbound and outbound listeners
      let inboundListener: Listener = channelState?.inboundListener;
      let outboundListener: Listener = channelState?.outboundListener;

      if (inbound && (inbound !== inboundState)) {
        // unsubscribe before setting up a new listener
        if (inboundListener) inboundListener.unsubscribe()

        inboundListener = await setOrUpdateInboundChannel(
          fdc3ThirdPartyChannel,
          inbound
        );
      }

      if (outbound && (outbound !== outboundState)) {
        // unsubscribe before setting up a new listener
        if (outboundListener) outboundListener.unsubscribe()

        outboundListener = await setOrUpdateOutboundChannel(
          fdc3ThirdPartyChannel,
          outbound
        );
      }

      return { inboundListener, outboundListener };
    } catch (error) {
      Logger.error(error);
      return;
    }


    // create the fdc3 channel and add a listener
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
        Logger.error(error);
        return;
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

        try {
          // Data in query message can be passed as parameters to a method in the service.
          const data = this.myFunction(message.data);

          // Send query response to the function call, with optional data, back to the caller.
          message.sendQueryResponse(null, data);
        } catch (e) {
          // If there is an error, send it back to the caller
          message.sendQueryResponse(e);
        }
      }
    );
  }
}

const serviceInstance = new FDC3ChannelMatcher();

serviceInstance.start();
module.exports = serviceInstance;
