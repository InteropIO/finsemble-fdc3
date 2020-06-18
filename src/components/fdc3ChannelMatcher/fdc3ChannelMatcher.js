import * as React from "react";
import * as ReactDOM from "react-dom";

import App from "./src/App";

function FinsembleReady() {
  ReactDOM.render(<App />, document.getElementById("fdc3ChannelMatcher"));
}

if (window.FSBL && FSBL.addEventListener) {
  FSBL.addEventListener("onReady", FinsembleReady);
} else {
  window.addEventListener("FinsembleReady", FinsembleReady);
}
