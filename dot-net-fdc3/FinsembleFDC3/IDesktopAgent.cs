using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChartIQ.Finsemble.FinsembleFDC3
{
	public interface IDesktopAgent
	{
		void open(String name, JObject context, EventHandler<FinsembleEventArgs> cb);
		void findIntent(String intent, JObject context, EventHandler<FinsembleEventArgs> cb);
		void findIntentsByContext(JObject context, EventHandler<FinsembleEventArgs> cb);
		void broadcast(JObject context);
		void raiseIntent(String intent, JObject context, String target, EventHandler<FinsembleEventArgs> cb);
		IListener addIntentListener(String intent, IContextHandler handler);
		IListener addContextListener(String contextType, IContextHandler handler);
		void getSystemChannels(EventHandler<List<IChannel>> cb);
		void joinChannel(String channelId);
		void getOrCreateChannel(String channelId, EventHandler<IChannel> cb);
		void leaveCurrentChannel(EventHandler<FinsembleEventArgs> cb);
		void getCurrentChannel(EventHandler<IChannel> cb);
	}
}
