using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChartIQ.Finsemble.FinsembleFDC3
{
	public class FDC3Client
	{
		internal const String FDC3_DESKTOPAGENT_GETSYSTEMCHANNELS = "FDC3.DesktopAgent.getSystemChannels";

		private Boolean strict = true;
		private List<DesktopAgentClient> desktopAgents = new List<DesktopAgentClient>();
		private Dictionary<String, DesktopAgentClient> desktopAgentsByChannel = new Dictionary<String, DesktopAgentClient>();
		private Finsemble bridge;

		public FDC3Client(Finsemble bridge)
		{
			this.bridge = bridge;
			


		}

		public DesktopAgentClient getOrCreateDesktopAgent(String channel)
		{
			// Only one desktop agent in strict mode
			//if (this.#strict && this.desktopAgents.length) {
			//await win.fdc3.joinChannel(channel);
			//return win.fdc3;

			// If the agent already exists, return it
			if (!this.desktopAgentsByChannel[channel].Equals(null))
			{
				return this.desktopAgentsByChannel[channel];
			}

			// If a desktop agent does not exist, create one
			DesktopAgentClient desktopAgent = new DesktopAgentClient(this.strict, this, this.bridge);
			desktopAgent.joinChannel(channel);
			this.desktopAgentsByChannel.Add(channel, desktopAgent);
			this.desktopAgents.Add(desktopAgent);


		}
	

		public void broadcast(JObject context)
		{
			foreach (DesktopAgentClient desktopAgent in desktopAgents)
			{
				desktopAgent.broadcast(context);
			}
		}

		public void getSystemChannels(EventHandler<List<IChannel>> cb)
		{
			EventHandler<FinsembleEventArgs> getSystemChannelHandler = (sender, args) =>
			{
				List<IChannel> channels = new List<IChannel>();
				JArray tempChannelArray = (JArray)args.response?["data"];
				foreach (JObject tempChannelObj in tempChannelArray.Children())
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
	}
}
