import { Provider } from 'react-redux';
import React, { Component } from 'react';
import Nav from './src/view/Nav';

import store from './src/store/index'

import AudioCore from './src/component/AudioCore';

import { MenuProvider } from 'react-native-popup-menu';

class App extends Component {
	render() {
		return (
			<Provider store={store}>
				<MenuProvider>
					<Nav></Nav>
					<AudioCore></AudioCore>
				</MenuProvider>
			</Provider>
		);
	}
}

export default App;
