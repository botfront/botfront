import React from 'react';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import ResponseEditor from '../../imports/ui/components/templates/templates-list/BotResponseEditor';

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

export default {
    title: '_broken/ResponseEditor',
    component: ResponseEditor,
    decorators: [withKnobs],
};

export const Basic = () => () => <ResponseEditorWrapped active={boolean('active', true)} botResponse={sampleResponse} />;
