import React from "react";
import ReactDOM from "react-dom";


import App from './src/App'

function FinsembleReady() {
  ReactDOM.render(
    <App />
    , document.getElementById("app"));
}

if (window.FSBL && FSBL.addEventListener) {
  FSBL.addEventListener("onReady", FinsembleReady);
} else {
  window.addEventListener("FinsembleReady", FinsembleReady)
}
