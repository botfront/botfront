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

export async function populateActivity(instance, examples, modelId, callback) {
    return Meteor.call('rasa.parse', instance, examples, wrapMeteorCallback(async (err, activity) => {
        if (err) throw new Error(err);
        const data = (Array.isArray(activity) ? activity : [activity]).map((a) => {
            const cleanA = a;
            if (cleanA.intent_ranking) delete cleanA.intent_ranking;
            if (cleanA.language) delete cleanA.language;
            if (cleanA.intent && 'name' in cleanA.intent) {
                cleanA.confidence = cleanA.intent.confidence;
                cleanA.intent = cleanA.intent.name;
            }
            if (cleanA.entities) cleanA.entities = cleanA.entities.filter(e => e.extractor !== 'ner_duckling_http');
            return cleanA;
        });

        await apolloClient.mutate({ mutation: upsertActivityMutation, variables: { modelId, data } });
        if (callback) callback();
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
            populateActivity(instance, examples, modelId, () => { setText(''); setLoading(false); });
        } catch (e) { setLoading(false); }
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
