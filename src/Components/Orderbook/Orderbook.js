import React from 'react';
import './Orderbook.css';

let temporaryOffers = [];

function Orderbook({ ws, value, offers, setOffers }) {
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
					JSON.parse(msg.data).message.changes[i].action === 'update' &&
					offers.seqNo === JSON.parse(msg.data).seqNo - 1
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
						entryType: JSON.parse(msg.data).message.changes[i].entryType,
						marketCode: JSON.parse(msg.data).message.changes[i].marketCode,
						seqNo: JSON.parse(msg.data).seqNo
					};

					temporaryOffers.push(offer);
				}
				if (JSON.parse(msg.data).message.changes[i].action === 'remove') {
					temporaryOffers = temporaryOffers.filter(
						(item) => Number(item.price) !== Number(JSON.parse(msg.data).message.changes[i].rate)
					);
				}
			}

			temporaryOffers.seqNo = JSON.parse(msg.data).seqNo;
			setOffers(temporaryOffers);
		}
	};

	return (
		<div className="flex-container">
			<div className="Buy">
				BID
				{offers.sort((a, b) => b.price.localeCompare(a.price)).map(
					(item, index) =>
						item.entryType === 'Buy' ? (
							<div key={index}>
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
					(item, index) =>
						item.entryType === 'Sell' ? (
							<div key={index}>
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
