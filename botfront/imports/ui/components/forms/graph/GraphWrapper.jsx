import { ReactFlowProvider } from 'react-flow-renderer';
import React from 'react';

import Graph, { GraphPropTypes } from './Graph';

export default function GraphWrapper(props) {
    return (
        <ReactFlowProvider>
            <Graph {...props} />
        </ReactFlowProvider>
    );
}

GraphWrapper.propTypes = {
    ...GraphPropTypes,
};
