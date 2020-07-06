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

    //disambiguate arguments
    if (typeof contextTypeOrHandler === "string") {
      theHandler = handler;
      theListenerName = `FDC3.broadcast.${contextTypeOrHandler}`
    } else {
      theHandler = contextTypeOrHandler;
      theListenerName = `FDC3.broadcast`;
    }

    if (this.id == "global") {
      const routerHandler: StandardCallback = (err, response) => {
        //prevent message loops
        if (response.data.source != this.#FSBL.Clients.WindowClient.getWindowIdentifier().windowName) {
          //delete response.data.source // delete non standard source field we added
          theHandler(response.data.context);
        }
      };
      this.#FSBL.Clients.RouterClient.addListener(theListenerName, routerHandler);
      return {
        unsubscribe: () => {
          this.#FSBL.Clients.RouterClient.removeListener(theListenerName, routerHandler);
        }
      }
    } else {
      const linkerHandler: StandardCallback = (err, response) => {
        //prevent message loops
        if (response.source != this.#FSBL.Clients.WindowClient.getWindowIdentifier().windowName) {
          //delete response.source // delete non standard source field we added
          theHandler(response.data.context);
        }
      };
      this.#FSBL.Clients.LinkerClient.linkToChannel(this.id, this.#FSBL.Clients.WindowClient.getWindowIdentifier());
      this.#FSBL.Clients.LinkerClient.subscribe(theListenerName, linkerHandler);
      return {
        unsubscribe: () => {
          this.#FSBL.Clients.LinkerClient.unsubscribe(theListenerName, linkerHandler);
        }
      }
    }
  }

}