import React, { useState } from 'react';
import './Navigation.css';

import Orderbook from '../Orderbook/Orderbook';
import Select from 'react-select';
import MaxMin from '../MaxMin/MaxMin';
import Big from 'big.js';

let ws = new WebSocket('wss://api.zonda.exchange/websocket/');
let wsMaxMin = new WebSocket('wss://api.zonda.exchange/websocket/');
let seqNo = 0;

function Navigation() {
	const [ value, setValue ] = useState('btc-pln');
	const [ offers, setOffers ] = useState([]);
	const [ max, setMax ] = useState(0);
	const [ min, setMin ] = useState(0);

	const options = [
		{ value: 'btc-pln', label: 'BTC-PLN' },
		{ value: 'ltc-pln', label: 'LTC-PLN' },
		{ value: 'eth-pln', label: 'ETH-PLN' }
	];

	const unsubsribe = () => {
		ws.send(
			JSON.stringify({
				action: 'unsubscribe',
				module: 'trading',
				path: `orderbook-limited/${value}/10`
			})
		);
		wsMaxMin.send(
			JSON.stringify({
				action: 'unsubscribe',
				module: 'trading',
				path: `stats/${value}`
			})
		);
	};

	const subsribe = () => {
		ws = new WebSocket('wss://api.zonda.exchange/websocket/');
		ws.onopen = function() {
			ws.send(
				JSON.stringify({
					action: 'subscribe-public',
					module: 'trading',
					path: `orderbook-limited/${value}/10`
				})
			);
		};

		wsMaxMin = new WebSocket('wss://api.zonda.exchange/websocket/');
		wsMaxMin.onopen = function() {
			wsMaxMin.send(
				JSON.stringify({
					action: 'subscribe-public',
					module: 'trading',
					path: `stats/${value}`
				})
			);
		};
	};

	const handleValue = (value) => {
		unsubsribe();
		setOffers([]);
		setValue(value);
		setMax(0);
		setMin(0);
		subsribe();
	};

	//Lost push, clean array again
	for (let i = 0; i < offers.length; i++) {
		if (offers[i].marketCode !== value.toUpperCase()) {
			setOffers([]);
		}
	}

	const spread = () => {
		for (let i = 2; i < offers.length; i++) {
			if (offers[i].entryType === 'Sell') {
				return (offers[i].price - offers[i - 1].price).toFixed(2);
			}
		}
	};

	return (
		<div>
			<div className="container">
				<header>
					<div className="select">
						<Select
							options={options}
							onChange={({ value }) => handleValue(value)}
							defaultValue={{ value: 'btc-pln', label: 'BTC-PLN' }}
						/>
					</div>

					<div className="spread">{spread()}</div>

					<div className="price">
						<MaxMin wsMaxMin={wsMaxMin} value={value} setMax={setMax} setMin={setMin} max={max} min={min} />
					</div>
				</header>
			</div>
			<Orderbook ws={ws} value={value} offers={offers} setOffers={setOffers} seqNo={seqNo} />
		</div>
	);
}

export default Navigation;
