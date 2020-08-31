import React, { useEffect, useState, useRef } from 'react';
import {
    Form, Popup,
} from 'semantic-ui-react';
import Alert from 'react-s-alert';
import DataTable from '../../common/DataTable';
import IntentLabel from '../common/IntentLabel';
import IconButton from '../../common/IconButton';
import { clearTypenameField } from '../../../../lib/client.safe.utils';
import UserUtteranceViewer from '../common/UserUtteranceViewer';
import { ExampleTextEditor } from '../../example_editor/ExampleTextEditor';
import { wrapMeteorCallback } from '../../utils/Errors';
import { _appendSynonymsToText } from '../../../../lib/filterExamples';
import 'react-s-alert/dist/s-alert-default.css';
import getColor from '../../../../lib/getColors';

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
        return canonicalTooltip(
            <IntentLabel
                value={intent}
                allowEditing={!canonical}
                allowAdditions
                onChange={i => onEditExample(clearTypenameField({ ...datum, intent: i }))}
            />,
            canonical,
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
        const { metadata: { canonical = false } } = datum;
   
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
                            onClick={async () => {
                                const result = await switchCanonical({ variables: { projectId: datum.projectId, language: datum.metadata.language, example: clearTypenameField(datum) } });
                                /* length === 2 mean that there is 2 examples that have changed,
                                so one took the place of another as a cannonical */
                                if (result?.data?.switchCanonical?.length === 2) {
                                    Alert.warning(`The previous canonical example with the same intent 
                                and entity - entity value combination 
                                (if applicable) with this example has been unmarked canonical`, {
                                        position: 'top-right',
                                        timeout: 5000,
                                    });
                                }
                            }}
                            data-cy='icon-gem'
                        />
                    </div>
                )}
                inverted={!canonical}
                content={toolTip}
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
