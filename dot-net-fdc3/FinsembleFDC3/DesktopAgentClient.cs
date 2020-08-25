namespace ChartIQ.Finsemble.FinsembleFDC3
{
	using Newtonsoft.Json.Linq;
	using System;
	using System.Collections.Generic;
	using System.Threading.Tasks;

	public class DesktopAgentClient : IDesktopAgent
	{
		internal const String FDC3_DESKTOPAGENT_FINDINTENT = "FDC3.DesktopAgent.findIntent";

		internal const String FDC3_DESKTOPAGENT_FINDINTENTBYCONTEXT = "FDC3.DesktopAgent.findIntentsByContext";

		internal const String FDC3_DESKTOPAGENT_RAISEINTENT = "FDC3.DesktopAgent.raiseIntent";

		internal const String FDC3_INTENT = "FDC3.intent";

		internal const String FDC3_DESKTOPAGENT_GETORCREATECHANNEL = "FDC3.DesktopAgent.getOrCreateChannel";

		internal const String FDC3_DESKTOPAGENT_GETSYSTEMCHANNELS = "FDC3.DesktopAgent.getSystemChannels";

		public IChannel currentChannel { get; set; }

		internal Dictionary<String, IContextTypeAndHandler> contextHandlers;

		internal Boolean channelChanging { get; set; }

		internal Boolean strict;

		internal FDC3Client fdc3Client;

		internal Finsemble bridge;

		internal JObject spawnData;

		internal JArray allLinkerChannel;

		public DesktopAgentClient(Boolean strict, FDC3Client fdc3Client, Finsemble bridge)
		{
			this.strict = strict;
			this.fdc3Client = fdc3Client;
			this.bridge = bridge;
			this.bridge.WindowClient.getSpawnData(handleSpawnData);
			this.bridge.LinkerClient.GetAllChannels(handleAllLinkerChannels);
		}

		/// <summary>
		/// The handleSpawnData.
		/// </summary>
		/// <param name="sender">The sender<see cref="Object"/>.</param>
		/// <param name="res">The res<see cref="FinsembleEventArgs"/>.</param>
		internal void handleSpawnData(Object sender, FinsembleEventArgs res)
		{
			this.spawnData = (JObject)res.response;
		}

		internal void handleAllLinkerChannels(Object sender, FinsembleEventArgs res)
		{
			this.allLinkerChannel = (JArray) res.response;
		}

		/// <summary>
		/// The wait.
		/// </summary>
		/// <param name="number">The number<see cref="int"/>.</param>
		/// <param name="cb">The cb<see cref="EventHandler{FinsembleEventArgs}"/>.</param>
		public void wait(int number, EventHandler<FinsembleEventArgs> cb)
		{
			var task = Task.Run(() => cb(this, new FinsembleEventArgs(null, new JObject())));
			task.Wait(TimeSpan.FromSeconds(number));
		}

		/// <summary>
		/// The open.
		/// </summary>
		/// <param name="name">The name<see cref="String"/>.</param>
		/// <param name="context">The context<see cref="JObject"/>.</param>
		/// <param name="cb">The cb<see cref="EventHandler{FinsembleEventArgs}"/>.</param>
		public void open(String name, JObject context, EventHandler<FinsembleEventArgs> cb)
		{
			JObject linkerParam = null;
			if (!this.currentChannel.id.Equals("global"))
			{
				linkerParam = new JObject { { "channels", this.currentChannel.id } };
			}

			JObject param = new JObject {
				{ "data",  new JObject {
					{ "fdc3", context},
					{ "linker", linkerParam}
				}}
			};
			this.bridge.LauncherClient.Spawn(name, param, cb);
		}

		/// <summary>
		/// The boardcast.
		/// </summary>
		/// <param name="context">The context<see cref="JObject"/>.</param>
		public void broadcast(JObject context)
		{
			if (this.currentChannel is object)
			{
				this.currentChannel.broadcast(context);
			}
		}

		/// <summary>
		/// The addContextListener.
		/// </summary>
		/// <param name="contextType">The contextType<see cref="String"/>.</param>
		/// <param name="handler">The handler<see cref="IContextHandler"/>.</param>
		/// <returns>The <see cref="IListener"/>.</returns>
		public IListener addContextListener(String contextType, IContextHandler handler)
		{
			JObject context = (JObject)this.spawnData?["fdc3"]?["context"];

			IListener contextListener = null;
			if (this.currentChannel is object)
			{
				contextListener = this.currentChannel.addContextListener(contextType, handler);
				if (context is object)
				{
					handler.handle(context);
				}
			}

			String currentUnixTime = (DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1))).TotalSeconds.ToString();
			Random random = new Random();
			String contextHandlerId = currentUnixTime + "_" + random.NextDouble();
			ContextTypeAndHandler tempContextTypeAndHandler = new ContextTypeAndHandler(contextType, handler, contextListener);
			contextHandlers.Add(contextHandlerId, tempContextTypeAndHandler);

			return new ContextListener(contextHandlerId, contextHandlers);
		}

		/// <summary>
		/// The findIntent.
		/// </summary>
		/// <param name="intent">The intent<see cref="String"/>.</param>
		/// <param name="context">The context<see cref="JObject"/>.</param>
		/// <param name="cb">The cb<see cref="EventHandler{FinsembleEventArgs}"/>.</param>
		public void findIntent(String intent, JObject context, EventHandler<FinsembleEventArgs> cb)
		{
			JObject param = new JObject {
				{ intent },
				{ context }
			};
			this.bridge.RouterClient.Query(FDC3_DESKTOPAGENT_FINDINTENT, param, cb);
		}

		/// <summary>
		/// The findIntentsByContext.
		/// </summary>
		/// <param name="context">The context<see cref="JObject"/>.</param>
		/// <param name="cb">The cb<see cref="EventHandler{FinsembleEventArgs}"/>.</param>
		public void findIntentsByContext(JObject context, EventHandler<FinsembleEventArgs> cb)
		{
			JObject param = new JObject {
				{ context }
			};
			this.bridge.RouterClient.Query(FDC3_DESKTOPAGENT_FINDINTENTBYCONTEXT, param, cb);
		}

		/// <summary>
		/// The raiseIntent.
		/// </summary>
		/// <param name="intent">The intent<see cref="String"/>.</param>
		/// <param name="context">The context<see cref="JObject"/>.</param>
		/// <param name="target">The target<see cref="String"/>.</param>
		/// <param name="cb">The cb<see cref="EventHandler{FinsembleEventArgs}"/>.</param>
		public void raiseIntent(String intent, JObject context, String target, EventHandler<FinsembleEventArgs> cb)
		{
			JObject param = new JObject {
				{ intent },
				{ context },
				{ target }
			};
			this.bridge.RouterClient.Query(FDC3_DESKTOPAGENT_RAISEINTENT, param, cb);
		}

		/// <summary>
		/// The addIntentListener.
		/// </summary>
		/// <param name="intent">The intent<see cref="String"/>.</param>
		/// <param name="handler">The handler<see cref="IContextHandler"/>.</param>
		/// <returns>The <see cref="IListener"/>.</returns>
		public IListener addIntentListener(String intent, IContextHandler handler)
		{
			EventHandler<FinsembleEventArgs> routerHandler = (sender, args) =>
			{
				var data = (JObject)args.response?["data"];
				handler.handle(data);
			};

			if (intent.Equals(this.spawnData?["fdc3"]?["intent"]?["name"]))
			{
				handler.handle((JObject)this.spawnData?["fdc3"]?["context"]);
			}

			this.bridge.RouterClient.AddListener(FDC3_INTENT + "." + intent, routerHandler);
			return new RouterListener(this.bridge, FDC3_INTENT + "." + intent, routerHandler);
		}

		/// <summary>
		/// The getOrCreateChannel.
		/// </summary>
		/// <param name="channelID">The channelID<see cref="String"/>.</param>
		/// <param name="cb">The cb<see cref="EventHandler{FinsembleEventArgs}"/>.</param>
		public void getOrCreateChannel(String channelID, EventHandler<IChannel> cb)
		{
			JObject param = new JObject {
				{ channelID }
			};
			EventHandler<FinsembleEventArgs> createChannelHandler = (sender, args) =>
			{
				String tempId = args.response?["data"]?["id"].ToString();
				String tempType = args.response?["data"]?["type"].ToString();
				DisplayMetadata tempDisplayMetadata = DisplayMetadata.FromJObject((JObject)args.response?["data"]?["displayMetadata"]);
				IChannel channel = new ChannelClient(tempId, tempType, this.bridge, tempDisplayMetadata);
				cb(this, channel);
			};

			this.bridge.RouterClient.Query(FDC3_DESKTOPAGENT_GETORCREATECHANNEL, param, createChannelHandler);
		}

		/// <summary>
		/// The getSystemChannels.
		/// </summary>
		/// <param name="cb">The cb<see cref="EventHandler{FinsembleEventArgs}"/>.</param>
		public void getSystemChannels(EventHandler<List<IChannel>> cb)
		{
			EventHandler<FinsembleEventArgs> getSystemChannelHandler = (sender, args) =>
			{
				List<IChannel> channels = new List<IChannel>();
				JArray tempChannelArray = (JArray)args.response?["data"];
				foreach(JObject tempChannelObj in tempChannelArray.Children())
				{
					String tempId = tempChannelObj?["id"].ToString();
					String tempType = tempChannelObj?["type"].ToString();
					DisplayMetadata tempDisplayMetadata = DisplayMetadata.FromJObject((JObject)tempChannelObj?["displayMetadata"]);
					IChannel tempChannel = new ChannelClient(tempId, tempType, this.bridge, tempDisplayMetadata);
					channels.Add(tempChannel);
				}
				cb(this, channels);
			};
			this.bridge.RouterClient.Query(FDC3_DESKTOPAGENT_GETSYSTEMCHANNELS, null, getSystemChannelHandler);
		}

		/// <summary>
		/// The joinChannel.
		/// </summary>
		/// <param name="channelId">The channelId<see cref="String"/>.</param>
		public void joinChannel(String channelId)
		{
			EventHandler<IChannel> joinChannelCb = (sender, channel) =>
			{
				this.currentChannel = channel;
				foreach (KeyValuePair<String, IContextTypeAndHandler> pair in this.contextHandlers)
				{
					IListener tempListener = this.currentChannel.addContextListener(pair.Value.contextType, pair.Value.handler);
					pair.Value.listener = tempListener;
				}

				if (!channelId.Equals("global"))
				{
					this.bridge.LinkerClient.LinkToChannel(channel.id, this.bridge.WindowClient.windowIdentifier, (s, args)=> { });
				}

				if (this.channelChanging)
				{
					this.channelChanging = false;
				}
			};

			EventHandler<FinsembleEventArgs> leaveChannelCb = (sender, args) =>
			{
				this.getOrCreateChannel(channelId, joinChannelCb);
			};

			if (this.currentChannel is object && this.currentChannel.id.Equals(channelId))
				return;

			if (!this.strict)
			{
				if (this.allLinkerChannel.IndexOf(channelId) > -1)
					return;
			}

			String oldChannel = null;
			if(this.currentChannel is object)
			{
				oldChannel = this.currentChannel.id;
				this.channelChanging = true;
				this.leaveCurrentChannel(leaveChannelCb);
			}
		}

		/// <summary>
		/// The leaveCurrentChannel.
		/// </summary>
		public void leaveCurrentChannel(EventHandler<FinsembleEventArgs> cb)
		{
			if (this.currentChannel is object)
			{
				String channelId = this.currentChannel.id;
				this.currentChannel = null;
				foreach (KeyValuePair<String, IContextTypeAndHandler> pair in contextHandlers)
				{
					pair.Value.listener.unsubscribe();
					pair.Value.listener = null;
				}

				if (!channelId.Equals("global"))
				{
					this.bridge.LinkerClient.UnlinkFromChannel(channelId, this.bridge.WindowClient.windowIdentifier, (s, args)=>{ });
					this.wait(50, (s, args) => { cb(this, null); });
				}
			}
			else
			{
				return;
			}
		}

		/// <summary>
		/// The getCurrentChannel.
		/// </summary>
		/// <param name="cb">The cb<see cref="EventHandler{IChannel}"/>.</param>
		public void getCurrentChannel(EventHandler<IChannel> cb)
		{
			cb(this, this.currentChannel);
		}
	}
}
