import React from 'react';
import { Provider } from 'react-redux';
import store from '../imports/ui/store/store';

export const withProvider = (story) => (
    <Provider store={store}>
        {story()}
    </Provider>
);

export const withBackground = (story) => (
    <div
    style={{
        height: 'auto',
        minHeight: '100vh',
        padding: '15px',
        backgroundColor: '#666',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 200 200\'%3E%3Cdefs%3E%3ClinearGradient id=\'a\' gradientUnits=\'userSpaceOnUse\' x1=\'100\' y1=\'33\' x2=\'100\' y2=\'-3\'%3E%3Cstop offset=\'0\' stop-color=\'%23000\' stop-opacity=\'0\'/%3E%3Cstop offset=\'1\' stop-color=\'%23000\' stop-opacity=\'1\'/%3E%3C/linearGradient%3E%3ClinearGradient id=\'b\' gradientUnits=\'userSpaceOnUse\' x1=\'100\' y1=\'135\' x2=\'100\' y2=\'97\'%3E%3Cstop offset=\'0\' stop-color=\'%23000\' stop-opacity=\'0\'/%3E%3Cstop offset=\'1\' stop-color=\'%23000\' stop-opacity=\'1\'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cg fill=\'%23ca481d\' fill-opacity=\'0.6\'%3E%3Crect x=\'100\' width=\'100\' height=\'100\'/%3E%3Crect y=\'100\' width=\'100\' height=\'100\'/%3E%3C/g%3E%3Cg fill-opacity=\'0.5\'%3E%3Cpolygon fill=\'url(%23a)\' points=\'100 30 0 0 200 0\'/%3E%3Cpolygon fill=\'url(%23b)\' points=\'100 100 0 130 0 100 200 100 200 130\'/%3E%3C/g%3E%3C/svg%3E")',
    }}
    >
        <div
            style={{
                borderRadius: '5px',
                padding: '5px',
                margin: '0 auto',
                width: '90%',
                background: '#fff',
            }}
        >
            {story()}
        </div>
    </div>
)