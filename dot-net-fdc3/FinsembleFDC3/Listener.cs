using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChartIQ.Finsemble.FinsembleFDC3
{
	public interface IListener
	{
		void unsubscribe();
	}

	public class RouterListener : IListener
	{
		private Finsemble bridge;
		private String listenerName;
		private EventHandler<FinsembleEventArgs> routerHandler;
		public RouterListener(Finsemble bridge, String listenerName, EventHandler<FinsembleEventArgs> routerHandler)
		{
			this.bridge = bridge;
			this.listenerName = listenerName;
			this.routerHandler = routerHandler;
		}
		void IListener.unsubscribe()
		{
			this.bridge.RouterClient.RemoveListener(listenerName, routerHandler);
		}
	}

	public class LinkerListener : IListener
	{
		private Finsemble bridge;
		private String listenerName;
		private EventHandler<FinsembleEventArgs> linkerHandler;
		public LinkerListener(Finsemble bridge, String listenerName, EventHandler<FinsembleEventArgs> linkerHandler)
		{
			this.bridge = bridge;
			this.listenerName = listenerName;
			this.linkerHandler = linkerHandler;
		}
		void IListener.unsubscribe()
		{
			this.bridge.LinkerClient.Unsubscribe(listenerName, linkerHandler);
		}
	}

	public class ContextListener : IListener
	{
		private String contextHandlerId;
		private Dictionary<String, IContextTypeAndHandler> contextHandlers;
		public ContextListener (String contextHandlerId, Dictionary<String, IContextTypeAndHandler> contextHandlers)
		{
			this.contextHandlerId = contextHandlerId;
			this.contextHandlers = contextHandlers;
		}
		public void unsubscribe()
		{
			this.contextHandlers[this.contextHandlerId].listener.unsubscribe();
			this.contextHandlers.Remove(this.contextHandlerId);
		}
	}


}
