import React, { useState, useContext } from 'react';
import {
    Form, TextArea, Message,
} from 'semantic-ui-react';

import IntentLabel from '../common/IntentLabel';
import SaveButton from '../../utils/SaveButton';
import { useInsertExamples } from './hooks';
import { wrapMeteorCallback } from '../../utils/Errors';
import { ProjectContext } from '../../../layouts/context';

function IntentBulkInsert() {
    const [text, setText] = useState('');
    const [intent, setIntent] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const { project: { _id: projectId }, language } = useContext(ProjectContext);
    const [insertExamples] = useInsertExamples({ projectId, language });

    const onNewExamples = (examples, callback) => {
        insertExamples({ variables: { examples } }).then(
            res => wrapMeteorCallback(callback)(null, res),
            wrapMeteorCallback(callback),
        );
    };

    function onSaveExamples() {
        setSaving(true);
        setSaved(false);

        const examples = text
            .split('\n')
            .filter((item) => {
                const reg = /^\s*$/;
                return !reg.exec(item);
            })
            .map(t => ({ text: t, intent }));

        onNewExamples(examples, (err) => {
            if (!err) {
                setSaved(true);
                setSaving(false);
                setIntent(null);
                setText('');
            } else {
                setSaving(false);
            }
        });
    }

    return (
        <div className='glow-box extra-padding no-margin' id='intent-bulk-insert'>
            <Message info content='One example per line' />
            <br />
            <Form>
                <TextArea
                    className='batch-insert-input'
                    rows={15}
                    value={text}
                    autoheight='true'
                    disabled={saving}
                    onChange={e => setText(e.target.value)}
                />
                <Message info content='Select an existing intent or type to create a new one' />
                <div className='side-by-side'>
                    <IntentLabel
                        value={intent}
                        allowEditing
                        allowAdditions
                        onChange={i => setIntent(i)}
                    />
                    <SaveButton
                        onSave={onSaveExamples}
                        disabled={!intent || !text}
                        saved={saved}
                    />
                </div>
            </Form>
        </div>
    );
}

IntentBulkInsert.propTypes = {};

export default IntentBulkInsert;
