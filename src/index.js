import React from 'react';
import ReactDOM from 'react-dom';

// Redux
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from './reducers'

import App from './components/app/app';

// Style
import './style/index.scss';
import './style/print.scss';

// Create the redux store
let store = createStore(rootReducer);

ReactDOM.render(
    <Provider store={ store }>
        <App />
    </Provider>,
    document.getElementById('root')
);