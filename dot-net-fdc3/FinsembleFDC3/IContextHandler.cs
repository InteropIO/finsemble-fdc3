namespace ChartIQ.Finsemble.FinsembleFDC3
{
	using Newtonsoft.Json.Linq;
	using System;

	public interface IContextHandler
	{
		/// <summary>
		/// The handle.
		/// </summary>
		/// <param name="context">The context<see cref="JObject"/>.</param>
		void handle(JObject context);
	}

	public interface IContextTypeAndHandler
	{
		String contextType { get; set; }

		IContextHandler handler { get; set; }

		IListener listener { get; set; }
	}

	public class ContextTypeAndHandler : IContextTypeAndHandler
	{
		public string contextType { get; set; }

		public IContextHandler handler { get; set; }

		public IListener listener { get; set; }

		public ContextTypeAndHandler(String contextType, IContextHandler handler, IListener listener)
		{
			this.contextType = contextType;
			this.handler = handler;
			this.listener = listener;
		}
	}
}
