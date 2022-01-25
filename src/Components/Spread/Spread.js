import React, { useEffect, useState } from 'react';
import Decimal from 'decimal.js';
let temporratyPrice = [];

function Spread({ value }) {
	const [ spread, setSpread ] = useState(0);

	useEffect(
		() => {
			const ws = new WebSocket('wss://api.zonda.exchange/websocket/');
			ws.onopen = function() {
				ws.send(
					JSON.stringify({
						action: 'subscribe-public',
						module: 'trading',
						path: `orderbook-limited/${value}/10`
					})
				);
			};

			ws.onmessage = function(msg) {
				let message = JSON.parse(msg.data).message;
				if (message) {
					for (let i = 0; i < message.changes.length; i++) {
						if (message.changes[i].action === 'update') {
							temporratyPrice = temporratyPrice.filter(
								(item) => item.price !== JSON.parse(msg.data).message.changes[i].rate
							);
							let price = {
								price: message.changes[i].rate,
								entryType: message.changes[i].entryType,
								marketCode: message.changes[i].marketCode
							};
							temporratyPrice.push(price);
						}
						if (message.changes[i].action === 'remove') {
							temporratyPrice = temporratyPrice.filter(
								(item) => Number(item.price) !== Number(JSON.parse(msg.data).message.changes[i].rate)
							);
						}
					}
				}
				temporratyPrice = temporratyPrice.sort((a, b) => a.price.localeCompare(b.price));
				for (let i = 2; i < temporratyPrice.length; i++) {
					if (temporratyPrice[i].entryType === 'Sell') {
						const test = new Decimal(temporratyPrice[i].price).minus(temporratyPrice[i - 1].price);
						console.log(test.toFixed(2));
						setSpread(test.toFixed(2));
						break;
					}
				}
			};

			return () => {
				ws.send(
					JSON.stringify({
						action: 'unsubscribe',
						module: 'trading',
						path: `orderbook-limited/${value}/10`
					})
				);
				temporratyPrice = [];
				setSpread(0);
				console.log(temporratyPrice);
			};
		},
		[ value ]
	);

	return <div>{spread}</div>;
}

export default Spread;
