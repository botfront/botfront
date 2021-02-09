import React from 'react';
import { storiesOf } from '@storybook/react';
import Graph from '../../imports/ui/components/forms/graph/GraphWrapper';
import { withBackground } from '../../.storybook/decorators';

const WrappedGraph = () => (
    <div style={{
        width: 1200, height: 700, border: 'black 1px solid', position: 'relative',
    }}
    >
        <Graph formName='test' />
    </div>
);

storiesOf('Forms slots graph', module)
    .addDecorator(withBackground)
    .add('init Graph', () => (
        <WrappedGraph />
    ));
