import React from 'react';
import { Provider } from 'react-redux';
import store from '../imports/ui/store/store';

export const withProvider = (story) => (
    <Provider store={store}>
        {story()}
    </Provider>
);
