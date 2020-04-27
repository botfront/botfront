import React from 'react';
import ResponseMetadataForm from '../../imports/ui/components/templates/MetadataForm.ce';

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

export default {
    title: '_broken/ResponseMetadataForm',
    component: ResponseMetadataForm,
};

export const Empty = () => () => <ResponseMetadataWrapped responseMetadata={null} onChange={console.log} />;
export const WithData = () => () => <ResponseMetadataWrapped responseMetadata={metadata} onChange={console.log} />;
