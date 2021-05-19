interface Params {
	id: string;
	type: string;
	displayMetadata: {};
	FSBL: typeof FSBL;
}
interface BroadcastData {
	source: string;
	channel: string;
	context: Context;
}
declare global {
	interface Window {
		FSBL: typeof FSBL;
	}
}

const win = window as Window;

export default class C implements Channel {
	id: string;
	type: string;
	displayMetadata?: DisplayMetadata;
	private contexts: { [contextType: string]: Context } = {};
	private currentContext: Context | null = null;
	#FSBL: typeof FSBL;

	constructor(params: Params) {
		this.id = params.id;
		this.type = params.type;
		this.displayMetadata = params.displayMetadata;
		this.#FSBL = win.FSBL || params.FSBL;
	}

	broadcast(data: BroadcastData): void {
		const { context } = data;
		const { type } = context;

		this.currentContext = data;
		this.contexts[context.type] = data;

		// Broadcast to listeners that are listening on specific contexts
		this.#FSBL.Clients.RouterClient.transmit(`FDC3.broadcast.${type}`, data);

		// Broadcast to listeners listening to everything on a channel
		this.#FSBL.Clients.RouterClient.transmit(`FDC3.broadcast`, data);
	}

	async getCurrentContext(contextType?: string): Promise<Context | null> {
		return contextType ? this.contexts[contextType] : this.currentContext;
	}

	addContextListener(handler: ContextHandler): Listener;
	addContextListener(contextType: string, handler: ContextHandler): Listener;
	addContextListener(contextTypeOrHandler: string | ContextHandler, handler?: ContextHandler): Listener {
		throw new Error("Method not implemented in service. You must use the client for this.");
	}
}
