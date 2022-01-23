import React, { useState } from 'react';
import './Orderbook.css';

// let seqNo = 0;
let temporaryOffers = [];

function Orderbook({ ws, value, offers, setOffers, seqNo, label }) {
	temporaryOffers = offers;

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
		if (JSON.parse(msg.data).message) {
			for (let i = 0; i < JSON.parse(msg.data).message.changes.length; i++) {
				if (
					JSON.parse(msg.data).message.changes[i].action === 'update' ||
					JSON.parse(msg.data).message.changes[i].marketCode === label
				) {
					temporaryOffers = temporaryOffers.filter(
						(item) => item.price !== JSON.parse(msg.data).message.changes[i].rate
					);
					let offer = {
						price: JSON.parse(msg.data).message.changes[i].rate,
						amount: JSON.parse(msg.data).message.changes[i].state.ca,
						pln:
							JSON.parse(msg.data).message.changes[i].state.ra *
							JSON.parse(msg.data).message.changes[i].state.ca,
						offer: JSON.parse(msg.data).message.changes[i].state.co,
						entryType: JSON.parse(msg.data).message.changes[i].entryType
					};

					temporaryOffers.push(offer);
				}
				if (JSON.parse(msg.data).message.changes[i].action === 'remove') {
					temporaryOffers = temporaryOffers.filter(
						(item) => item.price !== JSON.parse(msg.data).message.changes[i].rate
					);
				}
			}

			seqNo = JSON.parse(msg.data).seqNo;
			// console.log(seqNo);
			setOffers(temporaryOffers);
		}
	};

	return (
		<div className="flex-container">
			<div className="Buy">
				{offers.sort((a, b) => b.price.localeCompare(a.price)).map(
					(item, index) =>
						item.entryType === 'Buy' ? (
							<div>
								<span className="list rate">{Number(item.price).toFixed(2)}</span>
								<span className="list amount">{Number(item.amount).toFixed(8)} </span>
								<span className="list priceorderbook">{Number(item.pln).toFixed(2)} </span>
								<span className="list offer">{Number(item.offer).toFixed(0)}</span>
							</div>
						) : null
				)}
			</div>

			<div className="Sell">
				{offers.sort((a, b) => a.price.localeCompare(b.price)).map(
					(item, index) =>
						item.entryType === 'Sell' ? (
							<div>
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
