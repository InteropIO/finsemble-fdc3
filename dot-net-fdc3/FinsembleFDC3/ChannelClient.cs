namespace ChartIQ.Finsemble.FinsembleFDC3
{
	using Newtonsoft.Json.Linq;
	using Quobject.EngineIoClientDotNet.ComponentEmitter;
	using System;
	using System.Runtime.Remoting.Channels;

	public class ChannelClient : IChannel
	{
		internal const String ROUTER_FDC3_CHANNEL_BROADCAST = "FDC3.Channel.broadcast";
		internal const String ROUTER_FDC3_CHANNEL_GETCURRENTCONTEXT = "FDC3.Channel.getCurrentContext";
		internal const String FDC3_BROADCAST = "FDC3.broadcast";

		private Finsemble bridge;

		public String id { get; }

		public String type { get; }

		public DisplayMetadata displayMetadata { get; }

		DisplayMetadata IChannel.displayMetadata => throw new NotImplementedException();

		public ChannelClient(String id, String type, Finsemble bridge, DisplayMetadata displayMetadata)
		{
			this.id = id;
			this.type = type;
			this.bridge = bridge;
			this.bridge = bridge;
			this.displayMetadata = displayMetadata;
		}

		/// <summary>
		/// The broadcast.
		/// </summary>
		/// <param name="context">The context<see cref="JObject"/>.</param>
		public void broadcast(JObject context)
		{
			String windowName = this.bridge.WindowClient.windowIdentifier.GetValue("windowName").ToString();
			JObject param = new JObject() { 
				{ "source", windowName }, 
				{ "channel", this.id }, 
				{ context } 
			};
			this.bridge.RouterClient.Query(ROUTER_FDC3_CHANNEL_BROADCAST, param, (s, args) => { });
		}

		/// <summary>
		/// The broadcast.
		/// </summary>
		/// <param name="context">The context<see cref="JObject"/>.</param>
		public void getCurrentContext(String contextType, EventHandler<FinsembleEventArgs> responseHandler)
		{
			JObject param = new JObject { 
				{ "channel", this.id},
				{ contextType }
			};
			this.bridge.RouterClient.Query(ROUTER_FDC3_CHANNEL_GETCURRENTCONTEXT, param, responseHandler);
		}

		/// <summary>
		/// The broadcast.
		/// </summary>
		/// <param name="context">The context<see cref="JObject"/>.</param>
		public IListener addContextListener(String contextType, IContextHandler handler) {
			String windowName = this.bridge.WindowClient.windowIdentifier.GetValue("windowName").ToString();
			String theListenerName = "";

			if(contextType != null)
			{
				theListenerName = FDC3_BROADCAST + "." + contextType;
			} else
			{
				theListenerName = FDC3_BROADCAST;
			}

			if (this.id.Equals("global"))
			{
				EventHandler<FinsembleEventArgs> routerHandler = (sender, args) => {
					var response = (JObject)args.response;
					String source = ((JValue)response?["data"]?["source"])?.ToString();
					if (!source.Equals(windowName))
					{
						handler.handle((JObject)response?["data"]?["context"]);
					}
				};
				this.bridge.RouterClient.AddListener(theListenerName, routerHandler);
				return new RouterListener(this.bridge, theListenerName, routerHandler);
			}
			else
			{
				EventHandler<FinsembleEventArgs> linkerHandler = (sender, args) => {
					var response = (JObject)args.response;
					String source = ((JValue)response?["source"])?.ToString();
					if (!source.Equals(windowName))
					{
						handler.handle((JObject)response?["data"]?["context"]);
					}
				};
				this.bridge.LinkerClient.LinkToChannel(this.id, this.bridge.WindowClient.windowIdentifier, (sender, args) => { });

				this.bridge.LinkerClient.Subscribe(theListenerName, linkerHandler);
				return new LinkerListener(this.bridge, theListenerName, linkerHandler);
			}
		}
	}
}
