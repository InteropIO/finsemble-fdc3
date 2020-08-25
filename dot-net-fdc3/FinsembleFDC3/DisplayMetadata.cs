using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChartIQ.Finsemble.FinsembleFDC3
{
	public class DisplayMetadata
	{
		public string name { get; set; }
		public string color { get; set; }
		public string glyph { get; set; }

		public static DisplayMetadata FromJObject(JObject obj)
		{
			//convert JOBject to DisplayMetadata:
			return obj.ToObject<DisplayMetadata>();
		}

		public JObject ToJObject()
		{
			return JObject.FromObject(this);
		}

		public override String ToString() 
		{
			return ToJObject().ToString();
		}
	}
}
