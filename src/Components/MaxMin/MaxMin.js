import React from 'react';

function MaxMin({ wsMaxMin, value, max, min, setMax, setMin }) {
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

	return (
		<div>
			24h Max {max}
			<br />
			24h Min {min}
		</div>
	);
}

export default MaxMin;
