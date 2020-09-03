import React, {
    useEffect, useState, useRef, useContext,
} from 'react';
import {
    Form, Popup, Grid, Checkbox, Icon, Confirm, Button,
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
import Filters from './Filters';
import { ProjectContext } from '../../../layouts/context';
import NluCommandBar from './NluCommandBar';
import { useEventListener } from '../../utils/hooks';

function NluTable(props) {
    const {
        entitySynonyms,
        loadingExamples,
        data,
        updateExamples,
        deleteExamples,
        switchCanonical,
        loadMore,
        hasNextPage,
        hideHeader,
        updateFilters,
        filters,
    } = props;
    const { intents, entities } = useContext(ProjectContext);
    const { project: { _id: projectId }, language } = useContext(ProjectContext);

    const tableRef = useRef(null);
    const nluCommandBarRef = useRef(null);
    const [confirm, setConfirm] = useState(null);
    const singleSelectedIntentLabelRef = useRef(null);
    
    
    const [examples, setExamples] = useState([]);
    const [selection, setSelection] = useState([]);
    const [editExampleId, setEditExampleId] = useState([]);

    function multipleDelete(ids) {
        const message = `Delete ${ids.length} NLU examples?`;
        const action = () => deleteExamples({ variables: { ids } });
        setConfirm({ message, action });
    }

    function multipleUndraft(ids) {
        const message = `Remove draft status of  ${ids.length} NLU examples`;
        const examplesToUpdate = ids.map(_id => ({ _id, metadata: { draft: false } }));
        const action = () => updateExamples({ variables: { examples: examplesToUpdate, projectId, language } });
        setConfirm({ message, action });
    }

    function multipleSetIntent(ids, intent) {
        const message = `Change intent to ${intent} for ${ids.length} NLU examples?`;
        const examplesToUpdate = ids.map(_id => ({ _id, intent }));
        const action = () => updateExamples({ variables: { examples: examplesToUpdate, projectId, language } });
        setConfirm({ message, action });
    }

    const handleOpenIntentSetterDialogue = () => {
        if (!selection.length) return null;
        if (selection.length === 1) return singleSelectedIntentLabelRef.current.openPopup();
        return nluCommandBarRef.current.openIntentPopup();
    };
    useEventListener('keydown', (e) => {
        const {
            key, shiftKey, metaKey, ctrlKey, altKey,
        } = e;
        if (shiftKey || metaKey || ctrlKey || altKey) return;
        if (!!confirm) {
            if (key.toLowerCase() === 'n') setConfirm(null);
            if (key.toLowerCase() === 'y' || key === 'Enter') { confirm.action(); setConfirm(null); }
            return;
        }
        
        if (e.target !== tableRef.current.tableRef().current) return;
        if (selection.length === 0 && key.toLowerCase() === 'c') {
            updateFilters({ ...filters, onlyCanonicals: !filters.onlyCanonicals });
        }
        if (key === 'Escape') setSelection([]);
        if (key.toLowerCase() === 'd') multipleDelete(selection);
        if (key.toLowerCase() === 'u') multipleUndraft(selection);
        
        if (key.toLowerCase() === 'i') {
            e.stopPropagation();
            e.preventDefault();
            handleOpenIntentSetterDialogue(e);
        }
    });
    const onEditExample = (example, callback) => {
        updateExamples({ variables: { examples: [example], projectId, language } }).then(
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
                {...(selection.length === 1 && datum._id === selection[0] ? { ref: singleSelectedIntentLabelRef } : {})}
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
                                so one took the place of another as a canonical */
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

    const renderDraft = (row) => {
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
            {
                key: 'draft', style: { width: '70px' }, render: renderDraft,
            },
            { key: 'edit', style: { width: '50px' }, render: renderEditExample },
            { key: 'delete', style: { width: '50px' }, render: renderDelete },
            { key: 'canonical', style: { width: '50px' }, render: renderCanonical },
        ];
        return (
            <>
                {!!confirm && (
                    <Confirm
                        open
                        className='with-shortcuts'
                        cancelButton='No'
                        confirmButton='Yes'
                        content={confirm.message}
                        onCancel={() => {
                            setConfirm(null);
                            tableRef.current.tableRef().current.focus();
                        }}
                        onConfirm={() => { confirm.action(); setConfirm(null); tableRef.current.tableRef().current.focus(); }}
                    />
                )}
                {!hideHeader && (
                    <Grid style={{ paddingBottom: '12px' }}>
                        <Grid.Row>
                            <Grid.Column width={13} textAlign='left' verticalAlign='middle'>
                                <Filters
                                    intents={intents}
                                    entities={entities}
                                    filter={filters}
                                    onChange={newFilters => updateFilters(newFilters)}
                                />
                                
                            </Grid.Column>

                          
                            <Grid.Column width={3} textAlign='right' verticalAlign='middle'>
                                <Checkbox
                                    onChange={() => updateFilters({ ...filters, onlyCanonicals: !filters.onlyCanonicals })
                                    }
                                    hidden={false}
                                    slider
                                    checked={filters.onlyCanonicals}
                                    data-cy='only-canonical'
                                    readOnly={false}
                                    className='only-canonical'
                                />
                                <Popup
                                    trigger={
                                        <Icon name='gem' color={filters.onlyCanonicals ? 'black' : 'grey'} />
                                    }
                                    content='Only show canonicals examples'
                                    position='top center'
                                    inverted
                                />
                            
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                )}
                <DataTable
                    ref={tableRef}
                    columns={columns}
                    data={examples}
                    hasNextPage={hasNextPage}
                    loadMore={loadingExamples ? () => { } : loadMore}
                    rowClassName='glow-box hoverable'
                    className='new-utterances-table'
                    selection={selection}
                    onChangeSelection={(newSelection) => {
                        setSelection(newSelection);
                    }}
                />
                {selection.length > 1 && (
                    <NluCommandBar
                        ref={nluCommandBarRef}
                        selection={selection}
                        onSetIntent={multipleSetIntent}
                        onDelete={multipleDelete}
                        onUndraft={multipleUndraft}
                        onCloseIntentPopup={() => tableRef.current.tableRef().current.focus()}
                    />
                )}
            </>
        );
    };
    return renderDataTable();
}


export default NluTable;
