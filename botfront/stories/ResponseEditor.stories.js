import React, { useState, useContext } from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import ResponseEditor from '../imports/ui/components/templates/templates-list/ResponseEditor';
import { withProjectContext } from '../.storybook/decorators';

const sampleResponse = {
    _id: 'testId',
    key: 'utter_get_started',
    values: [{ sequence: [{ content: 'text: Hello I am a chatbot' }, { content: 'text: how can I help ypu?' }], lang: 'en' }],
    projectId: 'chitchat-7iM2cXkV',
};

const ResponseEditorWrapped = (props) => {
    console.log();
    return (<ResponseEditor {...props} />);
};

storiesOf('AAAAResponseEditor', module)
    .addDecorator(withKnobs)
    .add('default', () => <ResponseEditorWrapped active={boolean('active', true)} botResponse={sampleResponse} />);
