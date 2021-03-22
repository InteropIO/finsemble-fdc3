const Finsemble = require("@finsemble/finsemble-core");

const FDC3Client = require('../FDC3/FDC3Client').default
Finsemble.Clients.Logger.start();
Finsemble.Clients.Logger.log("TestFDC3 Service starting up");

// NOTE: LinkerClient, DistributedStoreClient and WindowClient need to be initialized for FDC3
Finsemble.Clients.DistributedStoreClient.initialize();
Finsemble.Clients.LinkerClient.initialize();
Finsemble.Clients.WindowClient.initialize();

class testFDC3Service extends Finsemble.baseService {

	constructor() {
		super({
			// Declare any client dependencies that must be available before your service starts up.
			startupDependencies: {
				// When ever you use a client API with in the service, it should be listed as a client startup
				// dependency. Any clients listed as a dependency must be initialized at the top of this file for your
				// service to startup.
				clients: [
					"distributedStoreClient",
					"linkerClient",
					"windowClient",
				]
			}
		});
		this.onBaseServiceReady(this.readyHandler);
	}

	/**
	 * Fired when the service is ready for initialization
	 * @param {function} callback
	 */
	readyHandler = (callback) => {
		Finsemble.Clients.Logger.log("TestFDC3 Service ready");
		this.fdc3Ready(this.fdc3Example)
		callback();
	}

	/**
	 * Initialize FDC3 - wait for fdc3 to be ready
	 * @param  {...function} fns - functions to be executed when fdc3 is ready
	 */
	fdc3Ready = (...fns) => {
		// the window.FSBL object needs to exist before instantiating
		window.FSBL = {};
		window.FSBL.Clients = Finsemble.Clients;
		this.FDC3Client = new FDC3Client(Finsemble);
		// once FDC3 is ready run all the functions that have been passed to the ready function
		window.addEventListener("fdc3Ready", () => fns.map(fn => fn()));
	}

	/**
	 * Examples of how to use fdc3 inside of a service
	 */
	async fdc3Example() {
		// example of logging out the system channels
		const systemChannels = fdc3.getSystemChannels()
		Finsemble.Clients.Logger.log("system channels", systemChannels)

		// example of listening to context on group1 (channel 1 "purple")
		const group1 = await fdc3.getOrCreateChannel("group1")

		group1.addContextListener(context => Finsemble.Clients.Logger.log("context received from group1", context))

		// example of broadcasting to a custom channel
		const fdc3ExampleChannel = await fdc3.getOrCreateChannel("fdc3ExampleChannel")

		const instrument = {
			type: 'fdc3.instrument',
			name: "Facebook",
			id: {
				ticker: 'FB'
			}
		};

		fdc3ExampleChannel.broadcast(instrument)
		Finsemble.Clients.Logger.log("broadcasting instrument", instrument)
	}

}

const serviceInstance = new testFDC3Service();

serviceInstance.start();
module.exports = serviceInstance;
