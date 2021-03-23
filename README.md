# Finsemble FDC3 1.1

- [Finsemble FDC3 1.1](#finsemble-fdc3-11)
- [Intro to FDC3](#intro-to-fdc3)
- [Getting Started](#getting-started)
  - [Installation](#installation)
    - [Quick Install Steps](#quick-install-steps)
  - [Using FDC3 in Finsemble](#using-fdc3-in-finsemble)
    - [FDC3 in Finsemble Components](#fdc3-in-finsemble-components)
      - [Component Config](#component-config)
        - [Preload](#preload)
        - [Toolbar Icon URL](#toolbar-icon-url)
        - [FDC3 configuration](#fdc3-configuration)
    - [FDC3 in Finsemble Services](#fdc3-in-finsemble-services)
  - [API](#api)
    - [App](#app)
    - [Context](#context)
    - [Intents](#intents)
    - [Channels](#channels)
  - [Example use cases:](#example-use-cases)
  - [FDC3 in Finsemble Dot-Net Components](#fdc3-in-finsemble-dot-net-components)
    - [Dot-Net API](#dot-net-api)
      - [Dot-Net App](#dot-net-app)
      - [Dot-Net Context](#dot-net-context)
      - [Dot-Net Intents](#dot-net-intents)
      - [Dot-Net Channels](#dot-net-channels)

# Intro to FDC3

Welcome to the Finsemble FDC3 implementation. For those not familiar with FDC3 here is a summary taken from their
charter:

> The mission of the Financial Desktop Connectivity and Collaboration Consortium (FDC3) is to develop specific protocols
> and taxonomies to advance the ability of desktop applications in financial workflows to interoperate in a
> plug-and-play fashion, without prior bi-lateral agreements. They aim to do this by

The FDC3 revolves around a few core concepts; Apps, Intents and Context. Apps - These are the applications that
participate in FDC3. You can launch these applications and send data. Intents - These are the verbs, what you would like
to do e.g. _Launch a chart application_ Context - The noun, this is the data you want to share with other applications,
they will in turn use this.

A good example putting all this together looks like this:

> Open (_intent_) a Chart (_app_) and send an instrument (_context_).

The Finsemble FDC3 implementation is comprised of four parts:

- Component Config
- Preload
- Client
- Service

# Getting Started

## Installation

By following the 6 steps below you will be able to start working with FDC3 inside your Finsemble Components / Services.

**How it works:**

The project's watch script monitors the project for any changes in the _src_ directory or config file. When folders or
files are updated, added or removed the change will automatically be reflected in the Finsemble Seed Project. Source
files are from this project's _src_ directory are synced to matching locations in the Finsemble Seed project, while the
content of the _finsemble.config.json_ file is added to the seed project's _configs/application/config.json_ file.

#### Quick Install Steps

1. Clone the Finsemble [seed-project](https://github.com/ChartIQ/finsemble-seed) (if you don't already have a local
   version - see our [Getting Started Tutorial](https://www.chartiq.com/tutorials/?slug=finsemble))
2. `npm install react-syntax-highlighter @types/react @types/react-syntax-highlighter` in the seed project
3. Clone this repo
   - **our advice:** clone this repo to the same directory as the seed-project e.g _myfolder/finsemble-seed_ &
     _myfolder/finsemble-fdc3_
4. If you clone in a different location, open **finsemble.config.json** and update `seedProjectDirectory` with the path
   to your local Finsemble Seed Project.
5. Inside this project run `npm install` then run `npm run watch` **Note:** The watch script will continue to monitor
   this project for file changes. If you do not need it to, it can be stopped once all the files have been copied to the
   seed project (which takes approx. 30 seconds).
6. Follow the instructions on how to add the FDC3 to your [Component](###-FDC3-in-Finsemble-Components) /
   [Service](###FDC3-in-Finsemble-Services):

## Using FDC3 in Finsemble

The Finsemble implementation of the FDC3 DesktopAgent and Channels APIs can be used in both Finsemble Components and
Services.

### FDC3 in Finsemble Components

The FDC3 client is most easily made available to your components via preload, which will give your component access to
it as if it were any other Finsemble client. It is anticipated that later versions of Finsemble will include the FDC3
client by default.

#### Component Config

To use the FDC3 client in your component, you will need to make 3 additions to your component's configuration:

- Preload the client,
- Ensure that you have a Toolbar Icon URL set
- Add FDC3 specific configuration

##### Preload

To add the FDC3 preload to your component, set `component.preload` in its configuration to the path to the built preload
script, e.g. `"$applicationRoot/preloads/FDC3Client.js"`, or if using multiple preload scripts add it to an array of
their paths (see the config example below).

##### Toolbar Icon URL

The icon url is used by the intent resolver to display the logo of your component. This URL can use the
`$applicationRoot` variable to set a local path or can be an external URL. Supported formats: `.jpg`, `.png`, `.svg`.

##### FDC3 configuration

An additional section in your component config, `foreign.services.fdc3`, is used to specify intents and associated
context types that your component can accept. See the section **fdc3** in the example below.

Example:

```
{
  "FDC3 Component": {
    "window": {},
    "component": {
      "preload": [
        "$applicationRoot/preloads/FDC3Client.js"
				]
    },
    "foreign": {
      "services": {
        "fdc3": {
          "intents": [
            {
              "name": "StartCall",
              "displayName": "Call",
              "contexts": [
                "fdc3.contact"
              ]
            }
          ]
        }
      },
      "components": {
        "Toolbar": {
          "iconURL": "$applicationRoot/assets/img/Finsemble_Taskbar_Icon.png"
        }
      }
    }
  }
}
```

### FDC3 in Finsemble Services

The Finsemble FDC3 client may also be used in Finsemble services, where it is imported into the service implementation.
Please see our [exampleFDC3Service](./src/services/testFDC3) for an example of how to structure your service to work
with FDC3.

## API

Please note that the FINOS FDC3 website provides documentation for the
[Desktop Agent](https://fdc3.finos.org/docs/1.1/api/ref/DesktopAgent) and
[Channel](https://fdc3.finos.org/docs/1.1/api/ref/Channel) APIs. The main API calls are also detailed here for
convenience.

### App

<table>
<thead>
<tr>
  <th>API</th><th>Description</th><th>Example</th>
</tr>
</thead>
<tbody>
<tr>
  <td> <code>open(name: string, context?: Context): Promise&lt;void></code> </td>
  <td>Open a component and optionally send context for it to use. Name relates to a Finsemble Component type such as "Welcome Component"</td>
  <td><code>fdc3.open('ChartIQ Chart')</code></td>
</tr>
</tbody>
</table>

<br/>

### Context

<table>
<thead>
<tr>
  <th>API</th><th>Description</th><th>Example</th>
</tr>
</thead>
<tbody>
<tr>
  <td><code>broadcast(context: Context): void</code></td>
  <td>Send context to the channel the app is currently join to. We default applications to join on the Global Channel.</td>
  <td><code>fdc3.broadcast({
        type: 'fdc3.instrument',
        name: 'Microsoft',
        id: {
                ticker: 'MSFT'
        }
})</code></td>
</tr>

<tr>
  <td>
  <code>addContextListener(handler: ContextHandler): Listener;
  addContextListener(contextType: string, handler: ContextHandler): Listener;</code>
  </td>
  <td>Listen to broadcast context on the channel the app is currently join to. We default applications to join on the Global Channel.</td>
  <td><code>fdc3.addContextListener({
        type: 'fdc3.instrument',
        name: 'Microsoft',
        id: {
                ticker: 'MSFT'
        }
},context => {context.type === 'fdc3.instrument'})</code> </td>
</tr>
</tbody>
</table>

<br/>

### Intents

<table>
<thead>
<tr>
  <th>API</th><th>Description</th><th>Example</th>
</tr>
</thead>
<tbody>
<tr>
  <td><code>findIntent(intent: string, context?: Context): Promise&lt;AppIntent>;</code></td>
  <td>List all the applications that can deal with a certain intent.</td>
  <td><code>fdc3.findIntent("ViewChart")</code></td>
</tr>

<tr>
  <td><code>findIntentsByContext(context: Context): Promise&lt;Array&lt;AppIntent>>;</code></td>
  <td>List all the applications that can deal with a certain context.</td>
  <td><code>fdc3.findIntentsByContext({ type: "fdc3.instrument" })</code></td>
</tr>

<tr>
  <td><code>raiseIntent(intent: string, context: Context, target?: string): Promise<IntentResolution>;</code></td>
  <td>Open an application by name and optionally pass context to be used by that app.</td>
  <td><code>fdc3.raiseIntent("ViewInstrument", {
        type: 'fdc3.instrument',
        name: 'Microsoft',
        id: {
                ticker: 'MSFT'
        }
});</code></td>
</tr>

<tr>
  <td><code>addIntentListener(intent: string, handler: ContextHandler): Listener;</code></td>
  <td>Add this to your component so that it can action intents when they are sent.</td>
  <td><code>fdc3.addIntentListener(
"ViewChart",
context => { //do something here  }
)</code></td>
</tr>
</tbody>
</table>

<br/>

### Channels

The DesktopAgent API will allow you to join, listen to and broadcast context to a single 'channel' via its API. However,
you can also interact directly with FDC3 channels, which have the following interface:

```javascript
interface Channel {
	// properties
	id: string;
	type: string;
	displayMetadata?: DisplayMetadata;

	// methods
	broadcast(context: Context): void;
	getCurrentContext(contextType?: string): Promise<Context | null>;
	addContextListener(handler: ContextHandler): Listener;
	addContextListener(contextType: string, handler: ContextHandler): Listener;
}
```

<table>
<thead>
<tr>
  <th>API</th><th>Description</th><th>Example</th>
</tr></thead>
<tbody>
<tr>
  <td> <code> getOrCreateChannel(channelId: string): Promise&lt;Channel></code> </td>
  <td>If the channel does not exist it will be created.</td>
  <td><code>fdc3.getOrCreateChannel("channel1")</code></td>
</tr>
<tr>
  <td> <code>getSystemChannels(): Promise&lt;Array&lt;Channel>></code> </td>
  <td>List all the system channels including the "global" channel.</td>
  <td><code>fdc3.getSystemChannels()</code></td>
</tr>
<tr>
  <td> <code>joinChannel(channelId: string): Promise&lt;void></code> </td>
  <td>Join a channel by using it's name. If the channel is not found it will Error. <b>You can only join one channel at a time.</b> </td>
  <td><code>fdc3.joinChannel('channel1')</code></td>
</tr>
<tr>
  <td> <code>getCurrentChannel(): Promise&lt;Channel></code> </td>
  <td>Returns the channel that you are currently joined to.</td>
  <td><code>fdc3.getCurrentChannel()</code></td>
</tr>
<tr>
  <td> <code>leaveCurrentChannel(): Promise&lt;void></code> </td>
  <td>Leave the channel that you are currently joined to.</td>
  <td><code>fdc3.leaveCurrentChannel()</code></td>
</tr>
</tbody>
</table>

## Example use cases:

> When a user clicks on the chart button I want to open my ChartIQ Chart, how would I do this?

There is a simple command for this! `fdc3.open("ChartIQ")`

> My Chart opens but now I need to send instrument data to it, what do I need to do next?

The fdc3.open call allows you to send context with it too. Here is an example of opening the chart and sending the GOOGL
(Google) ticker symbol to it.

```javascript
fdc3.open("ChartIQ", {
	type: "fdc3.instrument",
	name: "Google",
	id: {
		ticker: "GOOGL",
	},
});
```

> I want to send an instrument (MSFT) but I want the user to choose the application they want to display it with, how
> would I do that?

This is where you can raise an intent. Once the intent has been raised it will show all the apps capable of dealing with
your intent in the intent resolver. This works in a similar fashion to your phone when you want to share a link or open
a calendar invite and it asks which application you would like to use. To do this you need two things

1. A Finsemble component that has been set up to accept your intent (you can read the section on config above to do
   this).
2. Your component to have a button or event to run the following code

```javascript
const instrument = {
	type: "fdc3.instrument",
	name: "Microsoft",
	id: { ticker: "MSFT" },
};
fdc3.raiseIntent("ViewInstrument", instrument);
```

Once executed Finsemble will display the Intent Resolver UI, a modal type component to display the apps that can accept
your intent. The rest is dealt with by your end-user.

> I made an application that can be opened by the Intent Resolver via raiseIntent but I don't see my data updating, how
> do I get the data when it's sent?
>
> When you develop your application you will need to add one or more intent listeners for each intent that your
> application can be used with.
> `const listener = fdc3.addIntentListener('ViewInstrument', context => { // view instrument has been requested by another application });`

> Is there a way I can find out intents in advance so that if there are no applications that accept my intent I can do
> something else with a user request?
>
> Yes. You have two options to find intents, you can
> `fdc3.findIntent("ViewChart", context); //context object is optional` OR `fdc3.findIntentsByContext(context);`

> I don't want to use the intent resolver each time I want to send context (data) between components, is there another
> way?
>
> FDC3 1.1 introduces the Channels API. You can connect your components to a channel either programmatically or user-led
> via the Finsemble Linker. Channels then allow you to share context between them. A single application (component) can
> only join one channel at a time e.g it cannot join the purple and the yellow channel, if the user tries to do this
> they will be removed from the last channel joined. You can however programmatically listen to as many channels as you
> like from your application. Many applications can be joined to a single-channel e.g App A, B and C can all be joined
> by the purple channel.

> What do I need to do to enable the channels so that my end users can start using it?
>
> Finsemble includes user interface for selecting built-in (or system) color channels, normally used with the Finsemble
> Linker API. The Finsemble FDC3 implementation, if preloaded into a component, will take over the Linker UI allowing
> you to use it select FDC3 system channels instead. All you need to do is add the FDC3 preload to your component then
> set up a [context listener](#context-listener) and Finsemble will handle the rest. Your end-users can now use the
> Finsemble Linker button to change the FDC3 channel they are joined to.

> How do I know what channels I have access to?
>
> You can list the available System channels (including a global channel) by doing the following:
> `const systemChannels = await fdc3.getSystemChannels(); // Array of System Channels`

> Am I limited to just your Finsemble Linker channels?
>
> No. You can add as many channels as you like, try it by using `const Channel = fdc3.getOrCreateChannel("myChannel")`

> You mentioned programmatically sending context (data) over channels how do I do that?
>
> If you want to send context via the channel that you are currently joined to you can do the following:

```javascript
const instrument = {
	type: "fdc3.instrument",
	id: { ticker: "MSFT" },
};
fdc3.broadcast(instrument);
```

If you want to send context to a channel you are not joined to you need to get the channel first.

```javascript
try {
  const myChannel = await fdc3.getOrCreateChannel("myChannel");

  const instrument = {
    type: 'fdc3.instrument',
    id: { ticker: 'MSFT' }
    };

  const myChannel.broadcast(instrument);

} catch (err){
  //app could not register the channel
};
```

> Now I have sent context (data) how do I listen for it?

It depends on if you want to listen for context on the channel you are joined to or a different channel(s).

If you are joined to a channel you can use the following:

```javascript
// any context
const listener = fdc3.addContextListener(context => { ... });

// listener for a specific type
const contactListener = fdc3.addContextListener('fdc3.contact', contact => { ... });
```

If you want to listen to a specific channel you need to get it first like this:

```javascript
try {

  const myChannel = await fdc3.getOrCreateChannel("myChannel");
  const myChannel.addContextListener(context => {});

} catch (err){
  //app could not register the channel
};
```

> Is there a list of default context types?
>
> Yes, you can find a list of FDC3 context types here [https://fdc3.finos.org/docs/1.1/context/overview](). FDC3 context
> types start with "fdc3.".

> What if the default FDC3 context types don't fit with my data structure?
>
> You will need to create a custom context type. The only value required is the type(see below).

_Note: When broadcasting a custom context type the receiving application will need to know the content and structure of
the context you are sending._

```
interface Context {
    type: string;
    name?: string;
    id?: {
        [x:string]: string;
    },
    [x: string]: any;
}
```

An example of a finsemble custom type may look like this:

```
{
  "type": "com.finsemble.chart",
  "name": "Microsoft Mountain Chart",
  "settings": [
    {
      "type": "chart",
      "chartType": "mountain",
      "studies": [
        "bollinger",
        "ab"
      ],
      "instrument": [
        {
          "type": "fdc3.instrument",
          "name": "Microsoft",
          "id": {
            "ticker": "MSFT"
          }
        }
      ]
    }
  ]
}
```

## FDC3 in Finsemble Dot-Net Components

You can use FDC3 in your dot-net application. The
[finsemble-dotnet-seed](https://github.com/ChartIQ/finsemble-dotnet-seed) project provides a WPF Example on how to
enable FDC3 support in dot-net application.

To enable FDC3 in you Dot-Net components, in you dot-net component config set <code>component.useFdc3</code> to
<code>true</code>. You can find example in the <code>wfpExample.json</code>

### Dot-Net API

#### Dot-Net App

<table>
<thead>
<tr>
  <th>API</th><th>Description</th><th>Example</th>
</tr>
</thead>
<tbody>
<tr>
  <td> <code>void open(String name, JObject context, EventHandler < JObject > cb)</code> </td>
  <td>Open a component and optionally send context for it to use. Name relates to a Finsemble Component type such as "Welcome Component"</td>
  <td><code>FSBL.FDC3Client.fdc3.open('ChartIQ Chart')</code></td>
</tr>
</tbody>
</table>

<br/>

#### Dot-Net Context

<table>
<thead>
<tr>
  <th>API</th><th>Description</th><th>Example</th>
</tr>
</thead>
<tbody>
<tr>
  <td><code>void broadcast(JObject context);</code></td>
  <td>Send context to the channel the app is currently join to. We default applications to join on the Global Channel.</td>
  <td><code>FSBL.FDC3Client.fdc3.open(componentName, new JObject
					{
						["type"] = "fdc3.instrument",
						["name"] = "AAPL",
						["id"] = new JObject
						{
							["ticker"] = "AAPL"
						}
					}, (s, args) => { });</code></td>
</tr>

<tr>
  <td>
  <code>IListener addContextListener(String contextType, EventHandler< JObject > handler);

IListener addContextListener(EventHandler< JObject > handler);</code>

  </td>
  <td>Listen to broadcast context on the channel the app is currently join to. We default applications to join on the Global Channel.</td>
  <td><code>
FSBL.FDC3Client.fdc3.addContextListener((s, context) => {});
FSBL.FDC3Client.fdc3.addContextListener("fdc3.instrument", (s, context) => {});</code> </td>
</tr>
</tbody>
</table>

<br/>

#### Dot-Net Intents

<table>
<thead>
<tr>
  <th>API</th><th>Description</th><th>Example</th>
</tr>
</thead>
<tbody>
<tr>
  <td><code>void findIntent(String intent, JObject context, EventHandler< JObject > cb);

void findIntent(String intent, EventHandler< JObject > cb);</code></td>

  <td>List all the applications that can deal with a certain intent.</td>
  <td><code>FSBL.FDC3Client.fdc3.findIntent("ViewChart", (s, intent) =>{ });</code></td>
</tr>

<tr>
  <td><code>void findIntentsByContext(JObject context, EventHandler< JArray > cb);</code></td>
  <td>List all the applications that can deal with a certain context.</td>
  <td><code>FSBL.FDC3Client.fdc3.findIntentsByContext(new JObject{
						["type"] = "fdc3.instrument"
					}, (s, intents) =>
					{
					}
					);</code></td>
</tr>

<tr>
  <td><code>void raiseIntent(String intent, JObject context, EventHandler< JObject > cb);</code></td>
  <td>Open an application by name and optionally pass context to be used by that app.</td>
  <td><code>FSBL.FDC3Client.fdc3.raiseIntent("ViewChart", new JObject
					{
						["type"] = "fdc3.instrument",
						["name"] = "AAPL",
						["id"] = new JObject
						{
							["ticker"] = "AAPL"
						}
					}, (s, args) => { });</code></td>
</tr>

<tr>
  <td><code>IListener addIntentListener(String intent, EventHandler< JObject > handler);</code></td>
  <td>Add this to your component so that it can action intents when they are sent.</td>
  <td><code>FSBL.FDC3Client.fdc3.addIntentListener("ViewChart", (s, context) => { });</code></td>
</tr>
</tbody>
</table>

<br/>

#### Dot-Net Channels

The DesktopAgent API will allow you to join, listen to and broadcast context to a single 'channel' via its API. However,
you can also interact directly with FDC3 channels, which have the following interface:

```c#
public interface IChannel
{
  String id { get; }
  String type { get; }
  DisplayMetadata displayMetadata { get; }
  void broadcast(JObject context);
  void getCurrentContext(String contextType, EventHandler<JObject> cb);
  IListener addContextListener(EventHandler<JObject> handler);
  IListener addContextListener(String contextType, EventHandler<JObject> handler);
}
```

<table>
<thead>
<tr>
  <th>API</th><th>Description</th><th>Example</th>
</tr></thead>
<tbody>
<tr>
  <td> <code>void getOrCreateChannel(String channelId, EventHandler< IChannel > cb);</code> </td>
  <td>If the channel does not exist it will be created.</td>
  <td><code>FSBL.FDC3Client.fdc3.getOrCreateChannel("channel1", (s, args) => { });</code></td>
</tr>
<tr>
  <td> <code>void getSystemChannels(EventHandler< List< IChannel > > cb);</code> </td>
  <td>List all the system channels including the "global" channel.</td>
  <td><code>FSBL.FDC3Client.fdc3.getSystemChannels((s, channelList) => {});</code></td>
</tr>
<tr>
  <td> <code>void joinChannel(String channelId);</code> </td>
  <td>Join a channel by using it's name. If the channel is not found it will Error. <b>You can only join one channel at a time.</b> </td>
  <td><code>FSBL.FDC3Client.fdc3.joinChannel("group1");</code></td>
</tr>
<tr>
  <td> <code>IChannel getCurrentChannel(EventHandler< IChannel > cb);</code> </td>
  <td>Returns the channel that you are currently joined to.</td>
  <td><code>FSBL.FDC3Client.fdc3.getCurrentChannel((s, channel) => {});</code></td>
</tr>
<tr>
  <td> <code>void leaveCurrentChannel(EventHandler< JObject > cb);</code> </td>
  <td>Leave the channel that you are currently joined to.</td>
  <td><code>FSBL.FDC3Client.fdc3.leaveCurrentChannel((s, args) => {});</code></td>
</tr>
</tbody>
</table>
