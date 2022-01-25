import React, { useEffect, useState } from 'react';

function MaxMin({ value }) {
	const [ max, setMax ] = useState(0);
	const [ min, setMin ] = useState(0);

	useEffect(
		() => {
			const wsMaxMin = new WebSocket('wss://api.zonda.exchange/websocket/');
			wsMaxMin.onopen = function() {
				wsMaxMin.send(
					JSON.stringify({
						action: 'subscribe-public',
						module: 'trading',
						path: `stats/${value}`
					})
				);
			};

			wsMaxMin.onmessage = function(msg) {
				if (JSON.parse(msg.data).message) {
					setMax(JSON.parse(msg.data).message[0].h);
					setMin(JSON.parse(msg.data).message[0].l);
				}
			};

			return () => {
				wsMaxMin.send(
					JSON.stringify({
						action: 'unsubscribe',
						module: 'trading',
						path: `stats/${value}`
					})
				);
				setMax(0);
				setMin(0);
			};
		},
		[ value ]
	);

	return (
		<div>
			24h Max {max}
			<br />
			24h Min {min}
		</div>
	);
}

export default MaxMin;
