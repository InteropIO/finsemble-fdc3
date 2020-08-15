import React from "react";
import ReactDOM from "react-dom";
import Apps from "./components/Apps";
import Intents from "./components/Intents";
import Channels from "./components/Channels";

function FDC3Tester() {
	return (
		<div>
			<header>
				<img src="https://fdc3.finos.org/img/fdc3-icon-2019.svg" />
				<h1>
					FDC3 Testing Component
				</h1>
			</header>
			<Apps></Apps>
			<Intents></Intents>
			<Channels></Channels>
		</div>
	);
}

// render component when FSBL is ready.
const FSBLReady = () => {
	ReactDOM.render(
		<FDC3Tester />,
		document.getElementById("FDC3Tester-component-wrapper")
	);
};

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady);
} else {
	window.addEventListener("FSBLReady", FSBLReady);
}
