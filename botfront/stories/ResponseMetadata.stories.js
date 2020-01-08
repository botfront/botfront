import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import ResponseMetadataForm from '../imports/ui/components/templates/MetadataForm';

const metadata = {
    linkTarget: '_self',
    userInput: 'disable',
    userInputHint: 'blabla',
    domHighlight: {
        selector: '.something',
        css: 'color: white',
    },
    pageChangeCallbacks: {
        pageChanges: [
            {
                url: 'http://google.com',
                callbackIntent: 'new_intent',
            },
        ],
        errorIntent: 'error',
    },
    customCss: {
        text: 'color: red',
        messageContainer: 'background: red',
    },
};

const ResponseMetadataWrapped = props => <ResponseMetadataForm {...props} />;

storiesOf('Response Metadata', module)
    .addDecorator(withKnobs)
    .add('Empty', () => <ResponseMetadataWrapped responseMetadata={null} onChange={console.log} />)
    .add('With data', () => <ResponseMetadataWrapped responseMetadata={metadata} onChange={console.log} />);
