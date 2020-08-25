using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChartIQ.Finsemble.FinsembleFDC3
{
	public interface IChannel
	{
		String id { get; }
		String type { get; }
		DisplayMetadata displayMetadata { get; }
		void broadcast(JObject context);
		void getCurrentContext(String contextType, EventHandler<FinsembleEventArgs> cb);
		IListener addContextListener(String contextType, IContextHandler handler);
	}
}
