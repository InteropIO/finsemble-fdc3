import React from "react";
import ReactDOM from "react-dom";
import Menu from './components/BurgerMenu'
import Apps from "./Apps";
import Intents from "./Intents";
import Channels from "./Channels";
import Context from "./Context";

const launchIntent = () => {
	const intent = "fdc3.instrument"
	const context = { "type": "fdc3.contact", "id": { "ticker": "AAPL" } }
	fdc3.raiseIntent(intent, context)
}

let addXTestersDynamically = async (x) => {
	FSBL.Clients.ConfigClient.getValue({ field: 'finsemble.components.["FDC3Tester"]' }, (err, componentConfig) => {

		let newComponents = new Array(5).fill(null)
		let res = newComponents.map((comp, index) => ({ field: `finsemble.components.FDC3Tester${index}`, value: componentConfig }))

		FSBL.Clients.ConfigClient.setValues(res);

		console.log(res);
	})
}

function FDC3Tester() {
	return (
		<div>
			<Menu />
			<header>
				<img src="https://fdc3.finos.org/img/fdc3-icon-2019.svg" />
				<h1>
					FDC3 Testing Component
				</h1>
			</header>
			<Apps></Apps>
			<Intents></Intents>
			<Channels></Channels>
			<Context></Context>
		</div>
	);
}

const fdc3OnReady = (cb) => window.fdc3 ? cb() : window.addEventListener('fdc3Ready', cb)

// render component when FSBL is ready.
const FSBLReady = () => fdc3OnReady(() =>
	ReactDOM.render(
		<FDC3Tester />,
		document.getElementById("FDC3Tester-component-wrapper")
	)
)

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady);
} else {
	window.addEventListener("FSBLReady", FSBLReady);
}
