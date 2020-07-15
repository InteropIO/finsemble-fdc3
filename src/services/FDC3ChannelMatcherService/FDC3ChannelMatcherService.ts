const Finsemble = require("@chartiq/finsemble");
const FDC3Client = require("../FDC3/FDC3Client").default;

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
    this.channelState = {};
    this.readyHandler = this.readyHandler.bind(this);
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
    this.ChannelMatcherStoreSetup();
    this.fdc3Ready();
    callback();
  }

  ChannelMatcherStoreSetup() {
    // ! check to see if store exists first, if not create it

    //   store = {
    //     "providers": {
    //         "Fidessa_FCI": {
    //             "Fidessa_FCI_Yellow": {
    //                 "inbound": "group1",
    //                 "outbound": null;
    //         },
    //         "Bloomberg": {
    //             "Bloomberg_Group-A": {
    //                 "inbound": "group1",
    //                 "outbound": "group1";
    //             }
    //         }
    //     }
    //  }

    // store.setValue({ field:'providers.Fidessa_FCI.Fidessa_FCI_Yellow', value:{ "inbound": "group1", outbound": null } });



    //FSBL.Clients.DistributedStoreClient.createStore({store:"testStore", global:true, persist: true, values:{mappings:[]}}, (err,store) => window.store=store)
    const storeParams = {
      store: "FDC3ToExternalChannelPatches",
      global: true,
      persist: true,
      values: {},
    };

    // store.getValue('mappings', function(err, mappings) { /* do somethign with mappings  */ });

    const callback = (err: any, store: any) => {
      if (err) {
        error(err);
        return;
      }

      log("FDC3ToExternalChannelPatches store created: " + store);
      store.addListener(
        this.onExternalProviderStoreUpdate(),
        log("FDC3ToExternalChannelPatches store listener added")
      );
    };

    // do not destructure the distributed store as it breaks the reference to this
    DistributedStoreClient.createStore(storeParams, callback);
  }

  /**
   *
   * @param distributedStoreValues "FSBL Distributed store used by third party "
   * @param state "state used to compare changes against and to store listeners"
   *
   * Inbound indicates messages coming in from the external source and being forwarded onto the indicated FDC3 channel.
   * Outbound indicates messages coming from FDC3 and being sent out to the external source.
   * inbound and outbound values should be FDC3 system channel names, null if not set or undefined if not supported.
   */
  async onExternalProviderStoreUpdate(
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
  // ------ end

  // add any functionality that requires FDC3 in here
  fdc3Ready() {
    this.FDC3Client = new FDC3Client(Finsemble);
    window.FSBL = {};
    FSBL.Clients = Finsemble.Clients;

    window.addEventListener("fdc3Ready", async () => {
      const channelName = "myFDC3Channel";
      const contextExample = {
        type: "fdc3.instrument",
        id: { ticker: "MSFT" },
      };

      const channel = await fdc3.getOrCreateChannel(channelName);

      // ? use this if you want to send data
      channel.broadcast(contextExample);

      // ? use this if you want to listen to incoming data
      channel.addContextListener((context) => { });
    });
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
