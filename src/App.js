import React, { useState } from 'react';
import './App.css';
import Select from 'react-select';
import MaxMin from './Components/MaxMin/MaxMin';
import Spread from './Components/Spread/Spread';
import Orderbook from './Components/Orderbook/Orderbook';

function App() {
	const [ value, setValue ] = useState('btc-pln');

	const options = [
		{ value: 'btc-pln', label: 'BTC-PLN' },
		{ value: 'ltc-pln', label: 'LTC-PLN' },
		{ value: 'eth-pln', label: 'ETH-PLN' }
	];

	const handleValue = (value) => {
		setValue(value);
	};

	return (
		<div className="App">
			<div className="container">
				<header>
					<div className="select">
						<Select
							options={options}
							onChange={({ value }) => handleValue(value)}
							defaultValue={{ value: 'btc-pln', label: 'BTC-PLN' }}
						/>
					</div>

					<div className="spread">
						<Spread value={value} />
					</div>

					<div className="price">
						<MaxMin value={value} />
					</div>
				</header>
			</div>
			<Orderbook value={value} />
		</div>
	);
}

export default App;
