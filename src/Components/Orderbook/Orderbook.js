import React, { useEffect, useState } from 'react';
import './Orderbook.css';

let temporaryOffers = [];

function Orderbook({ value }) {
	const [ offers, setOffers ] = useState([]);

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
							temporaryOffers = temporaryOffers.filter((item) => item.price !== message.changes[i].rate);
							let offer = {
								price: message.changes[i].rate,
								amount: message.changes[i].state.ca,
								pln: message.changes[i].state.ra * message.changes[i].state.ca,
								offer: message.changes[i].state.co,
								entryType: message.changes[i].entryType,
								marketCode: message.changes[i].marketCode,
								seqNo: JSON.parse(msg.data).seqNo
							};

							temporaryOffers.push(offer);
						}
						if (message.changes[i].action === 'remove') {
							temporaryOffers = temporaryOffers.filter(
								(item) => Number(item.price) !== Number(message.changes[i].rate)
							);
						}
					}

					temporaryOffers.seqNo = JSON.parse(msg.data).seqNo;
					setOffers(temporaryOffers);
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
				temporaryOffers = [];
				setOffers([]);
			};
		},
		[ value ]
	);
	//Lost push, clean array again
	for (let i = 0; i < offers.length; i++) {
		if (offers[i].marketCode !== value.toUpperCase()) {
			setOffers([]);
			temporaryOffers = [];
		}
	}

	return (
		<div className="flex-container">
			<div className="Buy">
				BID
				{offers.sort((a, b) => b.price.localeCompare(a.price)).map(
					(item) =>
						item.entryType === 'Buy' ? (
							<div key={Number(item.price) * Number(item.pln)}>
								<span className="list rate">{Number(item.price).toFixed(2)}</span>
								<span className="list amount">{Number(item.amount).toFixed(8)} </span>
								<span className="list priceorderbook">{Number(item.pln).toFixed(2)} </span>
								<span className="list offer">{Number(item.offer).toFixed(0)}</span>
							</div>
						) : null
				)}
			</div>

			<div className="Sell">
				ASK
				{offers.sort((a, b) => a.price.localeCompare(b.price)).map(
					(item) =>
						item.entryType === 'Sell' ? (
							<div key={Number(item.price) * Number(item.pln)}>
								<span className="list rate">{Number(item.price).toFixed(2)}</span>
								<span className="list amount">{Number(item.amount).toFixed(8)} </span>
								<span className="list priceorderbook">{Number(item.pln).toFixed(2)} </span>
								<span className="list offer">{Number(item.offer).toFixed(0)}</span>
							</div>
						) : null
				)}
			</div>
		</div>
	);
}

export default Orderbook;
