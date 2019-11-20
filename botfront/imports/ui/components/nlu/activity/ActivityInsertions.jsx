import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    Form,
    Message,
    TextArea,
    Tab,
} from 'semantic-ui-react';
import { upsertActivity as upsertActivityMutation } from './mutations';
import apolloClient from '../../../../startup/client/apollo';
import { wrapMeteorCallback } from '../../utils/Errors';

export async function populateActivity(instance, examples, modelId) {
    return Meteor.call('rasa.parse', instance, examples, wrapMeteorCallback(async (err, activity) => {
        if (err) throw new Error(err);
        const data = Array.isArray(activity) ? activity : [activity];
        data.forEach((a) => {
            if (a.intent_ranking) delete a.intent_ranking;
            if (a.language) delete a.language;
            if (a.intent && 'name' in a.intent) {
                a.confidence = a.intent.confidence;
                a.intent = a.intent.name;
            }
            if (a.entities) a.entities = a.entities.filter(e => e.extractor !== 'ner_duckling_http');
        });

        const resp = await apolloClient.mutate({ mutation: upsertActivityMutation, variables: { modelId, data } });
        return resp;
    }));
}

export default function ActivityInsertions(props) {
    const {
        model: { _id: modelId, language: lang }, instance,
    } = props;
    const MAX_LINES = 50;
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);

    const onTextChanged = (e, { value }) => setText(value.split('\n').slice(0, MAX_LINES).join('\n'));

    const saveExamples = () => {
        setLoading(true);
        
        const examples = text.split('\n')
            .filter(t => !t.match(/^\s*$/))
            .map(t => ({ text: t, lang }));
        try {
            populateActivity(instance, examples, modelId);
            setText('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Tab.Pane>
            <Message info content='Add utterances below (one per line, 50 max). When you click on Add Utterances, they will be processed and the output will be shown in the New Utterances tab' />
            <br />
            <Form>
                <TextArea
                    rows={15}
                    value={text}
                    autoheight='true'
                    disabled={loading}
                    onChange={onTextChanged}
                />
                <br />
                <br />
                <Button loading={loading} onClick={saveExamples} disabled={!text || loading}>Add Utterances</Button>
            </Form>
        </Tab.Pane>
    );
}

ActivityInsertions.propTypes = {
    model: PropTypes.object.isRequired,
    instance: PropTypes.object.isRequired,
};
