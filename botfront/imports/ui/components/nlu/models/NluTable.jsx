import React, { useEffect, useState, useRef } from 'react';
import {
    Form, Popup,
} from 'semantic-ui-react';
import DataTable from '../../common/DataTable';
import IntentLabel from '../common/IntentLabel';
import IconButton from '../../common/IconButton';
import { clearTypenameField } from '../../../../lib/client.safe.utils';
import UserUtteranceViewer from '../common/UserUtteranceViewer';
import { ExampleTextEditor } from '../../example_editor/ExampleTextEditor';
import { wrapMeteorCallback } from '../../utils/Errors';
import { _appendSynonymsToText } from '../../../../lib/filterExamples';

function NluTable(props) {
    const {
        entitySynonyms,
        loadingExamples,
        data,
        updateExample,
        deleteExamples,
        switchCanonical,
        loadMore,
        hasNextPage,
    } = props;

    const tableRef = useRef(null);
    const [examples, setExamples] = useState([]);
    const [selection, setSelection] = useState([]);
    const [editExampleId, setEditExampleId] = useState([]);
    const onEditExample = (example, callback) => {
        updateExample({ variables: { example } }).then(
            res => wrapMeteorCallback(callback)(null, res),
            wrapMeteorCallback(callback),
        );
    };

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
    const getExamplesWithExtraSynonyms = (examplesList) => {
        if (!examplesList) return [];
        return examplesList.map(e => _appendSynonymsToText(e, entitySynonyms));
    };
    useEffect(() => {
        if (!loadingExamples) setExamples(getExamplesWithExtraSynonyms(data));
    }, [data]);


    const renderIntent = (row) => {
        const { datum } = row;
        const { metadata: { canonical }, intent } = datum;

        return (
            <IntentLabel
                value={intent}
                allowEditing={!canonical}
                allowAdditions
                onChange={i => onEditExample(clearTypenameField({ ...datum, intent: i }))}
            />

        );
    };


    const handleExampleTextareaBlur = (example) => {
        setEditExampleId(null);
        onEditExample(clearTypenameField(example));
    };

    const renderExample = (row) => {
        const { datum } = row;
        const { metadata: { canonical }, _id } = datum;
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
    };

    const renderDelete = (row) => {
        const { datum } = row;
        const { metadata: { canonical } } = datum;
        if (canonical) { return null; }
        return (
            <IconButton
                icon='trash'
                basic
                onClick={() => deleteExamples({ variables: { ids: [datum._id] } })}
            />
        );
    };

    const renderCanonical = (row) => {
        const { datum } = row;
        const { metadata: { canonical } } = datum;
        return (
            <IconButton
                color={canonical ? 'black' : 'grey'}
                icon='gem'
                basic
                onClick={() => { switchCanonical({ variables: { projectId: datum.projectId, language: datum.metadata.language, example: clearTypenameField(datum) } }); }}
            />
        );
    };

    const renderEditExample = (row) => {
        const { datum } = row;
        const { metadata: { canonical }, _id } = datum;
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
    };


    const renderDataTable = () => {
        const columns = [
            { key: '_id', selectionKey: true, hidden: true },
            {
                key: 'intent',
                style: {
                    paddingLeft: '1rem', width: '200px', minWidth: '200px', overflow: 'hidden',
                },
                render: renderIntent,
            },
            {
                key: 'text', style: { width: '100%' }, render: renderExample,
            },
            { key: 'edit', style: { width: '50px' }, render: renderEditExample },

            { key: 'delete', style: { width: '50px' }, render: renderDelete },
            { key: 'canonincal', style: { width: '50px' }, render: renderCanonical },

        ];
        return (
            <DataTable
                ref={tableRef}
                columns={columns}
                data={examples}
                hasNextPage={hasNextPage}
                loadMore={loadingExamples ? () => { } : loadMore}
                rowClassName='glow-box hoverable'
                className='examples-table'
                selection={selection}
                onChangeSelection={(newSelection) => {
                    setSelection(newSelection);
                }}
            />
        );
    };
    return renderDataTable();
}


export default NluTable;
