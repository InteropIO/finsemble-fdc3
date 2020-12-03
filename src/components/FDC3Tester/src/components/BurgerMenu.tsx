import React, { useState } from "react";

export default function BurgerMenu() {
	const [menuVisible, setMenuVisible] = useState(false);

	const BurgerIcon = () => (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			className="burger-icon"
			viewBox="0 0 24 24"
			fill="white"
			width="18px"
			height="18px"
			onClick={() => setMenuVisible(true)}
		>
			<path d="M0 0h24v24H0z" fill="none" />
			<path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
		</svg>
	);

	const CloseIcon = () => (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			className="close-icon"
			height="24"
			viewBox="0 0 24 24"
			width="24"
			onClick={() => setMenuVisible(false)}
		>
			<path d="M0 0h24v24H0z" fill="none" />
			<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
		</svg>
	);

	const menuItems = [
		{
			apiName: "Apps",
			apiMethods: ["open"],
		},
		{
			apiName: "Intents",
			apiMethods: ["findIntent", "findIntentsByContext", "raiseIntent", "addIntentListener"],
		},
		{
			apiName: "Channels",
			apiMethods: [
				"getOrCreateChannel",
				"getSystemChannels",
				"joinChannel",
				"getCurrentChannel",
				"leaveCurrentChannel",
			],
		},
		{
			apiName: "Context",
			apiMethods: ["broadcast", "addContextListener"],
		},
	];

	return (
		<div>
			<BurgerIcon />
			<div className={menuVisible ? "burger-menu burger-menu__visible" : "burger-menu burger-menu__hidden"}>
				<CloseIcon />
				{menuItems.map(({ apiName, apiMethods }) => (
					<>
						<h3>{apiName}</h3>
						{apiMethods.map((method) => (
							<a onClick={() => setMenuVisible(false)} className="menu-item" href={`#api-${method}`}>
								{method}
							</a>
						))}
					</>
				))}
			</div>
		</div>
	);
}
