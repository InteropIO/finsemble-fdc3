declare global {
	interface Window {
		FSBL: typeof FSBL
	}
}

const win = window as Window;
export default class C implements Channel {
	id: string;
	type: string;
	displayMetadata?: DisplayMetadata;
	#FSBL: any;
	constructor(params: any) {
		this.id = params.id;
		this.type = params.type;
		this.displayMetadata = params.displayMetadata;
		this.#FSBL = win.FSBL || params.FSBL
	}

	broadcast(context: object): void {
		this.#FSBL.Clients.RouterClient.query(`FDC3.broadcast.${(context as any).type}`, {
			source: this.#FSBL.Clients.WindowClient.getWindowIdentifier().windowName, //used to prevent message loops
			channel: this.id,
			context
		}, () => { });
		this.#FSBL.Clients.RouterClient.query("FDC3.Channel.broadcast", {
			source: this.#FSBL.Clients.WindowClient.getWindowIdentifier().windowName, //used to prevent message loops
			channel: this.id,
			context
		}, () => { });
	}

	async getCurrentContext(contextType?: string): Promise<object> {
		const { err, response } = await this.#FSBL.Clients.RouterClient.query("FDC3.Channel.getCurrentContext", {
			channel: this.id,
			contextType
		}, () => { });
		if (err) {
			throw (err);
		} else {
			return response.data;
		}
	}

	addContextListener(handler: ContextHandler): Listener;
	addContextListener(contextType: string, handler: ContextHandler): Listener;
	addContextListener(contextTypeOrHandler: string | ContextHandler, handler?: ContextHandler): Listener {
		let theHandler: ContextHandler = null;
		let theListenerName: string = null;
		const currentWindowName = this.#FSBL.Clients.WindowClient.getWindowIdentifier().windowName

		//disambiguate arguments
		if (typeof contextTypeOrHandler === "string") {
			theHandler = handler;
			theListenerName = `FDC3.broadcast.${contextTypeOrHandler}`
		} else {
			theHandler = contextTypeOrHandler;
			theListenerName = `FDC3.broadcast`;
		}

		//only send the context data on if it did not get broadcast from this window
		const messageLoopPrevention = (_arg1: string | Error | null, { data }) =>
			data.source !== currentWindowName && theHandler(data.context)


		if (this.id == "global") {

			this.#FSBL.Clients.RouterClient.addListener(theListenerName, messageLoopPrevention);

			return {
				unsubscribe: () => {
					this.#FSBL.Clients.RouterClient.removeListener(theListenerName, messageLoopPrevention);
				}
			}

		} else {

			this.#FSBL.Clients.LinkerClient.linkToChannel(this.id, this.#FSBL.Clients.WindowClient.getWindowIdentifier());
			this.#FSBL.Clients.LinkerClient.subscribe(theListenerName, messageLoopPrevention);

			return {
				unsubscribe: () => {
					this.#FSBL.Clients.LinkerClient.unsubscribe(theListenerName, messageLoopPrevention);
				}
			}

		}
	}

}