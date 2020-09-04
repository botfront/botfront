
import React from 'react';
import {
    Form, Popup, Button,
} from 'semantic-ui-react';

import IconButton from '../../common/IconButton';
import { clearTypenameField } from '../../../../lib/client.safe.utils';
import UserUtteranceViewer from '../common/UserUtteranceViewer';
import { ExampleTextEditor } from '../../example_editor/ExampleTextEditor';
import 'react-s-alert/dist/s-alert-default.css';
import getColor from '../../../../lib/getColors';
import IntentLabel from '../common/IntentLabel';


const canonicalTooltip = (jsx, canonical) => {
    if (!canonical) return jsx;
    return (
        <Popup
            trigger={<div>{jsx}</div>}
            inverted
            content='Cannot edit a canonical example'
        />
    );
};


export const createRenderIntent = (selection, onEditExample, singleSelectedIntentLabelRef) => ((row) => {
    const { datum } = row;
    const { metadata: { canonical = false } = {}, intent } = datum;
    return canonicalTooltip(
        <IntentLabel
            {...(selection.length === 1 && datum._id === selection[0] ? { ref: singleSelectedIntentLabelRef } : {})}
            value={intent}
            allowEditing={!canonical}
            allowAdditions
            onChange={i => onEditExample(clearTypenameField({ ...datum, intent: i }))}
        />,
        canonical,
    );
});

export const createRenderExample = (editExampleId, handleExampleTextareaBlur, onEditExample) => ((row) => {
    const { datum } = row;
    const { metadata: { canonical = false } = {}, _id } = datum;

    if (editExampleId === _id) {
        return (
            <Form className='example-editor-form' data-cy='example-editor-form'>
                <ExampleTextEditor
                    inline
                    autofocus
                    example={datum}
                    onBlur={handleExampleTextareaBlur}
                    onEnter={handleExampleTextareaBlur}
                    disableNewEntities
                />
            </Form>
        );
    }
    return canonicalTooltip(
        <div className='example-table-row'>
            <UserUtteranceViewer
                value={datum}
                onChange={(example) => {
                    onEditExample(clearTypenameField(example));
                }}
                projectId=''
                disableEditing={canonical}
                showIntent={false}
            />
        </div>,
        canonical,
    );
});

export const createRenderDelete = deleteExamples => ((row) => {
    const { datum } = row;
    const { metadata: { canonical = false } = {} } = datum;
    if (canonical) { return null; }
    return (
        <IconButton
            icon='trash'
            basic
            onClick={() => deleteExamples(datum._id)}
        />
    );
});

export const createRenderCanonical = switchCanonical => ((row) => {
    const { datum } = row;
    const { metadata: { canonical = false } = {} } = datum;

    let toolTip = (<div>Mark as canonical</div>);
    if (canonical) {
        toolTip = (
            <>
                <Popup.Header>Canonical Example</Popup.Header>
                <Popup.Content className='popup-canonical'>
                    This example is canonical for the intent
                    <span className='intent-name'> {datum.intent}</span>

                    {datum.entities && datum.entities.length > 0
                        ? (
                            <>
                                &nbsp; and for the following entity - entity value combinations: <br />
                                {datum.entities.map(entity => (
                                    <span><strong style={{ color: getColor(entity.entity).backgroundColor }}>{entity.entity}</strong>: {entity.value}</span>
                                ))}
                            </>
                        )
                        : ''}
                </Popup.Content>
            </>
        );
    }
    

    return (
        <Popup
            position='top center'
            disabled={toolTip === null}
            trigger={(
                <div>
                    <IconButton
                        color={canonical ? 'black' : 'grey'}
                        active={canonical}
                        icon='gem'
                        basic
                        disabled={toolTip === null}
                        onClick={() => {
                            switchCanonical(datum);
                        }}
                        data-cy='icon-gem'
                    />
                </div>
            )}
            inverted={!canonical}
            content={toolTip}
        />
    );
});


export const createRenderEditExample = setEditExampleId => ((row) => {
    const { datum } = row;
    const { metadata: { canonical = false } = {}, _id } = datum;
    if (canonical) { return null; }
    return (
        <IconButton
            active={canonical}
            icon='edit'
            basic
            onClick={() => setEditExampleId(_id)
            }
        />
    );
});

export const createRenderDraft = onEditExample => ((row) => {
    const { datum } = row;
    const { metadata: { draft } } = datum;
    if (draft) {
        return (
            <Button
                size='mini'
                compact
                content='draft'
                onClick={() => { onEditExample(clearTypenameField({ ...datum, metadata: { ...datum.metadata, draft: false } })); }}
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            />
        );
    }
    return <></>;
});
